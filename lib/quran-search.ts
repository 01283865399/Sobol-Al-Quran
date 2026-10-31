import {
  fetchSurahList,
  fetchSurahText,
  type QuranSearchMatch,
  type QuranSurah,
  type SurahMeta,
} from './quran-api';

const ARABIC_DIACRITICS = /[\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed]/gu;
const ARABIC_WORDS = /[\u0621-\u064a\u0671-\u06d3]+/gu;

/**
 * Normalizes Arabic for matching while leaving the original Uthmani text untouched.
 * O(n), where n is the input length.
 */
export function normalizeArabicText(value: string): string {
  return value
    .normalize('NFD')
    .replace(ARABIC_DIACRITICS, '')
    .replace(/[أإآٱ]/gu, 'ا')
    .replace(/[ةه]/gu, 'ه')
    .replace(/[يى]/gu, 'ي')
    .replace(/ـ/gu, '')
    .replace(/\s+/gu, ' ')
    .trim();
}

function tokenize(value: string): string[] {
  return normalizeArabicText(value).match(ARABIC_WORDS) ?? [];
}

class TrieNode {
  readonly children = new Map<string, TrieNode>();
  readonly ayahIds = new Set<number>();
}

export class QuranInMemoryIndex {
  private readonly exactIndex = new Map<string, Set<number>>();
  private readonly root = new TrieNode();
  private readonly matches = new Map<number, QuranSearchMatch>();
  private readonly normalizedAyahs = new Map<number, string>();

  constructor(surahs: QuranSurah[]) {
    let ayahId = 0;
    for (const surah of surahs) {
      for (const ayah of surah.ayahs) {
        const match: QuranSearchMatch = {
          number: ayah.number,
          numberInSurah: ayah.numberInSurah,
          text: ayah.text,
          sajda: ayah.sajda,
          surah: {
            number: surah.number,
            name: surah.name,
            englishName: surah.englishName,
            englishNameTranslation: surah.englishNameTranslation,
            revelationType: surah.revelationType,
          },
        };
        const normalizedText = normalizeArabicText(ayah.text);
        this.matches.set(ayahId, match);
        this.normalizedAyahs.set(ayahId, normalizedText);

        for (const word of tokenize(ayah.text)) {
          const exactIds = this.exactIndex.get(word);
          if (exactIds) exactIds.add(ayahId);
          else this.exactIndex.set(word, new Set([ayahId]));

          let node = this.root;
          node.ayahIds.add(ayahId);
          for (const character of word) {
            let child = node.children.get(character);
            if (!child) {
              child = new TrieNode();
              node.children.set(character, child);
            }
            node = child;
            node.ayahIds.add(ayahId);
          }
        }
        ayahId += 1;
      }
    }
  }

  search(query: string, limit = 250): QuranSearchMatch[] {
    const normalizedQuery = normalizeArabicText(query);
    const tokens = tokenize(normalizedQuery);
    if (tokens.length === 0) return [];

    let candidateIds: Set<number> | undefined;
    for (const token of tokens) {
      const exact = this.exactIndex.get(token);
      const prefix = exact ?? this.findPrefixIds(token);
      if (!prefix) return [];
      candidateIds = candidateIds
        ? new Set([...candidateIds].filter((id) => prefix.has(id)))
        : new Set(prefix);
    }

    const phrase = normalizeArabicText(query);
    return [...(candidateIds ?? [])]
      .filter((id) => this.normalizedAyahs.get(id)?.includes(phrase))
      .sort((a, b) => a - b)
      .slice(0, limit)
      .map((id) => this.matches.get(id))
      .filter((match): match is QuranSearchMatch => Boolean(match));
  }

  autocomplete(prefix: string, limit = 12): string[] {
    const normalizedPrefix = normalizeArabicText(prefix);
    if (!normalizedPrefix) return [];
    let node = this.root;
    for (const character of normalizedPrefix) {
      const child = node.children.get(character);
      if (!child) return [];
      node = child;
    }

    const words = new Set<string>();
    const visit = (current: TrieNode, word: string) => {
      if (words.size >= limit) return;
      if (current.ayahIds.size > 0 && word) words.add(word);
      for (const [character, child] of current.children) visit(child, word + character);
    };
    visit(node, normalizedPrefix);
    return [...words];
  }

  private findPrefixIds(prefix: string): Set<number> | undefined {
    let node = this.root;
    for (const character of prefix) {
      const child = node.children.get(character);
      if (!child) return undefined;
      node = child;
    }
    return node.ayahIds;
  }
}

let indexPromise: Promise<QuranInMemoryIndex> | null = null;

async function loadIndex(): Promise<QuranInMemoryIndex> {
  const surahList = await fetchSurahList();
  const surahs: QuranSurah[] = [];
  for (let start = 0; start < surahList.length; start += 6) {
    const batch = await Promise.all(
      surahList.slice(start, start + 6).map((surah: SurahMeta) => fetchSurahText(surah.number))
    );
    surahs.push(...batch);
  }
  return new QuranInMemoryIndex(surahs);
}

export function getQuranSearchIndex(): Promise<QuranInMemoryIndex> {
  if (!indexPromise) {
    indexPromise = loadIndex().catch((error: unknown) => {
      indexPromise = null;
      throw error;
    });
  }
  return indexPromise;
}

export async function searchQuranInMemory(
  query: string,
  signal?: AbortSignal
): Promise<{ count: number; matches: QuranSearchMatch[] }> {
  if (signal?.aborted) throw new DOMException('Search request was aborted', 'AbortError');
  const index = await getQuranSearchIndex();
  if (signal?.aborted) throw new DOMException('Search request was aborted', 'AbortError');
  const matches = index.search(query);
  return { count: matches.length, matches };
}
