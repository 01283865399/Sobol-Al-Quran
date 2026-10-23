'use client';

import * as React from 'react';
import { PageLayout, PageHeader } from '@/components/page-layout';
import {
  BookOpen,
  Search,
  Play,
  Pause,
  Bookmark,
  Copy,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Volume2,
  VolumeX,
  X,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  fetchSurahList,
  fetchSurahText,
  QURAN_RECITERS,
  searchQuran,
  type QuranSearchMatch,
  type QuranSurah,
  type SurahMeta,
} from '@/lib/quran-api';
import { QuranListeningPlayer } from '@/components/quran-listening-player';
import {
  useAudioNavigation,
  useQuranPlayback,
} from '@/components/audio-playback-provider';

const SEARCH_PAGE_SIZE = 50;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}

export default function QuranPage() {
  const [search, setSearch] = React.useState('');
  const [surahList, setSurahList] = React.useState<SurahMeta[]>([]);
  const [listLoading, setListLoading] = React.useState(true);
  const [listError, setListError] = React.useState('');
  const [listAttempt, setListAttempt] = React.useState(0);

  const [selectedSurah, setSelectedSurah] = React.useState<QuranSurah | null>(null);
  const [surahLoading, setSurahLoading] = React.useState(false);
  const [surahError, setSurahError] = React.useState('');
  const surahRequestRef = React.useRef<AbortController | null>(null);
  const requestedSurahRef = React.useRef<number | null>(null);

  const [bookmarked, setBookmarked] = React.useState<number[]>([]);
  const [fontSize, setFontSize] = React.useState(2);
  const [copyError, setCopyError] = React.useState('');

  const { quran: player } = useQuranPlayback();
  const {
    mainPlayerOpen,
    setMainPlayerOpen,
    setPlayerRoute,
  } = useAudioNavigation();
  const reciter = QURAN_RECITERS.find((item) => item.id === player.selectedReciter) ?? QURAN_RECITERS[5];
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<QuranSearchMatch[]>([]);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [searchError, setSearchError] = React.useState('');
  const [hasSearched, setHasSearched] = React.useState(false);
  const [searchPage, setSearchPage] = React.useState(0);
  const searchRequestRef = React.useRef<AbortController | null>(null);
  const closeListeningPlayer = React.useCallback(() => setMainPlayerOpen(false), [setMainPlayerOpen]);

  React.useEffect(() => {
    const controller = new AbortController();
    setListLoading(true);
    setListError('');
    fetchSurahList(controller.signal)
      .then(setSurahList)
      .catch(() => {
        if (!controller.signal.aborted) setListError('تعذر تحميل قائمة السور، تحقق من اتصالك ثم أعد المحاولة');
      })
      .finally(() => {
        if (!controller.signal.aborted) setListLoading(false);
      });
    return () => controller.abort();
  }, [listAttempt]);

  const loadSurah = React.useCallback(async (surahNumber: number) => {
    surahRequestRef.current?.abort();
    const controller = new AbortController();
    surahRequestRef.current = controller;
    requestedSurahRef.current = surahNumber;
    setSurahLoading(true);
    setSurahError('');
    setSelectedSurah(null);
    try {
      const surah = await fetchSurahText(surahNumber, controller.signal);
      if (!controller.signal.aborted) setSelectedSurah(surah);
    } catch {
      if (!controller.signal.aborted) setSurahError('تعذر تحميل السورة، تحقق من اتصالك ثم حاول مجددًا');
    } finally {
      if (!controller.signal.aborted) setSurahLoading(false);
    }
  }, []);

  React.useEffect(() => {
    return () => {
      surahRequestRef.current?.abort();
      searchRequestRef.current?.abort();
    };
  }, []);

  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) return;

    searchRequestRef.current?.abort();
    const controller = new AbortController();
    searchRequestRef.current = controller;
    setSearchLoading(true);
    setSearchError('');
    setSearchResults([]);
    setHasSearched(false);
    setSearchPage(0);
    try {
      const result = await searchQuran(query, controller.signal);
      if (!controller.signal.aborted) {
        setSearchResults(result.matches);
        setHasSearched(true);
      }
    } catch {
      if (!controller.signal.aborted) {
        setSearchError('تعذر الاتصال بخدمة البحث، تحقق من اتصالك ثم حاول مجددًا');
      }
    } finally {
      if (!controller.signal.aborted) setSearchLoading(false);
    }
  };

  const retryLoadSurah = () => {
    if (requestedSurahRef.current !== null) void loadSurah(requestedSurahRef.current);
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
    if (!navigator.clipboard) {
      setCopyError('ميزة النسخ غير متاحة في هذا المتصفح');
      return;
    }

    navigator.clipboard.writeText(text)
      .then(() => setCopyError(''))
      .catch(() => setCopyError('تعذر نسخ النص، تحقق من صلاحيات المتصفح'));
  };

  const playerSurah = surahList.find((surah) => surah.number === player.currentSurahNumber);
  const playerSurahIndex = surahList.findIndex(
    (surah) => surah.number === player.currentSurahNumber
  );
  const searchPageCount = Math.ceil(searchResults.length / SEARCH_PAGE_SIZE);
  const visibleSearchResults = searchResults.slice(
    searchPage * SEARCH_PAGE_SIZE,
    (searchPage + 1) * SEARCH_PAGE_SIZE
  );

  const playAdjacentSurah = (offset: -1 | 1) => {
    const surah = surahList[playerSurahIndex + offset];
    if (!surah) return;
    void loadSurah(surah.number);
    setPlayerRoute('/quran/read');
    setMainPlayerOpen(true);
    void player.playSurah(surah.number);
  };

  const playSurah = (surahNumber: number) => {
    setPlayerRoute('/quran/read');
    setMainPlayerOpen(true);
    void player.playSurah(surahNumber);
  };

  const playAyah = (surahNumber: number, ayahNumber: number) => {
    setPlayerRoute('/quran/read');
    setMainPlayerOpen(true);
    void player.playAyah(surahNumber, ayahNumber);
  };

  const togglePlayback = () => {
    setPlayerRoute('/quran/read');
    setMainPlayerOpen(true);
    player.togglePlayback();
  };

  return (
    <PageLayout>
      <QuranListeningPlayer
        open={mainPlayerOpen}
        onClose={closeListeningPlayer}
        surahs={surahList}
        reciter={reciter}
        player={player}
      />
      <PageHeader
        title="القرآن الكريم"
        subtitle="المصحف الكامل بـ114 سورة بترقيم عثماني، مع التلاوة والبحث"
        icon={<BookOpen className="w-8 h-8 text-accent" />}
      />

      <div className="w-full px-4 py-12 lg:px-8 lg:py-16">
        {player.currentSurahNumber !== null && (
          <section
            aria-label="مشغل تلاوة القرآن"
            className="sticky top-16 lg:top-[4.5rem] z-40 mb-6 rounded-2xl border border-accent/20 bg-card/95 p-4 shadow-card backdrop-blur"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-kufi font-bold text-primary">
                  {playerSurah?.name ?? `سورة ${player.currentSurahNumber}`}
                  <span className="mx-2 text-muted-foreground">·</span>
                  {reciter.name}
                </p>
                <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
                  {player.isLoading
                    ? 'جارٍ تحميل التلاوة...'
                    : player.isPlaying
                      ? `جارٍ تشغيل الآية ${player.currentTrackIndex + 1} من ${player.trackCount}`
                      : 'التلاوة متوقفة مؤقتًا'}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMainPlayerOpen(true)}
                  className="font-cairo"
                >
                  فتح المشغل
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="السورة السابقة"
                  title="السورة السابقة"
                  disabled={playerSurahIndex <= 0}
                  onClick={() => playAdjacentSurah(-1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="default"
                  size="icon"
                  aria-label={player.isPlaying ? 'إيقاف مؤقت' : 'استئناف التلاوة'}
                  title={player.isPlaying ? 'إيقاف مؤقت' : 'استئناف التلاوة'}
                  disabled={player.isLoading && !player.isPlaying}
                  onClick={togglePlayback}
                >
                  {player.isLoading
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : player.isPlaying
                      ? <Pause className="h-4 w-4" />
                      : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="السورة التالية"
                  title="السورة التالية"
                  disabled={playerSurahIndex < 0 || playerSurahIndex >= surahList.length - 1}
                  onClick={() => playAdjacentSurah(1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="إغلاق المشغل"
                  title="إغلاق المشغل"
                  onClick={player.stop}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4">
              <div className="flex min-w-0 flex-1 items-center gap-3" dir="ltr">
                <span className="w-10 text-left font-mono text-xs text-muted-foreground">
                  {formatTime(player.currentTime)}
                </span>
                <input
                  aria-label="التقدم في الآية الحالية"
                  className="h-2 min-w-20 flex-1 cursor-pointer accent-primary disabled:cursor-not-allowed"
                  type="range"
                  min={0}
                  max={player.duration || 1}
                  step={0.1}
                  value={Math.min(player.currentTime, player.duration || 0)}
                  disabled={!player.duration}
                  onChange={(event) => player.seek(Number(event.target.value))}
                />
                <span className="w-10 text-right font-mono text-xs text-muted-foreground">
                  {formatTime(player.duration)}
                </span>
              </div>
              <label className="flex w-full items-center gap-2 sm:w-36">
                {player.volume === 0
                  ? <VolumeX className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  : <Volume2 className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
                <input
                  aria-label="مستوى الصوت"
                  className="h-2 w-full cursor-pointer accent-primary"
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={player.volume}
                  onChange={(event) => player.changeVolume(Number(event.target.value))}
                />
              </label>
            </div>

            {player.audioError && (
              <div role="alert" className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-destructive/30 p-3">
                <p className="text-sm text-destructive">{player.audioError}</p>
                <Button variant="outline" size="sm" onClick={player.retry}>
                  <RotateCcw className="ml-1 h-4 w-4" />
                  إعادة المحاولة
                </Button>
              </div>
            )}
          </section>
        )}

        <Tabs defaultValue="surahs" className="w-full">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
            <TabsList className="bg-card border border-border/50">
              <TabsTrigger value="surahs" className="font-cairo" onClick={() => { if (selectedSurah) setSelectedSurah(null); }}>
                {selectedSurah ? `سورة ${selectedSurah.name}` : 'قائمة السور'}
              </TabsTrigger>
              <TabsTrigger value="search" className="font-cairo">البحث</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Select value={player.selectedReciter} onValueChange={(value) => { void player.changeReciter(value); }}>
                <SelectTrigger className="w-48 font-cairo text-sm" aria-label="اختر القارئ">
                  <SelectValue placeholder="اختر القارئ" />
                </SelectTrigger>
                <SelectContent>
                  {QURAN_RECITERS.filter((item) => item.ayahAudioEdition !== null).map((item) => (
                    <SelectItem key={item.id} value={item.id} className="font-cairo">
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" aria-label="تصغير الخط" onClick={() => setFontSize((p) => Math.max(0, p - 1))} className="rounded-lg h-9 w-9">
                  <span className="text-xs font-bold">أ-</span>
                </Button>
                <Button variant="outline" size="icon" aria-label="تكبير الخط" onClick={() => setFontSize((p) => Math.min(4, p + 1))} className="rounded-lg h-9 w-9">
                  <span className="text-sm font-bold">أ+</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Surah List / Reading View */}
          <TabsContent value="surahs" className="space-y-4">
            {!selectedSurah && !surahLoading && (
              <>
                <div className="relative mb-8">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    aria-label="ابحث عن سورة بالاسم أو الرقم"
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
                    <p className="mb-4 text-muted-foreground font-cairo">{listError}</p>
                      <Button variant="outline" onClick={() => setListAttempt((attempt) => attempt + 1)}>
                      <RotateCcw className="ml-1 h-4 w-4" />
                      إعادة المحاولة
                    </Button>
                  </div>
                )}

                {!listLoading && !listError && filteredSurahs.length === 0 && (
                  <div className="rounded-2xl border border-border/50 bg-card p-8 text-center">
                    <p className="text-muted-foreground font-cairo">لا توجد سورة مطابقة للبحث</p>
                  </div>
                )}

                {!listError && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredSurahs.map((surah, index) => (
                      <div
                        key={surah.number}
                        className="group rounded-2xl border border-border/50 bg-card p-5 transition-all duration-300 hover:border-accent/40 hover:shadow-teal animate-fade-in-up"
                        style={{ animationDelay: `${Math.min(index * 0.02, 0.5)}s` }}
                      >
                        <div className="mb-3 flex items-start justify-between">
                          <div className="relative flex h-12 w-12 items-center justify-center">
                            <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full text-accent/30" fill="none" aria-hidden="true">
                              <path d="M24 2 L30 10 L44 12 L34 22 L36 36 L24 30 L12 36 L14 22 L4 12 L18 10 Z" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                            <span className="relative font-kufi text-sm font-bold text-accent">{surah.number}</span>
                          </div>
                          <button
                            type="button"
                            aria-label={`${bookmarked.includes(surah.number) ? 'إزالة حفظ' : 'حفظ'} سورة ${surah.name}`}
                            aria-pressed={bookmarked.includes(surah.number)}
                            onClick={() => toggleBookmark(surah.number)}
                            className="text-muted-foreground transition-colors hover:text-accent"
                          >
                            <Bookmark className={cn('h-5 w-5', bookmarked.includes(surah.number) && 'fill-accent text-accent')} />
                          </button>
                        </div>
                        <button
                          type="button"
                          className="w-full text-right"
                          aria-label={`افتح سورة ${surah.name}`}
                          onClick={() => void loadSurah(surah.number)}
                        >
                          <h3 className="mb-1 font-kufi text-xl font-bold text-primary transition-colors group-hover:text-accent">
                            {surah.name}
                          </h3>
                          <p className="mb-2 text-xs text-muted-foreground font-cairo">
                            {surah.englishName} — {surah.englishNameTranslation}
                          </p>
                          <span className="flex items-center gap-3 text-xs text-muted-foreground font-cairo">
                            <span className="rounded-full bg-primary/5 px-2 py-0.5 text-primary">
                              {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                            </span>
                            <span>{surah.numberOfAyahs} آية</span>
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                <p className="mb-4 text-muted-foreground font-cairo">{surahError}</p>
                <div className="flex justify-center gap-2">
                  <Button variant="outline" onClick={retryLoadSurah} className="font-cairo">
                    <RotateCcw className="ml-1 h-4 w-4" />
                    إعادة المحاولة
                  </Button>
                  <Button variant="ghost" onClick={() => setSelectedSurah(null)} className="font-cairo">
                    العودة للقائمة
                  </Button>
                </div>
              </div>
            )}

            {selectedSurah && !surahLoading && (
              <div className="w-full">
                {/* Surah header */}
                <div className="flex items-center justify-between mb-6">
                  <Button variant="ghost" onClick={() => setSelectedSurah(null)} className="font-cairo">
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
                  <Button
                    className="bg-primary font-cairo hover:bg-primary/90"
                    disabled={player.isLoading && player.currentSurahNumber === selectedSurah.number}
                    onClick={() => playSurah(selectedSurah.number)}
                  >
                    {player.isLoading && player.currentSurahNumber === selectedSurah.number
                      ? <Loader2 className="ml-1 h-4 w-4 animate-spin" />
                      : <Play className="ml-1 h-4 w-4" />}
                    استماع للسورة كاملة — {reciter.name}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-cairo"
                    onClick={() => copyText(selectedSurah.ayahs.map((a) => a.text).join(' '))}
                  >
                    <Copy className="w-4 h-4 ml-1" /> نسخ السورة
                  </Button>
                </div>
                <div className="py-4 lg:py-6">
                  {/* Ayahs */}
                  <div
                    className="font-quran text-right leading-loose text-foreground"
                    style={{ fontSize: `${1.5 + fontSize * 0.25}rem`, lineHeight: 2.2 }}
                  >
                    {selectedSurah.ayahs.map((ayah) => {
                      const isCurrentAyah =
                        player.currentSurahNumber === selectedSurah.number &&
                        player.currentTrackIndex + 1 === ayah.numberInSurah;
                      return (
                        <button
                          key={ayah.number}
                          type="button"
                          aria-label={`استمع إلى الآية ${ayah.numberInSurah} من سورة ${selectedSurah.name}`}
                          className={cn(
                            'rounded px-1 text-right transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            isCurrentAyah ? 'bg-accent/20 text-accent' : 'hover:bg-accent/10'
                          )}
                          onClick={() => playAyah(selectedSurah.number, ayah.numberInSurah)}
                        >
                          {ayah.text}
                          <span className="mx-1 inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-accent/40 align-middle font-kufi text-sm text-accent">
                            {ayah.numberInSurah}
                          </span>{' '}
                        </button>
                      );
                    })}
                  </div>

                </div>

                {/* Per-ayah audio quick bar */}
                <div className="mt-4 bg-card rounded-2xl border border-border/50 p-4">
                  <p className="text-sm text-muted-foreground font-cairo mb-3 text-center">
                    اضغط على رقم الآية لتشغيل تلاوتها بصوت {reciter.name}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {selectedSurah.ayahs.map((ayah) => (
                      <button
                        type="button"
                        aria-label={`استمع إلى الآية ${ayah.numberInSurah} من سورة ${selectedSurah.name}`}
                        key={ayah.number}
                        onClick={() => playAyah(selectedSurah.number, ayah.numberInSurah)}
                        className={cn(
                          'inline-flex items-center justify-center w-9 h-9 rounded-lg border text-xs font-kufi transition-all duration-200',
                          player.currentSurahNumber === selectedSurah.number &&
                            player.currentTrackIndex + 1 === ayah.numberInSurah
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
            <div className="w-full">
              <div className="relative mb-6">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  aria-label="ابحث في آيات القرآن"
                  placeholder="ابحث في القرآن بالكلمة..."
                  value={searchQuery}
                  onChange={(e) => {
                    searchRequestRef.current?.abort();
                    setSearchQuery(e.target.value);
                    setSearchResults([]);
                    setSearchError('');
                    setHasSearched(false);
                    setSearchPage(0);
                    setSearchLoading(false);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pr-10 font-cairo text-lg py-6"
                />
              </div>
              <div className="flex gap-3 mb-6">
                <Button onClick={handleSearch} disabled={searchLoading || !searchQuery.trim()} className="font-cairo bg-primary hover:bg-primary/90">
                  {searchLoading ? <Loader2 className="w-4 h-4 ml-1 animate-spin" /> : <Search className="w-4 h-4 ml-1" />}
                  بحث
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground font-cairo mb-4">
                    {searchResults.length > SEARCH_PAGE_SIZE
                      ? `عرض ${searchPage * SEARCH_PAGE_SIZE + 1}–${Math.min((searchPage + 1) * SEARCH_PAGE_SIZE, searchResults.length)} من ${searchResults.length} نتيجة`
                      : `وجدنا ${searchResults.length} نتيجة`}
                  </p>
                  {visibleSearchResults.map((result, index) => (
                    <div
                      key={result.number}
                      className="bg-card rounded-2xl p-5 border border-border/50 hover:border-accent/30 transition-colors animate-fade-in-up"
                      style={{ animationDelay: `${Math.min(index * 0.03, 0.5)}s` }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/5 text-primary font-kufi text-xs font-bold">
                          {result.surah.number}
                        </span>
                        <span className="text-sm font-cairo text-primary font-medium">{result.surah.name}</span>
                        <span className="text-xs text-muted-foreground font-cairo">— الآية {result.numberInSurah}</span>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => void loadSurah(result.surah.number)}
                          className="mr-auto h-auto px-1 text-xs font-cairo text-accent"
                        >
                          عرض السورة
                        </Button>
                      </div>
                      <p className="font-quran text-xl leading-loose text-foreground mb-3">
                        {result.text}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="font-cairo"
                          onClick={() => copyText(result.text)}
                        >
                          <Copy className="w-3.5 h-3.5 ml-1" /> نسخ
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="font-cairo"
                          onClick={() => playAyah(result.surah.number, result.numberInSurah)}
                        >
                          <Volume2 className="w-3.5 h-3.5 ml-1" /> استماع
                        </Button>
                      </div>
                    </div>
                  ))}
                  {searchPageCount > 1 && (
                    <div className="flex items-center justify-center gap-3 pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={searchPage === 0}
                        onClick={() => setSearchPage((page) => Math.max(0, page - 1))}
                      >
                        السابق
                      </Button>
                      <span className="text-sm text-muted-foreground" aria-live="polite">
                        صفحة {searchPage + 1} من {searchPageCount}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={searchPage >= searchPageCount - 1}
                        onClick={() => setSearchPage((page) => Math.min(searchPageCount - 1, page + 1))}
                      >
                        التالي
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {searchError && !searchLoading && (
                <div role="alert" className="bg-card rounded-2xl border border-destructive/30 p-8 text-center">
                  <p className="text-destructive font-cairo">{searchError}</p>
                  <Button variant="outline" className="mt-4" onClick={() => void handleSearch()}>
                    <RotateCcw className="ml-1 h-4 w-4" />
                    إعادة المحاولة
                  </Button>
                </div>
              )}

              {searchResults.length === 0 && !searchLoading && !searchError && (
                <div className="bg-card rounded-2xl border border-border/50 p-8 text-center">
                  <p className="text-muted-foreground font-cairo">
                    {hasSearched
                      ? 'لا توجد نتائج مطابقة في القرآن الكريم'
                      : 'اكتب كلمة للبحث في القرآن الكريم، سيتم عرض الآيات المطابقة'}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        {copyError && (
          <p role="alert" className="mt-4 text-center text-sm text-destructive">
            {copyError}
          </p>
        )}
        <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground">
          تُحمّل بيانات السور والتلاوات مباشرة من{' '}
          <a
            href="https://alquran.cloud/api"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-2"
          >
            AlQuran.cloud
          </a>
          . الصوت مستضاف لدى المصدر ولا يُعاد رفعه على هذا الموقع؛ يرجى الرجوع إلى المصدر للتحقق من شروط إعادة الاستخدام.
        </p>
      </div>
    </PageLayout>
  );
}
