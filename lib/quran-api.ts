const QURAN_API_BASE_URL = 'https://api.alquran.cloud/v1';

export interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface QuranAyah {
  number: number;
  numberInSurah: number;
  text: string;
  sajda: boolean | object;
}

export interface QuranSurah extends SurahMeta {
  ayahs: QuranAyah[];
}

export interface QuranSearchMatch {
  number: number;
  numberInSurah: number;
  text: string;
  sajda: boolean | object;
  surah: Pick<
    SurahMeta,
    'number' | 'name' | 'englishName' | 'englishNameTranslation' | 'revelationType'
  >;
}

export interface QuranSearchResult {
  count: number;
  matches: QuranSearchMatch[];
}

export interface QuranAudioTrack {
  numberInSurah: number;
  sources: string[];
}

export interface QuranReciter {
  id: string;
  name: string;
  englishName: string;
  fullSurahAudioBaseUrl: string;
  ayahAudioEdition?: string | null;
  portraitUrl?: string;
  portraitSourceUrl?: string;
  portraitLicense?: string;
  portraitAttribution?: string;
}

export const QURAN_RECITERS: QuranReciter[] = [
  {
    id: 'ar.abdullahbasfar',
    name: 'عبد الله بصفر',
    englishName: 'Abdullah Basfar',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/abdullah-basfar/r1/',
  },
  {
    id: 'ar.abdurrahmaansudais',
    name: 'عبدالرحمن السديس',
    englishName: 'Abdurrahmaan As-Sudais',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/abdulrahman-sudais/r1/',
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Abdul_Rahman_Al-Sudais_-_Cropped.png',
    portraitSourceUrl: 'https://commons.wikimedia.org/wiki/File:Abdul_Rahman_Al-Sudais_-_Cropped.png',
    portraitLicense: 'CC BY-SA 4.0',
    portraitAttribution: 'Avraham',
  },
  {
    id: 'ar.abdulsamad',
    name: 'عبد الباسط عبد الصمد',
    englishName: 'Abdul Basit',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/abdulbasit-abdulsamad/r3/',
    portraitUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ee/Abdul_Basit_%27Abd_us-Samad_with_King_Faisal.jpg/330px-Abdul_Basit_%27Abd_us-Samad_with_King_Faisal.jpg',
    portraitSourceUrl: 'https://commons.wikimedia.org/wiki/File:Abdul_Basit_%27Abd_us-Samad_with_King_Faisal.jpg',
    portraitLicense: 'Public domain',
    portraitAttribution: 'Unknown author',
  },
  {
    id: 'ar.shaatree',
    name: 'أبو بكر الشاطري',
    englishName: 'Abu Bakr Ash-Shaatree',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/abubakr-shatri/r1/',
  },
  {
    id: 'ar.hanirifai',
    name: 'هاني الرفاعي',
    englishName: 'Hani Rifai',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/hani-rifai/r1/',
  },
  {
    id: 'ar.alafasy',
    name: 'مشاري العفاسي',
    englishName: 'Alafasy',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/mishary-alafasy/r1/',
    portraitUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/24/%D0%9C%D0%B8%D1%88%D0%B0%D1%80%D0%B8_%D0%A0%D0%B0%D1%88%D0%B8%D0%B4.jpg/330px-%D0%9C%D0%B8%D1%88%D0%B0%D1%80%D0%B8_%D0%A0%D0%B0%D1%88%D0%B8%D0%B4.jpg',
    portraitSourceUrl: 'https://commons.wikimedia.org/wiki/File:%D0%9C%D0%B8%D1%88%D0%B0%D1%80%D0%B8_%D0%A0%D0%B0%D1%88%D0%B8%D0%B4.jpg',
    portraitLicense: 'Copyrighted free use',
    portraitAttribution: 'quranic.ru',
  },
  {
    id: 'ar.husary',
    name: 'محمود خليل الحصري',
    englishName: 'Husary',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/mahmoud-husary/r1/',
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Hussary.jpg',
    portraitSourceUrl: 'https://commons.wikimedia.org/wiki/File:Hussary.jpg',
    portraitLicense: 'Public domain',
    portraitAttribution: 'Zubairkhan1',
  },
  {
    id: 'ar.hudhaify',
    name: 'علي الحذيفي',
    englishName: 'Hudhaify',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/ali-hudhaifi/r1/',
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Huthaify.jpg',
    portraitSourceUrl: 'https://commons.wikimedia.org/wiki/File:Huthaify.jpg',
    portraitLicense: 'CC BY-SA 4.0',
    portraitAttribution: 'Km.jahiruddin md. Babur',
  },
  {
    id: 'ar.yasseraldossari',
    name: 'ياسر الدوسري',
    englishName: 'Yasser Al-Dosari',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/yasser-dosari/r1/',
    ayahAudioEdition: null,
  },
  {
    id: 'ar.nasseralqatami',
    name: 'ناصر القطامي',
    englishName: 'Nasser Al-Qatami',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/nasser-qatami/r1/',
    ayahAudioEdition: null,
  },
  {
    id: 'ar.ahmadnufais',
    name: 'أحمد النفيس',
    englishName: 'Ahmed Al-Nufais',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/ahmad-nufais/r1/',
    ayahAudioEdition: null,
  },
  {
    id: 'ar.mahermuaiqly',
    name: 'ماهر المعيقلي',
    englishName: 'Maher Al-Muaiqly',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/maher-muaiqly/r1/',
    ayahAudioEdition: null,
  },
  {
    id: 'ar.idreesabkar',
    name: 'إدريس أبكر',
    englishName: 'Idrees Abkar',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/idrees-abkar/r1/',
    ayahAudioEdition: null,
  },
  {
    id: 'ar.khalidqahtani',
    name: 'خالد القحطاني',
    englishName: 'Khalid Al-Qahtani',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/khalid-qahtani/r1/',
    ayahAudioEdition: null,
  },
  {
    id: 'ar.ahmedalajmi',
    name: 'أحمد بن علي العجمي',
    englishName: 'Ahmed Al-Ajmi',
    fullSurahAudioBaseUrl: 'https://cdn.mp3quran.net/audio/ahmad-ajmi/r1/',
    ayahAudioEdition: null,
  },
];

interface ApiEnvelope<T> {
  code: number;
  status: string;
  data: T;
}

async function fetchApiData<T>(
  path: string,
  signal?: AbortSignal,
  cache?: RequestCache
): Promise<T> {
  const response = await fetch(`${QURAN_API_BASE_URL}/${path}`, { signal, cache });
  if (!response.ok) {
    throw new Error(`Quran API request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as ApiEnvelope<T>;
  if (payload.code !== 200) {
    throw new Error(`Quran API returned ${payload.status || 'an invalid response'}`);
  }

  return payload.data;
}

export async function fetchSurahList(signal?: AbortSignal): Promise<SurahMeta[]> {
  const surahs = await fetchApiData<SurahMeta[]>('surah', signal);
  if (
    !Array.isArray(surahs) ||
    surahs.length !== 114 ||
    surahs.some((surah, index) => surah.number !== index + 1)
  ) {
    throw new Error('Quran API returned an incomplete or unordered surah list');
  }

  return surahs;
}

export async function fetchSurahText(
  surahNumber: number,
  signal?: AbortSignal,
  cache?: RequestCache
): Promise<QuranSurah> {
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    throw new RangeError('Surah number must be between 1 and 114');
  }

  const surah = await fetchApiData<QuranSurah>(
    `surah/${surahNumber}/quran-uthmani`,
    signal,
    cache
  );
  if (
    surah.number !== surahNumber ||
    !Array.isArray(surah.ayahs) ||
    surah.ayahs.length !== surah.numberOfAyahs
  ) {
    throw new Error(`Quran API returned incomplete data for surah ${surahNumber}`);
  }

  return surah;
}

export async function searchQuran(
  query: string,
  signal?: AbortSignal,
  cache?: RequestCache
): Promise<QuranSearchResult> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return { count: 0, matches: [] };
  }

  const result = await fetchApiData<QuranSearchResult>(
    `search/${encodeURIComponent(trimmedQuery)}/all/quran-uthmani`,
    signal,
    cache
  );
  if (!Array.isArray(result.matches)) {
    throw new Error('Quran API returned an invalid search response');
  }

  return result;
}

export async function fetchSurahAudio(
  surahNumber: number,
  reciterId: string,
  signal?: AbortSignal
): Promise<QuranAudioTrack[]> {
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    throw new RangeError('Surah number must be between 1 and 114');
  }
  const reciter = QURAN_RECITERS.find((item) => item.id === reciterId);
  if (!reciter) {
    throw new RangeError('Reciter is not in the verified Quran audio collection');
  }
  if (reciter.ayahAudioEdition === null) {
    throw new RangeError('Reciter does not have a verified verse-by-verse audio edition');
  }

  const surah = await fetchApiData<{
    numberOfAyahs: number;
    ayahs: Array<{
      numberInSurah: number;
      audio?: string;
      audioSecondary?: string[];
    }>;
  }>(
    `surah/${surahNumber}/${encodeURIComponent(reciter.ayahAudioEdition ?? reciterId)}`,
    signal
  );

  if (
    !Array.isArray(surah.ayahs) ||
    surah.ayahs.length === 0 ||
    surah.ayahs.length !== surah.numberOfAyahs
  ) {
    throw new Error(`Quran API returned incomplete audio tracks for surah ${surahNumber}`);
  }

  const tracks = surah.ayahs.map((ayah) => {
    const sources = Array.from(new Set([ayah.audio, ...(ayah.audioSecondary ?? [])])).filter(
      (source): source is string => {
        if (!source) return false;

        try {
          return new URL(source).protocol === 'https:';
        } catch {
          return false;
        }
      }
    );

    if (!Number.isInteger(ayah.numberInSurah) || sources.length === 0) {
      throw new Error(`Quran API returned an invalid audio track for surah ${surahNumber}`);
    }

    return { numberInSurah: ayah.numberInSurah, sources };
  });

  if (tracks.some((track, index) => track.numberInSurah !== index + 1)) {
    throw new Error(`Quran API returned unordered audio tracks for surah ${surahNumber}`);
  }

  return tracks;
}
