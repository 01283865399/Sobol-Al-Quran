'use client';

import * as React from 'react';
import { PageLayout } from '@/components/page-layout';
import { Search, BookMarked, CheckCircle2, Copy, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface HadithBook {
  id: string;
  apiId?: string;
  name: string;
  author: string;
}

interface HadithItem {
  key: string;
  id: number;
  text: string;
  sanad: string;
  matn: string;
  bookName: string;
  source: string;
  book: string;
  grade: string;
}

const hadithBooks: HadithBook[] = [
  { id: 'bukhari', apiId: 'bukhari', name: 'صحيح البخاري', author: 'الإمام البخاري' },
  { id: 'muslim', apiId: 'muslim', name: 'صحيح مسلم', author: 'الإمام مسلم' },
  { id: 'abudawud', apiId: 'abudawud', name: 'سنن أبي داود', author: 'أبو داود السجستاني' },
  { id: 'tirmidhi', apiId: 'tirmidhi', name: 'جامع الترمذي', author: 'الإمام الترمذي' },
  { id: 'nasai', apiId: 'nasai', name: 'سنن النسائي', author: 'الإمام النسائي' },
  { id: 'ibnmajah', apiId: 'ibnmajah', name: 'سنن ابن ماجه', author: 'ابن ماجه القزويني' },
  { id: 'malik', apiId: 'malik', name: 'موطأ مالك', author: 'الإمام مالك' },
  { id: 'ahmad', name: 'مسند أحمد', author: 'الإمام أحمد' },
];

const HADITHS_PER_REQUEST = 20;
const HADITHS_PER_PAGE = 9;
const ALL_HADITH_BOOKS = 'all';

interface HadithApiResponse {
  hasMore: boolean;
  hadiths: Array<{ id: number; text: string; grade: string | null }>;
}

const gradeColors: Record<string, string> = {
  'صحيح': 'bg-green-100 text-green-800',
  'حسن': 'bg-blue-100 text-blue-800',
  'ضعيف': 'bg-red-100 text-red-800',
};

function translateGrade(grade: string | null): string {
  if (!grade) return 'غير مذكور';
  const normalized = grade.trim().toLocaleLowerCase('en').replace(/[’']/g, '');
  const translations: Record<string, string> = {
    sahih: 'صحيح',
    hasan: 'حسن',
    daif: 'ضعيف',
    daeef: 'ضعيف',
    'hasan sahih': 'حسن صحيح',
  };
  return translations[normalized] ?? grade;
}

function normalizeSearchText(value: string): string {
  return value
    .toLocaleLowerCase('ar')
    .normalize('NFD')
    .replace(/[\u064b-\u065f\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه');
}

function splitHadithText(text: string): { sanad: string; matn: string } {
  const normalized = text.normalize('NFD').replace(/[\u064b-\u065f\u0670]/g, '');
  const marker = /(?:قال النبي|قال رسول الله|ان رسول الله|ان النبي|عن النبي|عن رسول الله|سمعت رسول الله)/u;
  const match = marker.exec(normalized);
  if (!match || match.index < 20) {
    return { sanad: 'السند مذكور ضمن نص الرواية كما ورد في المصدر', matn: text };
  }

  let normalizedIndex = 0;
  let originalIndex = text.length;
  for (let index = 0; index < text.length; index += 1) {
    const characters = [...text[index].normalize('NFD')];
    const significantCharacters = characters.filter((character) => !/[\u064b-\u065f\u0670]/u.test(character));
    if (normalizedIndex === match.index) {
      originalIndex = index;
      break;
    }
    normalizedIndex += significantCharacters.length;
  }
  const sanad = text.slice(originalIndex).trim() ? text.slice(0, originalIndex).trim() : text;
  const matn = text.slice(originalIndex).trim() || text;
  return { sanad, matn };
}

export default function HadithPage() {
  const [search, setSearch] = React.useState('');
  const [selectedBook, setSelectedBook] = React.useState('all');
  const [hadiths, setHadiths] = React.useState<HadithItem[]>([]);
  const [hasMoreByBook, setHasMoreByBook] = React.useState<Record<string, boolean>>({});
  const [loadedThrough, setLoadedThrough] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedHadith, setSelectedHadith] = React.useState<HadithItem | null>(null);
  const [copiedHadith, setCopiedHadith] = React.useState(false);
  const requestId = React.useRef(0);
  const hasMoreByBookRef = React.useRef(hasMoreByBook);
  hasMoreByBookRef.current = hasMoreByBook;

  const fetchBook = React.useCallback(async (
    book: HadithBook,
    from: number,
    to: number
  ): Promise<{ items: HadithItem[]; hasMore: boolean }> => {
    const params = new URLSearchParams({
      book: book.apiId ?? '',
      from: String(from),
      to: String(to),
    });
    const response = await fetch(`/api/hadith?${params.toString()}`);
    if (!response.ok) throw new Error('Hadith request failed');

    const result = await response.json() as HadithApiResponse;
    return {
      hasMore: result.hasMore,
      items: result.hadiths.map((hadith) => {
        const normalizedGrade = translateGrade(hadith.grade);
        const { sanad, matn } = splitHadithText(hadith.text);
        return {
          key: `${book.id}:${hadith.id}`,
          id: hadith.id,
          text: hadith.text,
          sanad,
          matn,
          bookName: book.name,
          source: `${book.name} · رقم ${hadith.id}`,
          book: book.id,
          grade: normalizedGrade,
        };
      }),
    };
  }, []);

  const loadRange = React.useCallback(async (from: number, replace: boolean) => {
    const id = ++requestId.current;
    const books = selectedBook === ALL_HADITH_BOOKS
      ? hadithBooks.filter((book) => book.apiId && (from === 1 || hasMoreByBookRef.current[book.id] !== false))
      : hadithBooks.filter((book) => book.id === selectedBook && book.apiId);
    setIsLoading(true);
    setLoadError(false);

    try {
      const results = await Promise.all(
        books.map(async (book) => ({ book, ...(await fetchBook(book, from, from + HADITHS_PER_REQUEST - 1)) }))
      );
      if (id !== requestId.current) return;

      const fetched = results.flatMap(({ items }) => items);
      setHadiths((current) => {
        const next = replace ? fetched : [...current, ...fetched];
        return next.sort((first, second) => (
          first.book.localeCompare(second.book) || first.id - second.id
        ));
      });
      setHasMoreByBook((current) => ({
        ...current,
        ...Object.fromEntries(results.map(({ book, hasMore }) => [book.id, hasMore])),
      }));
      setLoadedThrough(from + HADITHS_PER_REQUEST - 1);
    } catch (error) {
      if (id !== requestId.current) return;
      console.error('Unable to load hadith collection data', error);
      setLoadError(true);
    } finally {
      if (id === requestId.current) setIsLoading(false);
    }
  }, [fetchBook, selectedBook]);

  React.useEffect(() => {
    setHadiths([]);
    setHasMoreByBook({});
    setLoadedThrough(0);
    setCurrentPage(1);
    void loadRange(1, true);
    return () => {
      requestId.current += 1;
    };
  }, [loadRange]);

  const normalizedSearch = normalizeSearchText(search.trim());
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedBook]);

  React.useEffect(() => {
    if (!selectedHadith) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedHadith(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedHadith]);

  const copyHadith = () => {
    if (!selectedHadith || !navigator.clipboard) return;
    void navigator.clipboard.writeText(`${selectedHadith.text}\n\n${selectedHadith.source}`)
      .then(() => {
        setCopiedHadith(true);
        window.setTimeout(() => setCopiedHadith(false), 1800);
      });
  };

  const filteredHadiths = hadiths.filter((h) => {
    const matchesSearch = [
      h.text,
      h.source,
    ].some((value) => normalizeSearchText(value).includes(normalizedSearch));
    const matchesBook = selectedBook === 'all' || h.book === selectedBook;
    return matchesSearch && matchesBook;
  });
  const pageCount = Math.max(1, Math.ceil(filteredHadiths.length / HADITHS_PER_PAGE));
  const visibleHadiths = filteredHadiths.slice(
    (currentPage - 1) * HADITHS_PER_PAGE,
    currentPage * HADITHS_PER_PAGE
  );
  const visibleHadithGroups = visibleHadiths.reduce<Record<string, HadithItem[]>>((groups, hadith) => {
    (groups[hadith.book] ??= []).push(hadith);
    return groups;
  }, {});
  const hasMore = selectedBook === ALL_HADITH_BOOKS
    ? hadithBooks.some((book) => book.apiId && (hasMoreByBook[book.id] ?? true))
    : Boolean(hadithBooks.find((book) => book.id === selectedBook)?.apiId && hasMoreByBook[selectedBook] !== false);

  return (
    <PageLayout>
      <div className="hadith-page">
        <section className="hadith-workspace" aria-label="أدوات البحث والتصفية">
          <div className="hadith-workspace__top">
            <div>
              <span className="hadith-workspace__label">المكتبة</span>
              <h1>الحديث الشريف</h1>
            </div>
            <div className="hadith-workspace__stats">
              <span><strong>{filteredHadiths.length}</strong> معروض</span>
              <span><strong>{hadiths.length}</strong> محمّل</span>
            </div>
          </div>
          <div className="hadith-searchbox">
            <Search className="h-5 w-5" aria-hidden="true" />
            <Input
              placeholder="اكتب كلمة أو عبارة من الحديث..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="ابحث في نص الحديث أو اسم الكتاب أو المصدر"
            />
            {search && <button type="button" aria-label="مسح البحث" onClick={() => setSearch('')}>×</button>}
          </div>
          <div className="hadith-books" aria-label="اختر كتاب الحديث">
            <button
              type="button"
              aria-pressed={selectedBook === 'all'}
              onClick={() => setSelectedBook('all')}
              className={cn('hadith-book-filter', selectedBook === 'all' && 'is-active')}
            >
              <span className="hadith-book-filter__number">كل</span>
              <span><strong>كل الكتب</strong><small>استعرض المجموعة</small></span>
            </button>
            <button
              type="button"
              className="hadith-book-filter hadith-book-filter--disabled"
              disabled
              aria-label="مسند أحمد غير متاح"
            >
              <span className="hadith-book-filter__number">—</span>
              <span><strong>مسند أحمد</strong><small>غير متاح حاليًا</small></span>
            </button>
            {hadithBooks.filter((book) => book.apiId).map((book) => (
              <button
                key={book.id}
                type="button"
                aria-pressed={selectedBook === book.id}
                title={book.author}
                onClick={() => setSelectedBook(book.id)}
                className={cn('hadith-book-filter', selectedBook === book.id && 'is-active')}
              >
                <span className="hadith-book-filter__number"><BookMarked className="h-4 w-4" aria-hidden="true" /></span>
                <span><strong>{book.name}</strong><small>{book.author}</small></span>
              </button>
            ))}
          </div>
          {loadError && (
            <div className="hadith-alert" role="alert">
              <span>تعذّر تحميل الأحاديث من المصدر الخارجي. تحقق من الاتصال ثم أعد المحاولة.</span>
              <button type="button" className="font-semibold underline" onClick={() => void loadRange(loadedThrough === 0 ? 1 : loadedThrough + 1, loadedThrough === 0)}>
                إعادة المحاولة
              </button>
            </div>
          )}
        </section>

        <main className="hadith-results">
          <div className="hadith-results__heading">
            <div>
              <span className="hadith-workspace__label">المحتوى</span>
              <h2>{selectedBook === 'all' ? 'أحدث الأحاديث المحمّلة' : hadithBooks.find((book) => book.id === selectedBook)?.name}</h2>
            </div>
            <span>{pageCount > 1 ? `صفحة ${currentPage} من ${pageCount}` : `${filteredHadiths.length} حديث`}</span>
          </div>
          {isLoading && filteredHadiths.length === 0 ? (
            <div className="hadith-empty" role="status">
              جارٍ تحميل الأحاديث...
            </div>
          ) : filteredHadiths.length === 0 ? (
            <div className="hadith-empty">
              <p className="text-muted-foreground font-cairo">
                {loadError ? 'تعذّر تحميل الأحاديث من المصدر.' : 'لا توجد نتائج مطابقة في الأحاديث المحمّلة.'}
              </p>
            </div>
          ) : (
            <div className="hadith-sections">
            {Object.entries(visibleHadithGroups).map(([bookId, bookHadiths]) => {
              const book = hadithBooks.find((item) => item.id === bookId);
              return (
                <section key={bookId} className="hadith-section" aria-labelledby={`hadith-section-${bookId}`}>
                  <header className="hadith-section__header">
                    <div>
                      <span className="hadith-section__icon"><BookMarked className="h-4 w-4" aria-hidden="true" /></span>
                      <div>
                        <h2 id={`hadith-section-${bookId}`}>{book?.name ?? bookHadiths[0]?.bookName}</h2>
                        <p>{book?.author} · {bookHadiths.length} أحاديث في هذه الصفحة</p>
                      </div>
                    </div>
                    <span className="hadith-section__count">{hadiths.length} إجمالًا</span>
                  </header>
                  <ul className="hadith-list">
                  {bookHadiths.map((hadith) => (
              <li
                key={hadith.key}
                className="hadith-list__item"
                role="button"
                tabIndex={0}
                onClick={() => { setCopiedHadith(false); setSelectedHadith(hadith); }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setCopiedHadith(false);
                    setSelectedHadith(hadith);
                  }
                }}
                aria-label={`فتح الحديث رقم ${hadith.id} من ${hadith.bookName}`}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-accent/10 px-2 font-kufi text-xs font-bold text-accent">
                      {hadith.id}
                    </span>
                    <span className="truncate text-sm font-medium text-primary">{hadith.bookName}</span>
                  </div>
                  <Badge className={cn('shrink-0 border-0 font-cairo', gradeColors[hadith.grade] ?? 'bg-muted text-muted-foreground')}>
                      <CheckCircle2 className="w-3 h-3 ml-1" />
                      {hadith.grade}
                  </Badge>
                </div>
                <div className="hadith-card__chain">
                  <span>السند</span>
                  <p>{hadith.sanad}</p>
                </div>
                <div className="hadith-card__matn">
                  <span>المتن</span>
                  <p className="hadith-card__text font-amiri text-xl leading-[1.9] text-foreground sm:text-2xl">
                    {hadith.matn}
                  </p>
                </div>
                <div className="border-t border-border/40 pt-3">
                  <p className="text-xs leading-5 text-muted-foreground">اضغط لفتح القراءة الكاملة · {hadith.source}</p>
                </div>
              </li>
            ))}
                  </ul>
                </section>
              );
            })}
            </div>
          )}
          {pageCount > 1 && (
            <nav className="hadith-pagination" aria-label="تقسيم صفحات الأحاديث">
              <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)}>
                السابق
              </button>
              <span aria-live="polite">صفحة {currentPage} من {pageCount}</span>
              <button type="button" disabled={currentPage === pageCount} onClick={() => setCurrentPage((page) => page + 1)}>
                التالي
              </button>
            </nav>
          )}
          {hasMore && hadiths.length > 0 && (
            <div className="flex justify-center py-5">
              <button
                type="button"
                className="min-h-10 rounded-full border border-primary/30 px-5 text-sm font-medium text-primary transition-colors hover:bg-primary/5 disabled:opacity-50"
                disabled={isLoading}
                onClick={() => void loadRange(loadedThrough + 1, false)}
              >
                {isLoading ? 'جارٍ التحميل...' : 'تحميل المزيد'}
              </button>
            </div>
          )}
          <p className="hadith-source">المصدر التقني: <a href="https://github.com/fawazahmed0/hadith-api" target="_blank" rel="noreferrer">Hadith API</a></p>
        </main>
        {selectedHadith && (
          <div
            className="hadith-detail-layer"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setSelectedHadith(null);
            }}
          >
            <article className="hadith-detail" role="dialog" aria-modal="true" aria-labelledby="hadith-detail-title" dir="rtl">
              <header className="hadith-detail__header">
                <div>
                  <span className="hadith-workspace__label">نص الحديث</span>
                  <h2 id="hadith-detail-title">{selectedHadith.bookName}</h2>
                  <p>{selectedHadith.source}</p>
                </div>
                <button type="button" className="hadith-detail__close" aria-label="إغلاق الحديث" onClick={() => setSelectedHadith(null)}>
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </header>
              <div className="hadith-detail__meta">
                <span>الحديث رقم {selectedHadith.id.toLocaleString('ar')}</span>
                <Badge className={cn('border-0 font-cairo', gradeColors[selectedHadith.grade] ?? 'bg-muted text-muted-foreground')}>
                  <CheckCircle2 className="ml-1 h-3 w-3" aria-hidden="true" />
                  {selectedHadith.grade}
                </Badge>
              </div>
              <div className="hadith-detail__chain">
                <span>السند</span>
                <p>{selectedHadith.sanad}</p>
              </div>
              <div className="hadith-detail__matn">
                <span>المتن</span>
                <p className="hadith-detail__text">{selectedHadith.matn}</p>
              </div>
              <footer className="hadith-detail__footer">
                <span>{selectedHadith.source}</span>
                <button type="button" onClick={copyHadith}>
                  <Copy className="ml-1 h-4 w-4" aria-hidden="true" />
                  {copiedHadith ? 'تم النسخ' : 'نسخ الحديث'}
                </button>
              </footer>
            </article>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
