interface MediaAsset {
  filename: string;
  contentType: string;
}

const MEDIA_ASSETS: Record<string, MediaAsset> = {
  rain: { filename: 'مطر.mp4', contentType: 'video/mp4' },
  'rain-audio': { filename: 'مطر-صوت.mp3', contentType: 'audio/mpeg' },
  fire: { filename: 'نار.mp4', contentType: 'video/mp4' },
  'fire-audio': { filename: 'نار-صوت.mp3', contentType: 'audio/mpeg' },
  nature: { filename: 'ضباب.mp4', contentType: 'video/mp4' },
  sea: { filename: 'بحر.mp4', contentType: 'video/mp4' },
  sky: { filename: 'سماء.mp4', contentType: 'video/mp4' },
};

const MEDIA_BASE_URL =
  'https://media.githubusercontent.com/media/01283865399/Sobol-Al-Quran/main/public/assets/';

export const config = { path: '/api/media/*' };

async function handleMediaRequest(request: Request, assetId: string) {
  const asset = MEDIA_ASSETS[assetId];
  if (!asset) return new Response('Media not found', { status: 404 });

  const requestHeaders = new Headers();
  const range = request.headers.get('range');
  const ifRange = request.headers.get('if-range');
  if (range) requestHeaders.set('range', range);
  if (ifRange) requestHeaders.set('if-range', ifRange);

  let upstream: Response;
  try {
    upstream = await fetch(`${MEDIA_BASE_URL}${encodeURIComponent(asset.filename)}`, {
      method: request.method,
      headers: requestHeaders,
      cache: 'no-store',
    });
  } catch (error) {
    console.error('Unable to retrieve listening media from Git LFS', {
      assetId,
      error,
    });
    return new Response('Media source unavailable', { status: 502 });
  }

  if (upstream.status !== 200 && upstream.status !== 206 && upstream.status !== 416) {
    console.error('Git LFS returned an unsuccessful listening media response', {
      assetId,
      status: upstream.status,
    });
    return new Response('Media source unavailable', { status: 502 });
  }

  const responseHeaders = new Headers({
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    'Content-Type': asset.contentType,
  });
  for (const header of ['content-length', 'content-range', 'etag', 'last-modified']) {
    const value = upstream.headers.get(header);
    if (value) responseHeaders.set(header, value);
  }

  return new Response(
    request.method === 'HEAD' || upstream.status === 416 ? null : upstream.body,
    { status: upstream.status, headers: responseHeaders }
  );
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
  }
  const assetId = new URL(request.url).pathname.split('/').at(-1);
  if (!assetId) return new Response('Media not found', { status: 404 });
  return handleMediaRequest(request, decodeURIComponent(assetId));
}
