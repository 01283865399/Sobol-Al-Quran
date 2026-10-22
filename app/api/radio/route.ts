import { NextResponse } from 'next/server';
import {
  radioProviderResponseSchema,
  type RadioStation,
} from '@/lib/radio-types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RADIO_API_URL = 'https://mp3quran.net/api/v3/radios?language=ar';
const ALLOWED_STREAM_HOSTS = new Set([
  'backup.qurango.net',
  'radio.xecod.com',
  'stream.radiojar.com',
]);
const EGYPT_QURAN_STATION: RadioStation = {
  id: 900001,
  name: 'إذاعة القرآن الكريم - مصر (القاهرة)',
  url: 'https://radio.xecod.com/station/quran-cairo',
  playback: 'audio',
};

function unavailable() {
  return NextResponse.json(
    { error: { code: 'radio_source_unavailable' } },
    { status: 502 }
  );
}

export async function GET() {
  let response: Response;

  try {
    response = await fetch(RADIO_API_URL, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    console.error('Could not fetch the Quran radio directory', error);
    return unavailable();
  }

  if (!response.ok) {
    console.error('Quran radio directory returned an unsuccessful response', {
      status: response.status,
    });
    return unavailable();
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    console.error('Quran radio directory returned invalid JSON', error);
    return unavailable();
  }

  const parsed = radioProviderResponseSchema.safeParse(payload);
  if (!parsed.success) {
    console.error('Quran radio directory returned an unexpected shape', {
      issueCount: parsed.error.issues.length,
    });
    return unavailable();
  }

  const stations: RadioStation[] = parsed.data.radios.filter((station) => {
    const url = new URL(station.url);
    return (
      url.protocol === 'https:' &&
      ALLOWED_STREAM_HOSTS.has(url.hostname.toLowerCase())
    );
  });

  if (stations.length === 0) {
    console.error('Quran radio directory contained no supported HTTPS streams');
    return unavailable();
  }

  if (stations.length !== parsed.data.radios.length) {
    console.warn('Excluded unsupported Quran radio stream URLs', {
      excluded: parsed.data.radios.length - stations.length,
    });
  }

  return NextResponse.json(
    { stations: [...stations, EGYPT_QURAN_STATION] },
    { headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600' } }
  );
}
