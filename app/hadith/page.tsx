'use client';

import * as React from 'react';
import { PageLayout } from '@/components/page-layout';
import { ScrollText, Search, BookMarked, CheckCircle2, Headphones } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { HadithListeningPlayer } from '@/components/hadith-listening-player';
import { useAudioPlayback } from '@/components/audio-playback-provider';
import { cn } from '@/lib/utils';

interface HadithBook {
  id: string;
  name: string;
  author: string;
  count: string;
}

interface HadithItem {
  id: number;
  text: string;
  narrator: string;
  source: string;
  book: string;
  grade: 'صحيح' | 'حسن' | 'ضعيف';
}

const hadithBooks: HadithBook[] = [
  { id: 'bukhari', name: 'صحيح البخاري', author: 'الإمام البخاري', count: '7,563' },
  { id: 'muslim', name: 'صحيح مسلم', author: 'الإمام مسلم', count: '7,421' },
  { id: 'abudawud', name: 'سنن أبي داود', author: 'أبو داود السجستاني', count: '5,274' },
  { id: 'tirmidhi', name: 'جامع الترمذي', author: 'الإمام الترمذي', count: '3,956' },
  { id: 'nasai', name: 'سنن النسائي', author: 'الإمام النسائي', count: '5,758' },
  { id: 'ibnmajah', name: 'سنن ابن ماجه', author: 'ابن ماجه القزويني', count: '4,341' },
  { id: 'malik', name: 'موطأ مالك', author: 'الإمام مالك', count: '1,847' },
  { id: 'ahmad', name: 'مسند أحمد', author: 'الإمام أحمد', count: '27,647' },
];

const sampleHadiths: HadithItem[] = [
  {
    id: 1,
    text: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    narrator: 'عمر بن الخطاب رضي الله عنه',
    source: 'صحيح البخاري - كتاب بدء الوحي - رقم 1',
    book: 'bukhari',
    grade: 'صحيح',
  },
  {
    id: 2,
    text: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
    narrator: 'أبو هريرة رضي الله عنه',
    source: 'صحيح مسلم - كتاب الإيمان - رقم 47',
    book: 'muslim',
    grade: 'صحيح',
  },
  {
    id: 3,
    text: 'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ',
    narrator: 'عبد الله بن عمرو رضي الله عنهما',
    source: 'صحيح البخاري - كتاب الإيمان - رقم 10',
    book: 'bukhari',
    grade: 'صحيح',
  },
  {
    id: 4,
    text: 'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
    narrator: 'أنس بن مالك رضي الله عنه',
    source: 'صحيح البخاري - كتاب الإيمان - رقم 13',
    book: 'bukhari',
    grade: 'صحيح',
  },
  {
    id: 5,
    text: 'الطُّهُورُ شَطْرُ الْإِيمَانِ، وَالْحَمْدُ لِلَّهِ تَمْلَأُ الْمِيزَانَ',
    narrator: 'أبو مالك الأشعري رضي الله عنه',
    source: 'صحيح مسلم - كتاب الطهارة - رقم 223',
    book: 'muslim',
    grade: 'صحيح',
  },
];

const gradeColors: Record<string, string> = {
  'صحيح': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'حسن': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'ضعيف': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

function normalizeSearchText(value: string): string {
  return value
    .toLocaleLowerCase('ar')
    .normalize('NFD')
    .replace(/[\u064b-\u065f\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه');
}

export default function HadithPage() {
  const { mainPlayerOpen, setMainPlayerOpen, setPlayerRoute } = useAudioPlayback();
  const [search, setSearch] = React.useState('');
  const [selectedBook, setSelectedBook] = React.useState('all');
  const [selectedHadith, setSelectedHadith] = React.useState<HadithItem | null>(null);

  const normalizedSearch = normalizeSearchText(search.trim());
  const filteredHadiths = sampleHadiths.filter((h) => {
    const matchesSearch = [
      h.text,
      h.narrator,
      h.source,
    ].some((value) => normalizeSearchText(value).includes(normalizedSearch));
    const matchesBook = selectedBook === 'all' || h.book === selectedBook;
    return matchesSearch && matchesBook;
  });

  return (
    <PageLayout>
      {selectedHadith && (
        <HadithListeningPlayer
          open={mainPlayerOpen}
          onClose={() => setMainPlayerOpen(false)}
          hadith={selectedHadith}
          hadiths={filteredHadiths}
          onSelectHadith={setSelectedHadith}
        />
      )}

      <div className="container mx-auto px-4 py-4 lg:px-8 lg:py-6">
        <section className="mb-5 rounded-2xl border border-border/50 bg-card p-4 sm:p-5" aria-label="البحث وتصفية كتب الحديث">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary">
              <ScrollText className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h1 className="font-kufi text-lg font-bold text-foreground">الحديث الشريف</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                ابحث في الأحاديث المتاحة واختر كتابًا لتصفية النتائج.
              </p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="ابحث في الحديث بالكلمة أو الراوي..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 pr-10 font-cairo"
              aria-label="ابحث في نص الحديث أو الراوي أو المصدر"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2" aria-label="تصفية حسب الكتاب">
            <button
              type="button"
              aria-pressed={selectedBook === 'all'}
              onClick={() => setSelectedBook('all')}
              className={cn(
                'min-h-9 rounded-full border px-3 text-xs transition-colors',
                selectedBook === 'all'
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border/70 text-muted-foreground hover:border-accent/50 hover:text-primary'
              )}
            >
              كل الكتب
            </button>
            {hadithBooks.map((book) => (
              <button
                key={book.id}
                type="button"
                aria-pressed={selectedBook === book.id}
                title={`${book.author} · ${book.count} حديث`}
                onClick={() => setSelectedBook(book.id)}
                className={cn(
                  'inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-xs transition-colors',
                  selectedBook === book.id
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border/70 text-muted-foreground hover:border-accent/50 hover:text-primary'
                )}
              >
                <BookMarked className="h-3.5 w-3.5" aria-hidden="true" />
                {book.name}
                <span className={selectedBook === book.id ? 'opacity-75' : 'text-accent'}>
                  {book.count}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground" aria-live="polite">
            {filteredHadiths.length} حديث معروض من المحتوى المتاح
          </p>
        </section>

        {/* Hadiths list */}
        <div className="mx-auto max-w-5xl">
          {filteredHadiths.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border/50 p-8 text-center">
              <p className="text-muted-foreground font-cairo">لا توجد نتائج مطابقة</p>
            </div>
          ) : (
            <ul className="overflow-hidden rounded-2xl border border-border/50 bg-card divide-y divide-border/50">
            {filteredHadiths.map((hadith) => (
              <li key={hadith.id} className="px-4 py-4 transition-colors hover:bg-accent/[0.03] sm:px-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-accent/10 px-2 font-kufi text-xs font-bold text-accent">
                      {hadith.id}
                    </span>
                    <span className="truncate text-sm font-medium text-primary">{hadith.narrator}</span>
                  </div>
                  <Badge className={cn('shrink-0 border-0 font-cairo', gradeColors[hadith.grade])}>
                      <CheckCircle2 className="w-3 h-3 ml-1" />
                      {hadith.grade}
                  </Badge>
                </div>
                <p className="mb-3 font-amiri text-xl leading-[1.9] text-foreground sm:text-2xl">
                  {hadith.text}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-3">
                  <p className="text-xs leading-5 text-muted-foreground">{hadith.source}</p>
                  <button
                    type="button"
                    className="inline-flex min-h-9 items-center gap-2 rounded-full border border-accent/30 px-3 text-xs font-medium text-primary transition-colors hover:border-accent hover:bg-primary/5"
                    onClick={() => {
                      setSelectedHadith(hadith);
                      setPlayerRoute('/hadith');
                      setMainPlayerOpen(true);
                    }}
                  >
                    <Headphones className="h-4 w-4" aria-hidden="true" />
                    استمع بصوت الجهاز
                  </button>
                </div>
              </li>
            ))}
            </ul>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
