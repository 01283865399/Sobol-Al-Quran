import type { IncomingMessage, ServerResponse } from 'node:http';
import { once } from 'node:events';

type WebHandler = (request: Request) => Promise<Response>;

const MAX_REQUEST_BODY_BYTES = 32 * 1024;
const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'transfer-encoding',
  'upgrade',
]);

async function readRequestBody(request: IncomingMessage): Promise<string | null> {
  const chunks: Buffer[] = [];
  let length = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    length += buffer.byteLength;
    if (length > MAX_REQUEST_BODY_BYTES) return null;
    chunks.push(buffer);
  }

  return Buffer.concat(chunks).toString('utf8');
}

function copyResponseHeaders(response: Response, target: ServerResponse) {
  response.headers.forEach((value, name) => {
    if (!HOP_BY_HOP_HEADERS.has(name.toLowerCase())) {
      target.setHeader(name, value);
    }
  });
}

async function writeResponseBody(response: Response, target: ServerResponse) {
  if (!response.body) {
    target.end();
    return;
  }

  const reader = response.body.getReader();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done || target.destroyed) break;
      if (!target.write(value)) {
        await Promise.race([once(target, 'drain'), once(target, 'close')]);
      }
    }
    if (!target.destroyed) target.end();
  } finally {
    reader.releaseLock();
  }
}

export function createNodeHandler(handler: WebHandler) {
  return async (incoming: IncomingMessage, outgoing: ServerResponse) => {
    try {
      const method = incoming.method ?? 'GET';
      let body: string | undefined;

      if (method !== 'GET' && method !== 'HEAD') {
        body = await readRequestBody(incoming) ?? undefined;
        if (body === undefined) {
          const response = Response.json(
            { error: { code: 'request_too_large', message: 'Request body is too large.' } },
            { status: 413 }
          );
          outgoing.statusCode = response.status;
          copyResponseHeaders(response, outgoing);
          outgoing.end(await response.text());
          return;
        }
      }

      const headers = new Headers();
      for (const [name, value] of Object.entries(incoming.headers)) {
        if (typeof value === 'string') headers.set(name, value);
        else if (Array.isArray(value)) headers.set(name, value.join(', '));
      }

      const protocol = headers.get('x-forwarded-proto')?.split(',')[0] ?? 'https';
      const host = headers.get('host') ?? 'localhost';
      const url = new URL(incoming.url ?? '/', `${protocol}://${host}`);
      const request = new Request(url, {
        method,
        headers,
        ...(body === undefined ? {} : { body }),
      });
      const response = await handler(request);

      outgoing.statusCode = response.status;
      copyResponseHeaders(response, outgoing);
      await writeResponseBody(response, outgoing);
    } catch (error) {
      console.error('Vercel API handler failed', error);
      if (outgoing.headersSent || outgoing.destroyed) {
        outgoing.destroy(error instanceof Error ? error : undefined);
        return;
      }

      outgoing.statusCode = 500;
      outgoing.setHeader('Content-Type', 'application/json; charset=utf-8');
      outgoing.end(JSON.stringify({
        error: { code: 'internal_error', message: 'The request could not be completed.' },
      }));
    }
  };
}
