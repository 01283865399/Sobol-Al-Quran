import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { QURAN_RECITERS } from '@/lib/quran-api';
import type { ChatSource } from '@/lib/chat-types';

export const config = { path: '/api/chat' };

const MAX_BODY_BYTES = 32 * 1024;
const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_LENGTH = 20000;
const GEMINI_MODEL = 'gemini-3-flash-preview';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

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

function jsonError(status: number, code: string, message: string, retryAfter?: number) {
  return Response.json(
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
  return Response.json({ answer, answerType: 'notice', sources });
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
];

function getSiteAnswer(question: string): { answer: string; sources: ChatSource[] } | null {
  const normalizedQuestion = normalizeSiteText(question);
  if (/(?:فتوي|فتوى|فتاوي|فتاوى|صدقه جاريه|صدقة جارية|صدقه|صدقة|حسابي|مفضلات|المفضله)/i.test(normalizedQuestion)) {
    return {
      answer: 'هذا القسم غير متاح حاليًا ضمن الصفحات المنشورة في الموقع.',
      sources: [],
    };
  }
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
      answer: 'يضم الموقع الاستماع لقراء القرآن واختيار السور، ومصحفًا للقراءة والبحث، وإذاعة القرآن الكريم، وصفحات للحديث والسبحة. اختر القسم الذي تريده:',
      sources: [
        { kind: 'website', title: 'الاستماع والقراء', reference: 'القرآن الكريم', url: '/quran' },
        { kind: 'website', title: 'المصحف للقراءة', reference: 'قراءة وبحث', url: '/quran/read' },
        { kind: 'website', title: 'إذاعة القرآن الكريم', reference: 'المحطات', url: '/radio' },
        { kind: 'website', title: 'الحديث الشريف', reference: 'الحديث', url: '/hadith' },
        { kind: 'website', title: 'السبحة الإلكترونية', reference: 'الأذكار والعداد', url: '/tasbih' },
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
    '- /tasbih: سبحة إلكترونية، اختيار ذكر وعداد.',
    'صفحات الفتاوى والصدقة الجارية والحساب غير متاحة؛ لا توجّه المستخدم إليها ولا تدّع وجودها.',
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

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonError(405, 'method_not_allowed', 'استخدم طلب POST لإرسال رسالة.');
  }

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
