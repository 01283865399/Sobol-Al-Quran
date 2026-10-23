/* eslint-disable @typescript-eslint/no-var-requires */
const { app, BrowserWindow, dialog, shell } = require('electron');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { Readable } = require('node:stream');

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.webm': 'video/webm',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};
const MAX_REQUEST_BYTES = 1024 * 1024;

let server;
let applicationUrl;

app.setName('sobul-quran');

function loadLocalEnvironment() {
  const envPath = path.join(app.getPath('userData'), '.env');
  if (!fs.existsSync(envPath)) return;

  const contents = fs.readFileSync(envPath, 'utf8');
  for (const line of contents.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || match[1] !== 'GEMINI_API_KEY' || match[1] in process.env) continue;
    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(message);
}

async function readRequestBody(request) {
  const chunks = [];
  let totalBytes = 0;

  for await (const chunk of request) {
    totalBytes += chunk.length;
    if (totalBytes > MAX_REQUEST_BYTES) {
      throw new RangeError('Request body exceeds the local desktop API limit');
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

function functionForPath(pathname) {
  if (pathname === '/api/chat') {
    return require('../dist-electron/functions/chat.cjs').default;
  }
  if (pathname === '/api/radio') {
    return require('../dist-electron/functions/radio.cjs').default;
  }
  if (pathname.startsWith('/api/media/')) {
    return require('../dist-electron/functions/media.cjs').default;
  }
  return null;
}

async function handleApiRequest(request, response, requestUrl) {
  const handler = functionForPath(requestUrl.pathname);
  if (!handler) {
    sendText(response, 404, 'API endpoint not found');
    return;
  }

  let body;
  try {
    body = await readRequestBody(request);
  } catch (error) {
    if (error instanceof RangeError) {
      sendText(response, 413, 'Request body is too large');
      return;
    }
    throw error;
  }

  const headers = new Headers();
  for (const [name, value] of Object.entries(request.headers)) {
    if (Array.isArray(value)) {
      for (const entry of value) headers.append(name, entry);
    } else if (value !== undefined) {
      headers.set(name, value);
    }
  }

  const method = request.method || 'GET';
  const webRequest = new Request(requestUrl, {
    method,
    headers,
    ...(method === 'GET' || method === 'HEAD' || body.length === 0
      ? {}
      : { body, duplex: 'half' }),
  });
  const webResponse = await handler(webRequest);
  const responseHeaders = Object.fromEntries(webResponse.headers.entries());
  response.writeHead(webResponse.status, responseHeaders);

  if (!webResponse.body || method === 'HEAD') {
    response.end();
    return;
  }
  Readable.fromWeb(webResponse.body).pipe(response);
}

function serveStaticFile(request, response, filePath) {
  const stats = fs.statSync(filePath);
  const headers = {
    'Accept-Ranges': 'bytes',
    'Cache-Control': filePath.endsWith('index.html') ? 'no-cache' : 'public, max-age=3600',
    'Content-Type': MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
  };

  if (request.method === 'HEAD') {
    response.writeHead(200, { ...headers, 'Content-Length': stats.size });
    response.end();
    return;
  }

  const rangeHeader = request.headers.range;
  if (rangeHeader) {
    const range = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
    if (!range || (!range[1] && !range[2])) {
      response.writeHead(416, {
        ...headers,
        'Content-Range': `bytes */${stats.size}`,
      });
      response.end();
      return;
    }

    const start = range[1] ? Number(range[1]) : Math.max(0, stats.size - Number(range[2]));
    const end = range[2] && range[1] ? Math.min(Number(range[2]), stats.size - 1) : stats.size - 1;
    if (start >= stats.size || start > end) {
      response.writeHead(416, {
        ...headers,
        'Content-Range': `bytes */${stats.size}`,
      });
      response.end();
      return;
    }

    response.writeHead(206, {
      ...headers,
      'Content-Length': end - start + 1,
      'Content-Range': `bytes ${start}-${end}/${stats.size}`,
    });
    fs.createReadStream(filePath, { start, end }).pipe(response);
    return;
  }

  response.writeHead(200, { ...headers, 'Content-Length': stats.size });
  fs.createReadStream(filePath).pipe(response);
}

function createLocalServer() {
  const distPath = path.join(app.getAppPath(), 'dist');

  return http.createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url || '/', 'http://127.0.0.1');
      if (requestUrl.pathname.startsWith('/api/')) {
        await handleApiRequest(request, response, requestUrl);
        return;
      }

      const decodedPath = decodeURIComponent(requestUrl.pathname);
      let filePath = path.resolve(distPath, `.${decodedPath}`);
      if (!filePath.startsWith(`${distPath}${path.sep}`) && filePath !== distPath) {
        sendText(response, 403, 'Forbidden');
        return;
      }
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        filePath = path.join(distPath, 'index.html');
      }
      serveStaticFile(request, response, filePath);
    } catch (error) {
      console.error('Desktop request failed', error);
      if (!response.headersSent) {
        sendText(response, 500, 'The local application server encountered an error');
      } else {
        response.destroy(error);
      }
    }
  });
}

async function startLocalServer() {
  server = createLocalServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  applicationUrl = `http://127.0.0.1:${address.port}`;
}

async function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 650,
    title: 'سُبُل | القرآن الكريم',
    backgroundColor: '#f7f8fa',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) void shell.openExternal(url);
    return { action: 'deny' };
  });
  window.webContents.on('will-navigate', (event, url) => {
    if (new URL(url).origin !== new URL(applicationUrl).origin) {
      event.preventDefault();
      if (url.startsWith('https://')) void shell.openExternal(url);
    }
  });
  await window.loadURL(applicationUrl);
}

app.whenReady().then(async () => {
  loadLocalEnvironment();
  if (app.isPackaged) {
    await startLocalServer();
  } else {
    applicationUrl = process.env.VITE_DEV_SERVER_URL || 'http://127.0.0.1:5173';
  }
  await createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) void createWindow();
  });
}).catch((error) => {
  console.error('Unable to start the Sobul desktop app', error);
  dialog.showErrorBox('تعذر تشغيل تطبيق سُبُل', error.message);
  app.quit();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (server) server.close();
});
