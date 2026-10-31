import { z } from 'zod';

export const config = { path: '/api/hadith' };

const COLLECTIONS: Record<string, string> = {
  bukhari: 'ara-bukhari',
  muslim: 'ara-muslim',
  abudawud: 'ara-abudawud',
  tirmidhi: 'ara-tirmidhi',
  nasai: 'ara-nasai',
  ibnmajah: 'ara-ibnmajah',
  malik: 'ara-malik',
};

const providerResponseSchema = z.object({
  hadiths: z.array(z.object({
    hadithnumber: z.number().int().positive(),
    text: z.string(),
    grades: z.array(z.object({ grade: z.string().optional() }).passthrough()).optional(),
  }).passthrough()),
});

function jsonError(status: number, code: string) {
  return Response.json({ error: { code } }, { status });
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') {
    return new Response(null, { status: 405, headers: { Allow: 'GET' } });
  }

  const url = new URL(request.url);
  const book = url.searchParams.get('book') ?? '';
  const from = Number(url.searchParams.get('from') ?? '1');
  const to = Number(url.searchParams.get('to') ?? '20');
  const collection = COLLECTIONS[book];

  if (
    !collection ||
    !Number.isSafeInteger(from) ||
    !Number.isSafeInteger(to) ||
    from < 1 ||
    to < from ||
    to - from >= 20
  ) {
    return jsonError(400, 'invalid_hadith_query');
  }

  const hadithNumbers = Array.from({ length: to - from + 1 }, (_, index) => from + index);
  let hadiths: Array<{ hadithnumber: number; text: string; grades?: Array<{ grade?: string }> }>;

  try {
    const results = await Promise.all(hadithNumbers.map(async (number) => {
      const endpoint = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${collection}/${number}.min.json`;
      const response = await fetch(endpoint, { signal: AbortSignal.timeout(12_000) });
      if (response.status === 404) return null;
      if (!response.ok) {
        throw new Error(`Hadith provider returned HTTP ${response.status}`);
      }

      const parsed = providerResponseSchema.safeParse(await response.json());
      if (!parsed.success) {
        throw new Error('Hadith provider returned an unexpected response shape');
      }

      return parsed.data.hadiths.find((hadith) => hadith.hadithnumber === number) ?? null;
    }));
    hadiths = results.filter((hadith): hadith is NonNullable<typeof hadith> => hadith !== null);
  } catch (error) {
    console.error('Could not fetch hadith collection', { book, error });
    return jsonError(502, 'hadith_source_unavailable');
  }

  return Response.json(
    {
      hasMore: hadiths.length === hadithNumbers.length,
      hadiths: hadiths.filter((hadith) => hadith.text.trim()).map((hadith) => ({
        id: hadith.hadithnumber,
        text: hadith.text,
        grade: hadith.grades?.find((grade) => grade.grade?.trim())?.grade ?? null,
      })),
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=600, stale-while-revalidate=3600',
      },
    }
  );
}
