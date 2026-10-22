import 'server-only';

import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { fetchSurahText, QURAN_RECITERS, searchQuran } from '@/lib/quran-api';
import type { ChatSource } from '@/lib/chat-types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 32 * 1024;
const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_LENGTH = 20000;
const GEMINI_MODEL = 'gemini-3-flash-preview';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SUNNAH_API_KEY = process.env.SUNNAH_API_KEY;

const requestSchema = z
  .object({
    messages: z
      .array(
        z
          .object({
            role: z.enum(['user', 'assistant']),
            content: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
          })
          .strict()
      )
      .min(1)
      .max(MAX_MESSAGES),
  })
  .strict()
  .superRefine((value, context) => {
    if (
      value.messages.reduce((total, message) => total + message.content.length, 0) >
      MAX_HISTORY_LENGTH
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Conversation history is too long',
      });
    }
  });

const sunnahGradeSchema = z
  .object({
    graded_by: z.string().optional(),
    grade: z.string().optional(),
  })
  .passthrough();

const sunnahHadithSchema = z
  .object({
    lang: z.string(),
    body: z.string(),
    grades: z.array(sunnahGradeSchema).optional(),
  })
  .passthrough();

const sunnahRecordSchema = z
  .object({
    collection: z.string(),
    hadithNumber: z.union([z.string(), z.number()]),
    hadith: z.array(sunnahHadithSchema),
  })
  .passthrough();

const sunnahResponseSchema = z
  .object({
    data: z.array(sunnahRecordSchema),
  })
  .passthrough();

interface HadithReference {
  collection: string;
  number: string;
}

interface HadithLookup {
  source: ChatSource;
  evidence: string;
}

function jsonError(status: number, code: string, message: string, retryAfter?: number) {
  return NextResponse.json(
    { error: { code, message } },
    {
      status,
      headers: retryAfter ? { 'Retry-After': String(retryAfter) } : undefined,
    }
  );
}

async function readLimitedBody(request: Request): Promise<string | null> {
  const reader = request.body?.getReader();
  if (!reader) return '';

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;
      if (totalBytes > MAX_BODY_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bodyBytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bodyBytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder().decode(bodyBytes);
}

function normalizeDigits(value: string): string {
  return value.replace(/[٠-٩۰-۹]/g, (digit) => {
    const code = digit.charCodeAt(0);
    return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660);
  });
}

function parseHadithReference(question: string): HadithReference | null {
  const normalizedQuestion = normalizeDigits(question);
  const collections: Array<{ pattern: RegExp; id: string }> = [
    { pattern: /(?:صحيح\s+)?البخاري|bukhari/i, id: 'bukhari' },
    { pattern: /(?:صحيح\s+)?مسلم|muslim/i, id: 'muslim' },
    { pattern: /أبو\s+داود|ابو\s+داود|أبي\s+داود|ابي\s+داود|abudawud|abu\s+dawud/i, id: 'abudawud' },
    { pattern: /الترمذي|جامع\s+الترمذي|tirmidhi/i, id: 'tirmidhi' },
    { pattern: /النسائي|سنن\s+النسائي|nasai|nasa'i/i, id: 'nasai' },
    { pattern: /ابن\s+ماجه|ابن\s+ماجة|ibn\s+majah|ibnmajah/i, id: 'ibnmajah' },
  ];

  for (const collection of collections) {
    const match = collection.pattern.exec(normalizedQuestion);
    if (!match || match.index === undefined) continue;

    const followingText = normalizedQuestion.slice(match.index + match[0].length);
    const number = followingText.match(
      /^\s*(?:(?:رقم|حديث(?:\s+رقم)?|no\.?)\s*|[:#-]\s*)?(\d{1,6})\b/i
    )?.[1];

    if (number) return { collection: collection.id, number };
  }

  return null;
}

function cleanSourceText(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&amp;/gi, '&')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

async function retrieveHadith(
  reference: HadithReference,
  apiKey: string
): Promise<HadithLookup | null> {
  const params = new URLSearchParams({
    refs: `${reference.collection}:${reference.number}`,
  });
  const response = await fetch(`https://api.sunnah.com/v1/hadiths/refs?${params}`, {
    headers: { 'X-API-Key': apiKey },
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`Sunnah.com returned HTTP ${response.status}`);
  }

  const payload: unknown = await response.json();
  const parsed = sunnahResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error('Sunnah.com returned an invalid hadith response');
  }

  const record = parsed.data.data.find(
    (item) =>
      item.collection.toLowerCase() === reference.collection &&
      String(item.hadithNumber) === reference.number
  );
  if (!record) return null;

  const languageRecord =
    record.hadith.find((item) => item.lang.toLowerCase().startsWith('ar')) ??
    record.hadith.find((item) => item.lang.toLowerCase().startsWith('en'));
  if (!languageRecord) return null;

  const excerpt = cleanSourceText(languageRecord.body).slice(0, 1800);
  if (!excerpt) return null;

  const grades = (languageRecord.grades ?? [])
    .flatMap((grade) =>
      grade.grade && grade.graded_by
        ? [{ grade: grade.grade.slice(0, 100), gradedBy: grade.graded_by.slice(0, 100) }]
        : []
    )
    .slice(0, 3);
  const referenceLabel = `${reference.collection}:${reference.number}`;

  return {
    source: {
      kind: 'hadith',
      title: 'Sunnah.com',
      reference: referenceLabel,
      url: `https://sunnah.com/${referenceLabel}`,
      excerpt,
      ...(grades.length > 0 ? { grades } : {}),
    },
    evidence: [
      `Reference: ${referenceLabel}`,
      `Language: ${languageRecord.lang}`,
      `Text from Sunnah.com: ${excerpt}`,
      ...(grades.length > 0
        ? [`Grades recorded by the source: ${grades.map(({ grade, gradedBy }) => `${grade} — ${gradedBy}`).join('; ')}`]
        : ['No grading data was returned for this language.']),
    ].join('\n'),
  };
}

function isQuranQuestion(question: string): boolean {
  return /القرآن|قرآن|آية|آيات|سورة|تفسير|quran|verse|surah|tafsir/i.test(question);
}

function isExactQuranTextRequest(question: string): boolean {
  return (
    isQuranQuestion(question) &&
    /نص|اقتبس|اكتب|اذكر|اقرأ|بالكامل|quote|verbatim|exact verse/i.test(question)
  );
}

function getQuranSearchTerm(question: string): string | null {
  const quotedText = question.match(/[«“"]([^»”"]{2,80})[»”"]/);
  if (quotedText) return quotedText[1].trim();

  const normalized = question
    .normalize('NFD')
    .replace(/[\u064b-\u065f\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا');
  const stopWords = new Set([
    'القران', 'الكريم', 'ايه', 'الاية', 'ايات', 'سوره', 'سورة', 'تفسير',
    'معنى', 'اشرح', 'ما', 'ماذا', 'كيف', 'هل', 'عن', 'في', 'من', 'الى',
    'على', 'هو', 'هي', 'هذا', 'هذه', 'الذي', 'التي', 'ان', 'يقول', 'تقول',
    'ذكر', 'اذكر', 'اريد', 'لي', 'لنا', 'هل', 'please', 'quran', 'verse',
  ]);
  const words = normalized.match(/[\u0621-\u064a]{3,}/g) ?? [];
  const searchTerm = words.reverse().find((word) => !stopWords.has(word));
  return searchTerm ?? null;
}

function quranSource(
  surahNumber: number,
  surahName: string,
  ayahNumber: number,
  globalAyahNumber: number,
  text: string
): ChatSource {
  return {
    kind: 'quran',
    title: 'AlQuran.cloud — النص العثماني',
    reference: `${surahName}، الآية ${ayahNumber}`,
    url: `https://api.alquran.cloud/v1/ayah/${globalAyahNumber}/quran-uthmani`,
    excerpt: text,
  };
}

async function retrieveQuran(question: string): Promise<ChatSource[]> {
  if (!isQuranQuestion(question)) return [];

  const numericReference = normalizeDigits(question).match(
    /(?:^|\D)(\d{1,3})\s*[:/]\s*(\d{1,3})(?!\d)/
  );
  const ayatAlKursi = /آية\s+الكرسي|اية\s+الكرسي|ayat\s+al[- ]kursi/i.test(question);

  if (numericReference || ayatAlKursi) {
    const surahNumber = ayatAlKursi ? 2 : Number(numericReference?.[1]);
    const ayahNumber = ayatAlKursi ? 255 : Number(numericReference?.[2]);
    const surah = await fetchSurahText(
      surahNumber,
      AbortSignal.timeout(8000),
      'no-store'
    );
    const ayah = surah.ayahs.find((item) => item.numberInSurah === ayahNumber);

    return ayah
      ? [
          quranSource(
            surah.number,
            surah.name,
            ayah.numberInSurah,
            ayah.number,
            ayah.text
          ),
        ]
      : [];
  }

  const searchTerm = getQuranSearchTerm(question);
  if (!searchTerm) return [];

  const result = await searchQuran(
    searchTerm,
    AbortSignal.timeout(8000),
    'no-store'
  );

  return result.matches.slice(0, 4).map((match) =>
    quranSource(
      match.surah.number,
      match.surah.name,
      match.numberInSurah,
      match.number,
      match.text
    )
  );
}

function getWebsiteSources(question: string): ChatSource[] {
  const sources: ChatSource[] = [];
  const entries = [
    { pattern: /القرآن|قرآن|quran|المصحف/i, title: 'القرآن الكريم', url: '/quran' },
    { pattern: /حديث|hadith/i, title: 'الحديث الشريف', url: '/hadith' },
    { pattern: /سبحة|تسبيح|tasbih/i, title: 'السبحة الإلكترونية', url: '/tasbih' },
  ];

  for (const entry of entries) {
    if (entry.pattern.test(question)) {
      sources.push({
        kind: 'website',
        title: 'موقع سُبُل',
        reference: entry.title,
        url: entry.url,
      });
    }
  }

  return sources.slice(0, 3);
}

function getErrorStatus(error: unknown): number | undefined {
  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error
  ) {
    if (typeof error.status === 'number') return error.status;
  }
  if (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    typeof error.statusCode === 'number'
  ) {
    return error.statusCode;
  }

  return undefined;
}

function getErrorCode(error: unknown): string | undefined {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    return error.code.toLowerCase();
  }

  return undefined;
}

function staticResponse(answer: string, sources: ChatSource[] = []) {
  return NextResponse.json({ answer, answerType: 'notice', sources });
}

function normalizeSiteText(value: string): string {
  return value
    .toLocaleLowerCase('ar')
    .normalize('NFD')
    .replace(/[\u064b-\u065f\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function containsSiteKeyword(question: string, keyword: string): boolean {
  const normalizedQuestion = normalizeSiteText(question).split(' ');
  const normalizedKeyword = normalizeSiteText(keyword);
  const candidates = [
    normalizedKeyword,
    `ال${normalizedKeyword}`,
    `ل${normalizedKeyword}`,
    `لل${normalizedKeyword}`,
    `ب${normalizedKeyword}`,
    `بال${normalizedKeyword}`,
    `و${normalizedKeyword}`,
    `وال${normalizedKeyword}`,
    `ف${normalizedKeyword}`,
    `فال${normalizedKeyword}`,
  ];
  return normalizedQuestion.some((word) =>
    candidates.includes(word)
  );
}

const RECITER_ALIASES: Record<string, string[]> = {
  'ar.abdullahbasfar': ['بصفر', 'عبد الله بصفر'],
  'ar.abdurrahmaansudais': ['السديس', 'عبدالرحمن السديس'],
  'ar.abdulsamad': ['عبد الباسط', 'عبدالباسط', 'عبد الصمد'],
  'ar.shaatree': ['الشاطري', 'ابو بكر الشاطري', 'ابوبكر الشاطري'],
  'ar.hanirifai': ['هاني الرفاعي', 'الرفاعي'],
  'ar.alafasy': ['العفاسي', 'مشاري العفاسي'],
  'ar.husary': ['الحصري', 'محمود خليل الحصري'],
  'ar.hudhaify': ['الحذيفي'],
  'ar.yasseraldossari': ['ياسر الدوسري', 'الدوسري'],
  'ar.nasseralqatami': ['ناصر القطامي', 'القطامي'],
  'ar.ahmadnufais': ['احمد النفيس', 'النفيس'],
  'ar.mahermuaiqly': ['ماهر المعيقلي', 'المعيقلي'],
  'ar.idreesabkar': ['ادريس ابكر', 'ابكر'],
  'ar.khalidqahtani': ['خالد القحطاني', 'القحطاني'],
  'ar.ahmedalajmi': ['احمد العجمي', 'العجمي'],
};

const SITE_SECTIONS: Array<{
  keywords: string[];
  answer: string;
  source: ChatSource;
}> = [
  {
    keywords: ['استماع', 'قراء', 'قارئ', 'قاري', 'تلاوه', 'تلاوة'],
    answer: 'تجد القراء والتلاوات الكاملة في صفحة «استمع». اختر القارئ، ثم اختر السورة لبدء الاستماع.',
    source: { kind: 'website', title: 'الاستماع للقرآن والقراء', reference: 'قائمة القراء', url: '/quran' },
  },
  {
    keywords: ['المصحف', 'قراءه', 'قراءة', 'ابحث عن سوره', 'سوره', 'سورة', 'الايه', 'آية', 'ايات', 'آيات'],
    answer: 'لقراءة المصحف والبحث بين السور والآيات، افتح صفحة المصحف للقراءة.',
    source: { kind: 'website', title: 'المصحف للقراءة', reference: '114 سورة والبحث في المصحف', url: '/quran/read' },
  },
  {
    keywords: ['اذاعه', 'إذاعة', 'راديو', 'محطه', 'محطة', 'بث مباشر'],
    answer: 'افتح صفحة إذاعة القرآن الكريم لتصفح المحطات والتلاوات واختيار ما تريد الاستماع إليه. تضم الصفحة أيضًا إذاعة القرآن الكريم من مصر.',
    source: { kind: 'website', title: 'إذاعة القرآن الكريم', reference: 'المحطات والبث المباشر', url: '/radio' },
  },
  {
    keywords: ['حديث', 'احاديث', 'أحاديث', 'البخاري', 'مسلم', 'الترمذي'],
    answer: 'صفحة الحديث تعرض كتب الحديث وخيارات البحث والاستماع. تنبيه: بعض المحتوى المعروض فيها عينات وليست قاعدة شاملة لكل أحاديث الكتب.',
    source: { kind: 'website', title: 'الحديث الشريف', reference: 'كتب الحديث والبحث', url: '/hadith' },
  },
  {
    keywords: ['سبحه', 'سبحة', 'تسبيح', 'ذكر', 'اذكار', 'أذكار'],
    answer: 'تجد السبحة الإلكترونية في صفحة مستقلة؛ يمكنك اختيار الذكر واستخدام العداد.',
    source: { kind: 'website', title: 'السبحة الإلكترونية', reference: 'اختيار الذكر والعداد', url: '/tasbih' },
  },
  {
    keywords: ['فتوي', 'فتوى', 'فتاوي', 'فتاوى'],
    answer: 'تضم صفحة الفتاوى تصنيفات وبحثًا في الأسئلة المعروضة. لا تعتبر إجاباتها بديلًا عن سؤال أهل العلم في المسائل الشخصية.',
    source: { kind: 'website', title: 'الفتاوى', reference: 'التصنيفات والبحث', url: '/fatwa' },
  },
  {
    keywords: ['صدقه جاريه', 'صدقة جارية', 'صدقه', 'صدقة'],
    answer: 'تتيح صفحة الصدقة الجارية إنشاء صفحة تذكارية ومشاركتها.',
    source: { kind: 'website', title: 'الصدقة الجارية', reference: 'إنشاء صفحة ومشاركتها', url: '/sadaqah' },
  },
  {
    keywords: ['حسابي', 'حساب', 'مفضلات', 'المفضله', 'الخصوصيه'],
    answer: 'صفحة حسابي تعمل كتجربة زائر، وتوضح أن المفضلات تحفظ محليًا في المتصفح ولا توجد مصادقة حسابات حقيقية مفعلة.',
    source: { kind: 'website', title: 'حسابي', reference: 'حساب زائر وحفظ محلي', url: '/account' },
  },
];

function getSiteAnswer(question: string): { answer: string; sources: ChatSource[] } | null {
  const normalizedQuestion = normalizeSiteText(question);
  const asksForReciters = /(?:^|\s)(?:القارئ|قارئ|قاري|القراء|قراء|قراؤ|reciter|reciters)(?:$|\s)/i
    .test(normalizedQuestion);

  const matchedReciter = QURAN_RECITERS.find((reciter) => {
    const aliases = [
      reciter.name,
      reciter.englishName,
      ...(RECITER_ALIASES[reciter.id] ?? []),
    ].map(normalizeSiteText);
    return aliases.some((alias) => alias.length > 2 && normalizedQuestion.includes(alias));
  });

  if (matchedReciter) {
    return {
      answer: `نعم، ${matchedReciter.name} (${matchedReciter.englishName}) موجود ضمن القراء في الموقع. افتح رابطه للاستماع إلى تلاواته، ثم اختر السورة التي تريدها.`,
      sources: [{
        kind: 'website',
        title: matchedReciter.name,
        reference: 'صفحة القارئ واختيار السورة',
        url: `/quran/reciters/${matchedReciter.id}`,
      }],
    };
  }

  if (asksForReciters) {
    return {
      answer: `القراء المتاحون حاليًا (${QURAN_RECITERS.length}): ${QURAN_RECITERS.map((reciter) => reciter.name).join('، ')}. اضغط على اسم أي قارئ لفتح صفحته واختيار السورة.`,
      sources: QURAN_RECITERS.map((reciter) => ({
        kind: 'website' as const,
        title: reciter.name,
        reference: 'صفحة القارئ',
        url: `/quran/reciters/${reciter.id}`,
      })),
    };
  }

  const matchedSection = SITE_SECTIONS.find(({ keywords }) =>
    keywords.some((keyword) => containsSiteKeyword(normalizedQuestion, keyword))
  );
  if (matchedSection) {
    return { answer: matchedSection.answer, sources: [matchedSection.source] };
  }

  if (/محتوي|الموقع|موقع|خدمات|تعملوا|يوجد|عندكم/i.test(question)) {
    return {
      answer: 'يضم الموقع الاستماع لقراء القرآن واختيار السور، ومصحفًا للقراءة والبحث، وإذاعة القرآن الكريم، وصفحات للحديث والفتاوى والسبحة والصدقة الجارية وحساب الزائر. اختر القسم الذي تريده:',
      sources: [
        { kind: 'website', title: 'الاستماع والقراء', reference: 'القرآن الكريم', url: '/quran' },
        { kind: 'website', title: 'المصحف للقراءة', reference: 'قراءة وبحث', url: '/quran/read' },
        { kind: 'website', title: 'إذاعة القرآن الكريم', reference: 'المحطات', url: '/radio' },
        { kind: 'website', title: 'الحديث الشريف', reference: 'الحديث', url: '/hadith' },
        { kind: 'website', title: 'الفتاوى', reference: 'الأسئلة الشرعية', url: '/fatwa' },
        { kind: 'website', title: 'السبحة الإلكترونية', reference: 'الأذكار والعداد', url: '/tasbih' },
        { kind: 'website', title: 'الصدقة الجارية', reference: 'إنشاء صفحة', url: '/sadaqah' },
      ],
    };
  }

  return null;
}

function getSiteContext(): string {
  const reciters = QURAN_RECITERS.map(
    (reciter) => `- ${reciter.name} (${reciter.englishName}): /quran/reciters/${reciter.id}`
  ).join('\n');

  return [
    'معلومات موثوقة عن صفحات موقع سُبُل الحالية؛ استخدمها عند الإجابة عن أسئلة الموقع فقط:',
    '- /quran: قائمة القراء المتاحة حاليًا، وكل قارئ يفتح صفحة للاستماع إلى السور.',
    '- /quran/read: المصحف للقراءة، مع السور والبحث والتلاوة الصوتية.',
    '- /radio: محطات إذاعية قرآنية؛ قائمة المحطات تُحمّل من خدمة خارجية وقد تتغير.',
    '- /hadith: صفحة الحديث وخيارات البحث؛ لا تدّع أن المحتوى المعروض قاعدة شاملة.',
    '- /fatwa: تصنيفات وبحث ضمن فتاوى معروضة كعينات؛ لا تقدمها كفتوى شخصية أو مرجع شامل.',
    '- /tasbih: سبحة إلكترونية، اختيار ذكر وعداد.',
    '- /sadaqah: واجهة نموذج لإنشاء صفحة صدقة جارية؛ لا تدّع حفظًا أو نشرًا دائمًا غير موجود.',
    '- /account: تجربة زائر؛ الحفظ محلي في المتصفح ولا توجد مصادقة حقيقية مفعلة.',
    '- /privacy و/terms: صفحات الخصوصية وشروط الاستخدام.',
    'هذه قائمة القراء الحية المستخرجة من بيانات التطبيق؛ لا تضف قارئًا غير موجود فيها ولا تخترع مسارات:',
    reciters,
    'عند توجيه المستخدم إلى خدمة، أدرج رابطًا داخليًا بصيغة Markdown مثل [اسم الصفحة](/quran). استخدم فقط المسارات المذكورة هنا أو أسماء القراء أعلاه. لا تخترع ميزات أو بيانات غير موجودة.',
  ].join('\n');
}

function providerError(error: unknown) {
  const status = getErrorStatus(error);
  const code = getErrorCode(error) ?? '';
  if (status === 429 || /resource.?exhausted|rate.?limit|quota/.test(code)) {
    return {
      code: 'provider_rate_limited',
      message: 'وصل مفتاح Gemini إلى حد الطلبات أو الحصة المتاحة. تحقّق من الحصة والفوترة في Google AI Studio ثم أعد المحاولة.',
    };
  }
  if (status === 401 || status === 403) {
    return {
      code: 'gemini_credentials_invalid',
      message: 'تعذر اعتماد مفتاح Gemini. تحقق من صلاحية المفتاح والمنطقة وإعدادات الحصة.',
    };
  }
  return {
    code: 'provider_unavailable',
    message: 'تعذر الاتصال بخدمة الذكاء الاصطناعي الآن. أعد المحاولة لاحقًا.',
  };
}

function logProviderFailure(error: unknown) {
  console.error('Gemini chat request failed', {
    name: error instanceof Error ? error.name : 'UnknownError',
    status: getErrorStatus(error),
    code: getErrorCode(error),
  });
}

function encodeStreamEvent(event: object): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`);
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return jsonError(413, 'request_too_large', 'حجم الطلب أكبر من الحد المسموح.');
  }
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return jsonError(415, 'unsupported_content_type', 'أرسل الطلب بصيغة JSON.');
  }

  const rawBody = await readLimitedBody(request);
  if (rawBody === null) {
    return jsonError(413, 'request_too_large', 'حجم الطلب أكبر من الحد المسموح.');
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return jsonError(400, 'invalid_json', 'تعذر قراءة بيانات المحادثة.');
    }
    throw error;
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      400,
      'invalid_input',
      'تحقق من أن الرسائل غير فارغة وألا يتجاوز طول المحادثة الحد المسموح.'
    );
  }

  const messages = parsed.data.messages.slice(-50);
  const latestMessage = messages[messages.length - 1];
  if (latestMessage.role !== 'user') {
    return jsonError(400, 'invalid_turn', 'أرسل رسالة مستخدم جديدة لبدء الرد.');
  }

  const siteAnswer = getSiteAnswer(latestMessage.content);
  if (siteAnswer) {
    return staticResponse(siteAnswer.answer, siteAnswer.sources);
  }

  if (!GEMINI_API_KEY) {
    return jsonError(
      503,
      'gemini_not_configured',
      'الردود الحية غير مفعّلة بعد. أضف GEMINI_API_KEY إلى متغيرات بيئة الخادم فقط، ثم أعد تشغيل التطبيق.'
    );
  }

  const systemInstruction = [
    'أنت مساعد إسلامي ودود ومباشر في موقع سُبُل.',
    'أجب بلغة المستخدم، وكن واضحًا ومفيدًا، بدون أدلة أو توثيق متكلف.',
    getSiteContext(),
    'لا تختلق نصًا قرآنيًا أو حديثًا أو رقم مرجع أو درجة صحة. هذا الرد السريع لا يسترجع المصادر ولا يتحقق منها؛ إذا طلب المستخدم نصًا أو توثيقًا، فاذكر بوضوح أنك لا تستطيع التحقق منه في هذه المحادثة وأرشد إلى مراجعة مصدر موثوق.',
    'لا تقدم فتوى شخصية أو حكمًا قاطعًا في المسائل المختلف فيها؛ ووضح أن المسائل الشخصية تحتاج إلى أهل علم.',
    'لا تدّع أنك تملك صلاحية أو أنظمة أو حسابات لم توجد فعليًا في الموقع.',
  ].join('\n\n');

  const input = messages.map((message) => ({
    type: message.role === 'assistant' ? ('model_output' as const) : ('user_input' as const),
    content: [{ type: 'text' as const, text: message.content }],
  }));

  try {
    const client = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
    });
    const interactionStream = await client.interactions.create(
      {
        model: GEMINI_MODEL,
        input,
        system_instruction: systemInstruction,
        generation_config: {
          max_output_tokens: 800,
          thinking_level: 'low',
        },
        safety_settings: [
          { type: 'harassment', threshold: 'block_medium_and_above' },
          { type: 'hate_speech', threshold: 'block_medium_and_above' },
          { type: 'sexually_explicit', threshold: 'block_medium_and_above' },
          { type: 'dangerous_content', threshold: 'block_medium_and_above' },
        ],
        store: false,
        stream: true,
      },
      { timeout_ms: 25_000, retries: { strategy: 'none' } }
    );

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let hasText = false;
        let completed = false;
        let streamFailure: ReturnType<typeof providerError> | null = null;
        try {
          for await (const event of interactionStream) {
            if (event.event_type === 'error') {
              logProviderFailure(event.error);
              streamFailure = providerError(event.error);
              break;
            }
            if (event.event_type === 'interaction.completed') {
              completed = event.interaction.status === 'completed';
              continue;
            }
            if (
              event.event_type === 'step.delta' &&
              event.delta.type === 'text' &&
              event.delta.text
            ) {
              hasText = true;
              controller.enqueue(
                encodeStreamEvent({ type: 'delta', text: event.delta.text })
              );
            }
          }

          if (streamFailure) {
            controller.enqueue(
              encodeStreamEvent({ type: 'error', error: streamFailure })
            );
          } else if (!completed) {
            controller.enqueue(
              encodeStreamEvent({
                type: 'error',
                error: {
                  code: 'incomplete_provider_response',
                  message: 'لم يكتمل رد الذكاء الاصطناعي. أعد المحاولة.',
                },
              })
            );
          } else if (!hasText) {
            controller.enqueue(
              encodeStreamEvent({
                type: 'error',
                error: {
                  code: 'empty_provider_response',
                  message: 'وصل رد فارغ من خدمة الذكاء الاصطناعي. أعد المحاولة.',
                },
              })
            );
          } else {
            controller.enqueue(encodeStreamEvent({ type: 'done' }));
          }
        } catch (error) {
          logProviderFailure(error);
          controller.enqueue(
            encodeStreamEvent({ type: 'error', error: providerError(error) })
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    logProviderFailure(error);
    const failure = providerError(error);
    const status = getErrorStatus(error);
    const responseStatus =
      status === 429 ? 429 : status === 401 || status === 403 ? 503 : 502;
    return jsonError(responseStatus, failure.code, failure.message);
  }
}
