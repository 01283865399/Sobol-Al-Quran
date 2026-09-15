'use client';

import * as React from 'react';
import { PageLayout, PageHeader } from '@/components/page-layout';
import { ScrollText, Search, BookMarked, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

export default function HadithPage() {
  const [search, setSearch] = React.useState('');
  const [selectedBook, setSelectedBook] = React.useState('all');

  const filteredHadiths = sampleHadiths.filter((h) => {
    const matchesSearch =
      h.text.includes(search) || h.narrator.includes(search) || h.source.includes(search);
    const matchesBook = selectedBook === 'all' || h.book === selectedBook;
    return matchesSearch && matchesBook;
  });

  return (
    <PageLayout>
      <PageHeader
        title="الحديث الشريف"
        subtitle="صحيح البخاري ومسلم والسنن الأربعة والموطأ والمسند مع البحث والتصنيف"
        icon={<ScrollText className="w-8 h-8 text-accent" />}
      />

      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        {/* Books grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {hadithBooks.map((book, index) => (
            <div
              key={book.id}
              className="bg-card rounded-2xl p-5 border border-border/50 hover:border-accent/40 hover:shadow-teal transition-all duration-300 cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => setSelectedBook(book.id)}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/5 text-primary mb-3">
                <BookMarked className="w-6 h-6" />
              </div>
              <h3 className="font-kufi text-base font-bold text-foreground mb-1">{book.name}</h3>
              <p className="text-xs text-muted-foreground font-cairo mb-2">{book.author}</p>
              <p className="text-xs text-accent font-cairo">{book.count} حديث</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="ابحث في الحديث بالكلمة أو الراوي..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10 font-cairo"
            />
          </div>
          <Select value={selectedBook} onValueChange={setSelectedBook}>
            <SelectTrigger className="md:w-56 font-cairo">
              <SelectValue placeholder="كل الكتب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="font-cairo">كل الكتب</SelectItem>
              {hadithBooks.map((b) => (
                <SelectItem key={b.id} value={b.id} className="font-cairo">{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Hadiths list */}
        <div className="space-y-4">
          {filteredHadiths.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border/50 p-8 text-center">
              <p className="text-muted-foreground font-cairo">لا توجد نتائج مطابقة</p>
            </div>
          ) : (
            filteredHadiths.map((hadith, index) => (
              <div
                key={hadith.id}
                className="bg-card rounded-2xl p-6 lg:p-8 border border-border/50 hover:border-accent/30 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="relative w-10 h-10 flex items-center justify-center">
                      <svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full text-accent/30" fill="none">
                        <path d="M20 2 L25 8 L35 10 L28 18 L30 28 L20 24 L10 28 L12 18 L5 10 L15 8 Z" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                      <span className="relative font-kufi text-xs font-bold text-accent">{hadith.id}</span>
                    </div>
                    <Badge className={cn('font-cairo border-0', gradeColors[hadith.grade])}>
                      <CheckCircle2 className="w-3 h-3 ml-1" />
                      {hadith.grade}
                    </Badge>
                  </div>
                </div>
                <p className="font-amiri text-xl lg:text-2xl leading-loose text-foreground mb-4">
                  {hadith.text}
                </p>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground font-cairo border-t border-border/30 pt-4">
                  <p className="text-primary font-medium">{hadith.narrator}</p>
                  <p>{hadith.source}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PageLayout>
  );
}
