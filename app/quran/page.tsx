'use client';

import * as React from 'react';
import { PageLayout, PageHeader } from '@/components/page-layout';
import { BookOpen, Search, Play, Pause, Bookmark, Copy, Share2, ChevronLeft, ChevronRight, Type, Loader2, Volume2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  sajda: boolean | object;
}

interface SurahData {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
  ayahs: Ayah[];
}

interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

const reciters = [
  { id: 'yasser', name: 'ياسر الدوسري', server: 'https://server11.mp3quran.net/yasser/' },
  { id: 'alhussary', name: 'محمود خليل الحصري', server: 'https://server6.mp3quran.net/husr/' },
  { id: 'minshawi', name: 'محمد صديق المنشاوي', server: 'https://server8.mp3quran.net/minsh/' },
  { id: 'abdulbasit', name: 'عبد الباسط عبد الصمد', server: 'https://server7.mp3quran.net/basit/' },
  { id: 'sudais', name: 'عبد الرحمن السديس', server: 'https://server11.mp3quran.net/sds/' },
  { id: 'afasy', name: 'مشاري العفاسي', server: 'https://server11.mp3quran.net/afs/' },
  { id: 'shuraim', name: 'سعود الشريم', server: 'https://server7.mp3quran.net/shuraim/' },
  { id: 'ajmy', name: 'أحمد العجمي', server: 'https://server10.mp3quran.net/ajm/' },
  { id: 'ghamdi', name: 'سعد الغامدي', server: 'https://server7.mp3quran.net/s_gmd/' },
];

const tafsirOptions = [
  { id: 'ibnkathir', name: 'تفسير ابن كثير' },
  { id: 'tabari', name: 'تفسير الطبري' },
  { id: 'saadi', name: 'تفسير السعدي' },
  { id: 'qurtubi', name: 'تفسير القرطبي' },
  { id: 'muyassar', name: 'التفسير الميسر' },
];

const padNumber = (n: number) => String(n).padStart(3, '0');

export default function QuranPage() {
  const [search, setSearch] = React.useState('');
  const [surahList, setSurahList] = React.useState<SurahMeta[]>([]);
  const [listLoading, setListLoading] = React.useState(true);
  const [listError, setListError] = React.useState('');

  const [selectedSurah, setSelectedSurah] = React.useState<SurahData | null>(null);
  const [surahLoading, setSurahLoading] = React.useState(false);
  const [surahError, setSurahError] = React.useState('');

  const [selectedReciter, setSelectedReciter] = React.useState(reciters[0].id);
  const [selectedTafsir, setSelectedTafsir] = React.useState(tafsirOptions[0].id);
  const [bookmarked, setBookmarked] = React.useState<number[]>([]);
  const [fontSize, setFontSize] = React.useState(2);

  const [audioRef] = React.useState<React.RefObject<HTMLAudioElement>>(() => React.createRef());
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentAyah, setCurrentAyah] = React.useState<number>(-1);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<{ ayah: Ayah; surah: SurahMeta }[]>([]);
  const [searchLoading, setSearchLoading] = React.useState(false);

  React.useEffect(() => {
    fetch('https://api.alquran.cloud/v1/surah')
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 200) {
          setSurahList(data.data as SurahMeta[]);
        } else {
          setListError('تعذر تحميل قائمة السور');
        }
      })
      .catch(() => setListError('تعذر الاتصال بالخادم'))
      .finally(() => setListLoading(false));
  }, []);

  const loadSurah = React.useCallback((surahNumber: number) => {
    setSurahLoading(true);
    setSurahError('');
    setSelectedSurah(null);
    fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`)
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 200) {
          setSelectedSurah(data.data as SurahData);
        } else {
          setSurahError('تعذر تحميل السورة');
        }
      })
      .catch(() => setSurahError('تعذر الاتصال بالخادم'))
      .finally(() => setSurahLoading(false));
  }, []);

  const reciter = reciters.find((r) => r.id === selectedReciter)!;

  const getAyahAudioUrl = (surahNumber: number, ayahInSurah: number) =>
    `${reciter.server}${padNumber(surahNumber)}${padNumber(ayahInSurah)}.mp3`;

  const getSurahAudioUrl = (surahNumber: number) =>
    `${reciter.server}${padNumber(surahNumber)}.mp3`;

  const playAyah = (surahNumber: number, ayahInSurah: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const url = getAyahAudioUrl(surahNumber, ayahInSurah);
    audio.src = url;
    audio.play().then(() => {
      setIsPlaying(true);
      setCurrentAyah(ayahInSurah);
    }).catch(() => {});
  };

  const playSurah = (surahNumber: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const url = getSurahAudioUrl(surahNumber);
    audio.src = url;
    audio.play().then(() => {
      setIsPlaying(true);
      setCurrentAyah(-1);
    }).catch(() => {});
  };

  const stopAudio = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
    }
    setIsPlaying(false);
    setCurrentAyah(-1);
  };

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentAyah(-1);
    };
    const onPause = () => setIsPlaying(false);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('pause', onPause);
    return () => {
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('pause', onPause);
    };
  }, [audioRef]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchResults([]);
    const fetchSearch = async () => {
      try {
        const res = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(searchQuery)}/all/quran-uthmani`);
        const data = await res.json();
        if (data.code === 200 && data.data?.matches) {
          const results = data.data.matches.map((m: { surah: { number: number }; numberInSurah: number; text: string; sajda: boolean | object }) => {
            const surah = surahList.find((s) => s.number === m.surah.number) || surahList[0];
            return {
              ayah: { number: 0, numberInSurah: m.numberInSurah, text: m.text, sajda: m.sajda },
              surah,
            };
          });
          setSearchResults(results);
        }
      } catch {
      } finally {
        setSearchLoading(false);
      }
    };
    fetchSearch();
  };

  const filteredSurahs = surahList.filter(
    (s) =>
      s.name.includes(search) ||
      s.englishName.toLowerCase().includes(search.toLowerCase()) ||
      s.englishNameTranslation.toLowerCase().includes(search.toLowerCase()) ||
      String(s.number).includes(search)
  );

  const toggleBookmark = (num: number) => {
    setBookmarked((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  const copyText = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  };

  return (
    <PageLayout>
      <audio ref={audioRef} />
      <PageHeader
        title="القرآن الكريم"
        subtitle="المصحف الكامل بـ114 سورة بترقيم عثماني، مع التلاوة والتفسير والبحث"
        icon={<BookOpen className="w-8 h-8 text-accent" />}
      />

      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <Tabs defaultValue="surahs" className="w-full">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
            <TabsList className="bg-card border border-border/50">
              <TabsTrigger value="surahs" className="font-cairo" onClick={() => { if (selectedSurah) { stopAudio(); setSelectedSurah(null); } }}>
                {selectedSurah ? `سورة ${selectedSurah.name}` : 'قائمة السور'}
              </TabsTrigger>
              <TabsTrigger value="search" className="font-cairo">البحث</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Select value={selectedReciter} onValueChange={(v) => { stopAudio(); setSelectedReciter(v); }}>
                <SelectTrigger className="w-48 font-cairo text-sm">
                  <SelectValue placeholder="اختر القارئ" />
                </SelectTrigger>
                <SelectContent>
                  {reciters.map((r) => (
                    <SelectItem key={r.id} value={r.id} className="font-cairo">
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" onClick={() => setFontSize((p) => Math.max(0, p - 1))} className="rounded-lg h-9 w-9">
                  <span className="text-xs font-bold">أ-</span>
                </Button>
                <Button variant="outline" size="icon" onClick={() => setFontSize((p) => Math.min(4, p + 1))} className="rounded-lg h-9 w-9">
                  <span className="text-sm font-bold">أ+</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Surah List / Reading View */}
          <TabsContent value="surahs" className="space-y-4">
            {!selectedSurah && !surahLoading && (
              <>
                <div className="relative max-w-xl mx-auto mb-8">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="ابحث عن سورة بالاسم أو الرقم..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pr-10 font-cairo"
                  />
                </div>

                {listLoading && (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-accent" />
                  </div>
                )}

                {listError && (
                  <div className="bg-card rounded-2xl border border-border/50 p-8 text-center">
                    <p className="text-muted-foreground font-cairo">{listError}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSurahs.map((surah, index) => (
                    <div
                      key={surah.number}
                      className="group bg-card rounded-2xl p-5 border border-border/50 hover:border-accent/40 hover:shadow-teal transition-all duration-300 animate-fade-in-up cursor-pointer"
                      style={{ animationDelay: `${Math.min(index * 0.02, 0.5)}s` }}
                      onClick={() => loadSurah(surah.number)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="relative w-12 h-12 flex items-center justify-center">
                          <svg viewBox="0 0 48 48" className="absolute inset-0 w-full h-full text-accent/30" fill="none">
                            <path d="M24 2 L30 10 L44 12 L34 22 L36 36 L24 30 L12 36 L14 22 L4 12 L18 10 Z" stroke="currentColor" strokeWidth="1.5" />
                          </svg>
                          <span className="relative font-kufi text-sm font-bold text-accent">{surah.number}</span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleBookmark(surah.number); }}
                          className="text-muted-foreground hover:text-accent transition-colors"
                        >
                          <Bookmark className={cn('w-5 h-5', bookmarked.includes(surah.number) && 'fill-accent text-accent')} />
                        </button>
                      </div>
                      <h3 className="font-kufi text-xl font-bold text-primary mb-1 group-hover:text-accent transition-colors">
                        {surah.name}
                      </h3>
                      <p className="text-xs text-muted-foreground font-cairo mb-2">{surah.englishName} — {surah.englishNameTranslation}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-cairo">
                        <span className="px-2 py-0.5 rounded-full bg-primary/5 text-primary">
                          {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                        </span>
                        <span>{surah.numberOfAyahs} آية</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {surahLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-accent mb-4" />
                <p className="text-muted-foreground font-cairo">جاري تحميل السورة...</p>
              </div>
            )}

            {surahError && !surahLoading && (
              <div className="bg-card rounded-2xl border border-border/50 p-8 text-center">
                <p className="text-muted-foreground font-cairo mb-4">{surahError}</p>
                <Button variant="outline" onClick={() => setSelectedSurah(null)} className="font-cairo">
                  العودة للقائمة
                </Button>
              </div>
            )}

            {selectedSurah && !surahLoading && (
              <div className="max-w-3xl mx-auto">
                {/* Surah header */}
                <div className="flex items-center justify-between mb-6">
                  <Button variant="ghost" onClick={() => { stopAudio(); setSelectedSurah(null); }} className="font-cairo">
                    <ChevronRight className="w-5 h-5 ml-1" />
                    العودة للقائمة
                  </Button>
                  <div className="text-center">
                    <h2 className="font-kufi text-2xl font-bold text-primary">{selectedSurah.name}</h2>
                    <p className="text-xs text-muted-foreground font-cairo">
                      {selectedSurah.numberOfAyahs} آية — {selectedSurah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                    </p>
                  </div>
                  <div className="w-24" />
                </div>

                {/* Audio controls - above the surah */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                  {!isPlaying ? (
                    <Button
                      className="font-cairo bg-primary hover:bg-primary/90"
                      onClick={() => playSurah(selectedSurah.number)}
                    >
                      <Play className="w-4 h-4 ml-1" />
                      استماع للسورة كاملة — {reciter.name}
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      className="font-cairo"
                      onClick={stopAudio}
                    >
                      <Pause className="w-4 h-4 ml-1" />
                      إيقاف التشغيل
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-cairo"
                    onClick={() => copyText(selectedSurah.ayahs.map((a) => a.text).join(' '))}
                  >
                    <Copy className="w-4 h-4 ml-1" /> نسخ السورة
                  </Button>
                </div>

                <div className="bg-card rounded-2xl border border-border/50 p-6 lg:p-10 shadow-deep">
                  {/* Bismillah (except Surah At-Tawbah) */}
                  {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
                    <div className="text-center mb-8 pb-6 border-b border-border/30">
                      <p className="font-amiri text-2xl text-accent mb-2">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-px w-16 bg-accent/30" />
                        <div className="w-2 h-2 rotate-45 border border-accent/40" />
                        <div className="h-px w-16 bg-accent/30" />
                      </div>
                    </div>
                  )}

                  {/* Ayahs */}
                  <div
                    className="font-quran text-right leading-loose text-foreground"
                    style={{ fontSize: `${1.5 + fontSize * 0.25}rem`, lineHeight: 2.2 }}
                  >
                    {selectedSurah.ayahs.map((ayah) => (
                      <span
                        key={ayah.number}
                        className={cn(
                          'cursor-pointer transition-colors rounded px-1',
                          currentAyah === ayah.numberInSurah
                            ? 'bg-accent/20 text-accent'
                            : 'hover:bg-accent/10'
                        )}
                        onClick={() => playAyah(selectedSurah.number, ayah.numberInSurah)}
                      >
                        {selectedSurah.number !== 1 && ayah.numberInSurah === 1
                          ? ayah.text.replace(/^﻿?بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s*/, '')
                          : ayah.text}
                        <span className="inline-flex items-center justify-center w-8 h-8 mx-1 rounded-full border-2 border-accent/40 text-sm font-kufi text-accent align-middle">
                          {ayah.numberInSurah}
                        </span>{' '}
                      </span>
                    ))}
                  </div>

                </div>

                {/* Per-ayah audio quick bar */}
                <div className="mt-4 bg-card rounded-2xl border border-border/50 p-4">
                  <p className="text-sm text-muted-foreground font-cairo mb-3 text-center">
                    اضغط على أي آية لتشغيل تلاوتها بصوت {reciter.name}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {selectedSurah.ayahs.map((ayah) => (
                      <button
                        key={ayah.number}
                        onClick={() => playAyah(selectedSurah.number, ayah.numberInSurah)}
                        className={cn(
                          'inline-flex items-center justify-center w-9 h-9 rounded-lg border text-xs font-kufi transition-all duration-200',
                          currentAyah === ayah.numberInSurah
                            ? 'bg-accent text-primary-foreground border-accent'
                            : 'border-border/50 text-muted-foreground hover:border-accent/40 hover:text-accent'
                        )}
                      >
                        {ayah.numberInSurah}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search">
            <div className="max-w-2xl mx-auto">
              <div className="relative mb-6">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="ابحث في القرآن بالكلمة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pr-10 font-cairo text-lg py-6"
                />
              </div>
              <div className="flex gap-3 mb-6">
                <Button onClick={handleSearch} disabled={searchLoading || !searchQuery.trim()} className="font-cairo bg-primary hover:bg-primary/90">
                  {searchLoading ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <Search className="w-4 h-4 ml-1" />}
                  بحث
                </Button>
                <Select value={selectedTafsir} onValueChange={setSelectedTafsir}>
                  <SelectTrigger className="font-cairo flex-1">
                    <SelectValue placeholder="اختر التفسير" />
                  </SelectTrigger>
                  <SelectContent>
                    {tafsirOptions.map((t) => (
                      <SelectItem key={t.id} value={t.id} className="font-cairo">
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground font-cairo mb-4">
                    وجدنا {searchResults.length} نتيجة
                  </p>
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="bg-card rounded-2xl p-5 border border-border/50 hover:border-accent/30 transition-colors animate-fade-in-up"
                      style={{ animationDelay: `${Math.min(index * 0.03, 0.5)}s` }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/5 text-primary font-kufi text-xs font-bold">
                          {result.surah.number}
                        </span>
                        <span className="text-sm font-cairo text-primary font-medium">{result.surah.name}</span>
                        <span className="text-xs text-muted-foreground font-cairo">— الآية {result.ayah.numberInSurah}</span>
                        <button
                          onClick={() => loadSurah(result.surah.number)}
                          className="mr-auto text-xs font-cairo text-accent hover:underline"
                        >
                          عرض السورة
                        </button>
                      </div>
                      <p className="font-quran text-xl leading-loose text-foreground mb-3">
                        {result.ayah.text}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="font-cairo"
                          onClick={() => copyText(result.ayah.text)}
                        >
                          <Copy className="w-3.5 h-3.5 ml-1" /> نسخ
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="font-cairo"
                          onClick={() => playAyah(result.surah.number, result.ayah.numberInSurah)}
                        >
                          <Volume2 className="w-3.5 h-3.5 ml-1" /> استماع
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.length === 0 && !searchLoading && (
                <div className="bg-card rounded-2xl border border-border/50 p-8 text-center">
                  <p className="text-muted-foreground font-cairo">
                    اكتب كلمة للبحث في القرآن الكريم، سيتم عرض الآيات المطابقة
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
