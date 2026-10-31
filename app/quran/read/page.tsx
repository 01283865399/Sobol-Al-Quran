'use client';

import * as React from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/page-layout';
import {
  BookOpen,
  Home,
  List,
  Search,
  Play,
  Pause,
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
  type QuranSearchMatch,
  type QuranSurah,
  type SurahMeta,
} from '@/lib/quran-api';
import { searchQuranInMemory } from '@/lib/quran-search';
import { useAudioNavigation, useQuranPlayback } from '@/components/audio-playback-provider';

const SEARCH_PAGE_SIZE = 50;
const FEATURED_SURAH_NUMBERS = [1, 18, 36, 55, 67, 112];

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}

function getSurahDisplayName(name: string): string {
  const [firstWord, ...remainingWords] = name.split(/\s+/u);
  const normalizedFirstWord = firstWord
    .normalize('NFD')
    .replace(/[\u064b-\u065f\u0670]/g, '');
  return normalizedFirstWord === 'سورة' ? remainingWords.join(' ') : name;
}

function stripOpeningBasmala(text: string): string {
  const characters = Array.from(text.trimStart());
  const prefix = 'بسم الله الرحمن الرحيم';
  let normalized = '';
  const sourceOffsets: number[] = [];

  characters.forEach((character, index) => {
    const folded = character
      .normalize('NFD')
      .replace(/[\u064b-\u065f\u0670\u06d6-\u06ed]/gu, '')
      .replace(/[ٱإأآ]/g, 'ا')
      .replace(/ـ/g, '');
    Array.from(folded).forEach((normalizedCharacter) => {
      normalized += normalizedCharacter;
      sourceOffsets.push(index + 1);
    });
  });

  if (!normalized.startsWith(prefix)) return text;

  let sourceEnd = sourceOffsets[prefix.length - 1];
  while (sourceEnd < characters.length && /[\u064b-\u065f\u0670\u06d6-\u06ed\s]/u.test(characters[sourceEnd])) {
    sourceEnd += 1;
  }
  return characters.slice(sourceEnd).join('');
}

export default function QuranPage() {
  const [search, setSearch] = React.useState('');
  const [surahList, setSurahList] = React.useState<SurahMeta[]>([]);
  const [listLoading, setListLoading] = React.useState(true);
  const [listError, setListError] = React.useState('');
  const [listAttempt, setListAttempt] = React.useState(0);

  const [selectedSurah, setSelectedSurah] = React.useState<QuranSurah | null>(null);
  const [readingPageIndex, setReadingPageIndex] = React.useState(0);
  const readingPageIndexRef = React.useRef(readingPageIndex);
  readingPageIndexRef.current = readingPageIndex;
  const [surahLoading, setSurahLoading] = React.useState(false);
  const [readerMode, setReaderMode] = React.useState(false);
  const [indexOpen, setIndexOpen] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('surahs');
  const [playerVisible, setPlayerVisible] = React.useState(false);
  const playerIdleTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerStartRef = React.useRef<{
    x: number;
    y: number;
    scrollLeft: number;
    pageIndex: number;
    moved: boolean;
  } | null>(null);
  const suppressAyahClickRef = React.useRef(false);
  const pageTrackRef = React.useRef<HTMLDivElement>(null);
  const [isDraggingPage, setIsDraggingPage] = React.useState(false);
  const wheelDeltaRef = React.useRef(0);
  const wheelTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [surahError, setSurahError] = React.useState('');
  const surahRequestRef = React.useRef<AbortController | null>(null);
  const requestedSurahRef = React.useRef<number | null>(null);

  const [fontSize, setFontSize] = React.useState(2);
  const [copyError, setCopyError] = React.useState('');

  const { quran: player } = useQuranPlayback();
  const { setMainPlayerOpen } = useAudioNavigation();
  const stopPlaybackRef = React.useRef(player.stop);
  stopPlaybackRef.current = player.stop;
  const reciter = QURAN_RECITERS.find((item) => item.id === player.selectedReciter) ?? QURAN_RECITERS[5];
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<QuranSearchMatch[]>([]);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [searchError, setSearchError] = React.useState('');
  const [hasSearched, setHasSearched] = React.useState(false);
  const [searchPage, setSearchPage] = React.useState(0);
  const searchRequestRef = React.useRef<AbortController | null>(null);
  const immersiveReading = readerMode;

  const revealPlayer = React.useCallback(() => {
    setPlayerVisible(true);
    if (playerIdleTimerRef.current) clearTimeout(playerIdleTimerRef.current);
    if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
    playerIdleTimerRef.current = setTimeout(() => setPlayerVisible(false), 4500);
  }, []);

  React.useEffect(() => {
    if (!immersiveReading) return;
    const historyState = typeof window.history.state === 'object' && window.history.state !== null
      ? window.history.state
      : {};
    window.history.pushState(
      { ...historyState, quranReaderImmersive: true },
      '',
      window.location.href
    );
    const handlePopState = () => {
      setReaderMode(false);
      setSelectedSurah(null);
      setPlayerVisible(false);
      stopPlaybackRef.current();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [immersiveReading]);

  const leaveReadingMode = React.useCallback(() => {
    if (window.history.state?.quranReaderImmersive) {
      window.history.back();
      return;
    }
    setReaderMode(false);
    setSelectedSurah(null);
    setPlayerVisible(false);
    stopPlaybackRef.current();
  }, []);

  React.useEffect(() => {
    setMainPlayerOpen(false);
  }, [setMainPlayerOpen]);

  React.useEffect(() => {
    if (!immersiveReading) return;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyPaddingBottom = document.body.style.paddingBottom;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.paddingBottom = '0';
    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.paddingBottom = previousBodyPaddingBottom;
    };
  }, [immersiveReading]);

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

  const loadSurah = React.useCallback(async (
    surahNumber: number,
    pagePosition: 'first' | 'last' = 'first'
  ) => {
    surahRequestRef.current?.abort();
    const controller = new AbortController();
    surahRequestRef.current = controller;
    requestedSurahRef.current = surahNumber;
    readingPageIndexRef.current = 0;
    setReadingPageIndex(0);
    setActiveTab('surahs');
    setIndexOpen(false);
    setReaderMode(true);
    setPlayerVisible(false);
    setSurahLoading(true);
    setSurahError('');
    setSelectedSurah(null);
    try {
      const surah = await fetchSurahText(surahNumber, controller.signal);
      if (!controller.signal.aborted) {
        const pageCount = new Set(surah.ayahs.map((ayah) => ayah.page)).size;
        const nextPageIndex = pagePosition === 'last' ? Math.max(0, pageCount - 1) : 0;
        readingPageIndexRef.current = nextPageIndex;
        setReadingPageIndex(nextPageIndex);
        setSelectedSurah(surah);
      }
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
      if (playerIdleTimerRef.current) clearTimeout(playerIdleTimerRef.current);
    };
  }, []);

  const handleSearch = React.useCallback(async () => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      setSearchError('');
      setSearchLoading(false);
      return;
    }

    searchRequestRef.current?.abort();
    const controller = new AbortController();
    searchRequestRef.current = controller;
    setSearchLoading(true);
    setSearchError('');
    setSearchResults([]);
    setHasSearched(false);
    setSearchPage(0);
    try {
      const result = await searchQuranInMemory(query, controller.signal);
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
  }, [searchQuery]);

  React.useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      searchRequestRef.current?.abort();
      setSearchResults([]);
      setSearchError('');
      setHasSearched(false);
      setSearchLoading(false);
      setSearchPage(0);
      return;
    }

    if (query.length < 2) {
      setSearchResults([]);
      setSearchError('');
      setHasSearched(false);
      setSearchLoading(false);
      return;
    }

    const timer = window.setTimeout(() => {
      void handleSearch();
    }, 350);
    return () => window.clearTimeout(timer);
  }, [handleSearch, searchQuery]);

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
  const featuredSurahs = FEATURED_SURAH_NUMBERS
    .map((number) => surahList.find((surah) => surah.number === number))
    .filter((surah): surah is SurahMeta => Boolean(surah));

  const readingPages = React.useMemo(() => {
    if (!selectedSurah) return [];
    const pages = new Map<number, QuranSurah['ayahs']>();
    selectedSurah.ayahs.forEach((ayah) => {
      const pageAyahs = pages.get(ayah.page) ?? [];
      pageAyahs.push(ayah);
      pages.set(ayah.page, pageAyahs);
    });
    return Array.from(pages, ([pageNumber, ayahs]) => ({ pageNumber, ayahs }));
  }, [selectedSurah]);
  const currentReadingPage = readingPages[readingPageIndex];
  const surahDisplayName = selectedSurah ? getSurahDisplayName(selectedSurah.name) : '';

  const navigateToPage = React.useCallback((nextIndex: number, behavior: ScrollBehavior = 'smooth') => {
    const boundedIndex = Math.max(0, Math.min(readingPages.length - 1, nextIndex));
    readingPageIndexRef.current = boundedIndex;
    setReadingPageIndex(boundedIndex);
    const track = pageTrackRef.current;
    if (track) {
      track.scrollTo({ left: boundedIndex * track.clientWidth, behavior });
    }
  }, [readingPages.length]);

  const navigateReader = React.useCallback((direction: -1 | 1) => {
    const nextIndex = readingPageIndexRef.current + direction;
    if (nextIndex >= 0 && nextIndex < readingPages.length) {
      navigateToPage(nextIndex);
      return;
    }

    if (!selectedSurah) return;
    const selectedSurahIndex = surahList.findIndex((surah) => surah.number === selectedSurah.number);
    const adjacentSurah = surahList[selectedSurahIndex + direction];
    if (!adjacentSurah) return;

    void loadSurah(adjacentSurah.number, direction < 0 ? 'last' : 'first');
  }, [loadSurah, navigateToPage, readingPages.length, selectedSurah, surahList]);

  const handlePageTrackScroll = () => {
    const track = pageTrackRef.current;
    if (!track || track.clientWidth === 0) return;
    const nextIndex = Math.round(track.scrollLeft / track.clientWidth);
    readingPageIndexRef.current = nextIndex;
    setReadingPageIndex((current) => current === nextIndex ? current : nextIndex);
  };

  React.useEffect(() => {
    if (!immersiveReading) return;
    const track = pageTrackRef.current;
    if (!track) return;
    const alignToCurrentPage = () => {
      track.scrollLeft = readingPageIndexRef.current * track.clientWidth;
    };
    alignToCurrentPage();
    const observer = new ResizeObserver(alignToCurrentPage);
    observer.observe(track);
    return () => observer.disconnect();
  }, [immersiveReading, readingPages.length]);

  React.useLayoutEffect(() => {
    if (!immersiveReading) return;
    const track = pageTrackRef.current;
    if (!track) return;

    let isActive = true;
    const fitPageText = () => {
      if (!isActive) return;
      track.querySelectorAll<HTMLElement>('.quran-mushaf-page__text').forEach((text) => {
        text.style.fontSize = '';
        let low = 11.5;
        let high = Number.parseFloat(window.getComputedStyle(text).fontSize);
        let bestFit = low;

        for (let attempt = 0; attempt < 12; attempt += 1) {
          const candidate = (low + high) / 2;
          text.style.fontSize = `${candidate}px`;
          if (text.scrollHeight <= text.clientHeight + 1) {
            bestFit = candidate;
            low = candidate;
          } else {
            high = candidate;
          }
        }

        text.style.fontSize = `${bestFit}px`;
      });
    };

    fitPageText();
    const observer = new ResizeObserver(fitPageText);
    observer.observe(track);
    void document.fonts.ready.then(fitPageText);
    return () => {
      isActive = false;
      observer.disconnect();
    };
  }, [immersiveReading, readingPages.length]);

  React.useEffect(() => {
    if (!immersiveReading) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest('input, select, textarea')) return;
      if (event.key === 'Escape') {
        if (window.history.state?.quranReaderImmersive) {
          window.history.back();
        } else {
          leaveReadingMode();
        }
      } else if (event.key === 'ArrowRight') {
        navigateReader(-1);
      } else if (event.key === 'ArrowLeft') {
        navigateReader(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [immersiveReading, leaveReadingMode, navigateReader]);

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
  const selectedSurahIndex = selectedSurah
    ? surahList.findIndex((surah) => surah.number === selectedSurah.number)
    : -1;
  const canNavigateToPreviousReading =
    readingPageIndex > 0 || selectedSurahIndex > 0;
  const canNavigateToNextReading =
    readingPageIndex < readingPages.length - 1 ||
    (selectedSurahIndex >= 0 && selectedSurahIndex < surahList.length - 1);
  const searchPageCount = Math.ceil(searchResults.length / SEARCH_PAGE_SIZE);
  const visibleSearchResults = searchResults.slice(
    searchPage * SEARCH_PAGE_SIZE,
    (searchPage + 1) * SEARCH_PAGE_SIZE
  );

  const playAdjacentSurah = (offset: -1 | 1) => {
    const surah = surahList[playerSurahIndex + offset];
    if (!surah) return;
    void loadSurah(surah.number);
    void player.playSurah(surah.number);
    revealPlayer();
  };

  const playAyah = (surahNumber: number, ayahNumber: number) => {
    if (suppressAyahClickRef.current) {
      suppressAyahClickRef.current = false;
      return;
    }
    revealPlayer();
    void player.playAyah(surahNumber, ayahNumber);
  };

  const handleReaderWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!immersiveReading || indexOpen) return;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    wheelDeltaRef.current += delta;
    if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
    wheelTimeoutRef.current = setTimeout(() => {
      wheelDeltaRef.current = 0;
    }, 160);
    if (Math.abs(wheelDeltaRef.current) < 45) return;
    const direction = wheelDeltaRef.current > 0 ? 1 : -1;
    wheelDeltaRef.current = 0;
    navigateReader(direction as -1 | 1);
  };

  const handleReaderPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button === 0) {
      pointerStartRef.current = {
        x: event.clientX,
        y: event.clientY,
        scrollLeft: event.currentTarget.scrollLeft,
        pageIndex: readingPageIndex,
        moved: false,
      };
    }
  };

  const handleReaderPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = pointerStartRef.current;
    if (!start || event.pointerType !== 'mouse') return;
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (!start.moved && (Math.abs(deltaX) < 8 || Math.abs(deltaX) < Math.abs(deltaY))) return;
    if (!start.moved) event.currentTarget.setPointerCapture(event.pointerId);
    start.moved = true;
    event.preventDefault();
    setIsDraggingPage(true);
    event.currentTarget.scrollLeft = start.scrollLeft - deltaX;
  };

  const handleReaderPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start || event.pointerType !== 'mouse') return;
    setIsDraggingPage(false);
    if (!start.moved || Math.abs(event.clientX - start.x) < 55) return;
    suppressAyahClickRef.current = true;
    window.setTimeout(() => { suppressAyahClickRef.current = false; }, 250);
    navigateReader(event.clientX < start.x ? 1 : -1);
  };

  const togglePlayback = () => {
    player.togglePlayback();
  };

  return (
    <PageLayout
      showHomeLink={!immersiveReading}
      hideNavbar={immersiveReading}
      mainClassName={cn('quran-reader-shell', immersiveReading && 'quran-reader-shell--immersive')}
    >
      <div className={cn(
        'quran-reader-content w-full px-4 py-7 lg:px-8 lg:py-9',
        immersiveReading && 'quran-reader-content--immersive'
      )}>
        {immersiveReading && (
          <div className="quran-reader-immersive-actions">
            <Link
              to="/"
              onClick={() => stopPlaybackRef.current()}
              className="quran-reader-immersive-action"
              aria-label="العودة للرئيسية"
              title="العودة للرئيسية"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="quran-reader-immersive-action"
              aria-label={indexOpen ? 'إغلاق فهرس السور' : 'فتح فهرس السور'}
              title="فهرس السور"
              onClick={() => setIndexOpen((open) => !open)}
            >
              <List className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        )}

        {indexOpen && !surahLoading && (
          <div className="quran-surah-index-layer">
            <button
              type="button"
              className="quran-surah-index-backdrop"
              aria-label="إغلاق فهرس السور"
              onClick={() => setIndexOpen(false)}
            />
            <aside className="quran-surah-index" aria-label="فهرس السور">
              <div className="quran-surah-index__header">
                <div>
                  <h2 className="font-kufi font-bold">فهرس السور</h2>
                  <p>{surahList.length} سورة</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="إغلاق فهرس السور"
                  onClick={() => setIndexOpen(false)}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
              <div className="quran-surah-index__search">
                <Search className="h-4 w-4" aria-hidden="true" />
                <Input
                  aria-label="ابحث في فهرس السور"
                  placeholder="ابحث عن سورة..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <div className="quran-surah-index__list" dir="rtl">
                {listLoading && (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-accent" />
                  </div>
                )}
                {listError && (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    <p className="mb-3">{listError}</p>
                    <Button type="button" variant="outline" size="sm" onClick={() => setListAttempt((attempt) => attempt + 1)}>
                      <RotateCcw className="ml-1 h-4 w-4" />
                      إعادة المحاولة
                    </Button>
                  </div>
                )}
                {!listLoading && !listError && filteredSurahs.map((surah) => (
                  <button
                    key={surah.number}
                    type="button"
                    className={cn(
                      'quran-surah-index__item',
                      selectedSurah?.number === surah.number && 'is-selected'
                    )}
                    onClick={() => void loadSurah(surah.number)}
                  >
                    <span className="quran-surah-index__number">{surah.number.toLocaleString('ar')}</span>
                    <span className="quran-surah-index__name">{getSurahDisplayName(surah.name)}</span>
                    <span className="quran-surah-index__ayah-count">{surah.numberOfAyahs.toLocaleString('ar')} آية</span>
                  </button>
                ))}
              </div>
            </aside>
          </div>
        )}

        {player.currentSurahNumber !== null && playerVisible && (
          <section
            aria-label="مشغل تلاوة المصحف"
            className="quran-reader-player"
            onPointerDown={revealPlayer}
            onPointerMove={revealPlayer}
            onFocus={revealPlayer}
          >
            <div className="quran-reader-player__header">
              <div className="min-w-0">
                <p className="truncate font-kufi font-bold">
                  {playerSurah?.name ?? `سورة ${player.currentSurahNumber}`}
                  <span className="mx-2 text-muted-foreground">·</span>
                  {reciter.name}
                </p>
                <p className="text-xs opacity-70" role="status" aria-live="polite">
                  {player.isLoading
                    ? 'جارٍ تحميل التلاوة...'
                    : player.isPlaying
                      ? `جارٍ تشغيل الآية ${player.currentTrackIndex + 1} من ${player.trackCount}`
                      : 'التلاوة متوقفة مؤقتًا'}
                </p>
              </div>
              <div className="quran-reader-player__actions">
                <Button
                  variant="ghost"
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
                  variant="ghost"
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

            <div className="quran-reader-player__controls">
              <div className="quran-reader-player__progress" dir="ltr">
                <span className="font-mono text-xs">
                  {formatTime(player.currentTime)}
                </span>
                <input
                  aria-label="التقدم في الآية الحالية"
                  className="h-2 min-w-16 flex-1 cursor-pointer accent-accent disabled:cursor-not-allowed"
                  type="range"
                  min={0}
                  max={player.duration || 1}
                  step={0.1}
                  value={Math.min(player.currentTime, player.duration || 0)}
                  disabled={!player.duration}
                  onChange={(event) => player.seek(Number(event.target.value))}
                />
                <span className="font-mono text-xs">
                  {formatTime(player.duration)}
                </span>
              </div>
              <Select value={player.selectedReciter} onValueChange={(value) => { void player.changeReciter(value); }}>
                <SelectTrigger className="quran-reader-player__reciter-trigger w-36 max-w-[42vw] border-white/15 font-cairo text-sm text-inherit sm:w-48" aria-label="اختر القارئ">
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
              <label className="quran-reader-player__volume">
                {player.volume === 0
                  ? <VolumeX className="h-4 w-4 shrink-0 opacity-70" aria-hidden="true" />
                  : <Volume2 className="h-4 w-4 shrink-0 opacity-70" aria-hidden="true" />}
                <input
                  aria-label="مستوى الصوت"
                  className="h-2 min-w-0 w-full cursor-pointer accent-accent"
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
              <div role="alert" className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-destructive/30 bg-background p-3">
                <p className="text-sm text-destructive">{player.audioError}</p>
                <Button variant="outline" size="sm" onClick={player.retry}>
                  <RotateCcw className="ml-1 h-4 w-4" />
                  إعادة المحاولة
                </Button>
              </div>
            )}

            {selectedSurah?.number === player.currentSurahNumber && (
              <div className="quran-reader-player__page-control" aria-label="التنقل بين صفحات المصحف">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="الصفحة السابقة"
                  disabled={!canNavigateToPreviousReading}
                  onClick={() => navigateReader(-1)}
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
                <input
                  aria-label="التنقل بين صفحات السورة"
                  type="range"
                  min={0}
                  max={Math.max(0, readingPages.length - 1)}
                  step={1}
                  value={readingPageIndex}
                  disabled={readingPages.length < 2}
                  onChange={(event) => navigateToPage(Number(event.target.value))}
                />
                <span aria-live="polite">
                  صفحة {currentReadingPage?.pageNumber.toLocaleString('ar') ?? '—'}
                  <span className="mx-1 opacity-50">·</span>
                  {readingPageIndex + 1} / {readingPages.length}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="الصفحة التالية"
                  disabled={!canNavigateToNextReading}
                  onClick={() => navigateReader(1)}
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            )}
          </section>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="quran-reader-tabs w-full">
          {!immersiveReading && (
            <div className="quran-reader-tabs__toolbar flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
            <TabsList className="bg-card border border-border/50">
              <TabsTrigger value="surahs" className="font-cairo" onClick={() => { if (selectedSurah) setSelectedSurah(null); }}>
                {selectedSurah ? `سورة ${surahDisplayName}` : 'قائمة السور'}
              </TabsTrigger>
              <TabsTrigger value="search" className="font-cairo">البحث</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={() => setIndexOpen(true)}>
                <List className="ml-2 h-4 w-4" aria-hidden="true" />
                فهرس السور
              </Button>
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
          )}

          {/* Surah List / Reading View */}
          <TabsContent value="surahs" className={cn('space-y-4', immersiveReading && 'quran-reader-tab-content--immersive')}>
            {!selectedSurah && !surahLoading && (
              <>
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

                {!listError && surahList.length > 0 && filteredSurahs.length > 0 && (
                  <div className="quran-reader-welcome">
                    <div className="quran-reader-welcome__intro">
                      <span className="quran-reader-welcome__icon" aria-hidden="true">
                        <BookOpen className="h-7 w-7" />
                      </span>
                      <div>
                        <p className="quran-reader-welcome__eyebrow">مصحفك بين يديك</p>
                        <h2>ابدأ قراءتك الآن</h2>
                        <p>اختر سورة من الفهرس أو ابدأ بواحدة من السور المقترحة. يمكنك الضغط على أي آية للاستماع إليها.</p>
                      </div>
                    </div>
                    <div className="quran-reader-welcome__actions">
                      <Button type="button" onClick={() => setIndexOpen(true)}>
                        <List className="ml-2 h-4 w-4" aria-hidden="true" />
                        فتح فهرس السور
                      </Button>
                      <span><strong>١١٤</strong> سورة · قراءة واستماع وبحث</span>
                    </div>
                    {featuredSurahs.length > 0 && (
                      <div className="quran-reader-welcome__featured" aria-label="سور مقترحة للبدء">
                        {featuredSurahs.map((surah) => (
                          <button
                            key={surah.number}
                            type="button"
                            className="quran-reader-welcome__surah"
                            onClick={() => void loadSurah(surah.number)}
                          >
                            <span>{surah.number.toLocaleString('ar')}</span>
                            <strong>{getSurahDisplayName(surah.name)}</strong>
                            <small>{surah.numberOfAyahs.toLocaleString('ar')} آية</small>
                          </button>
                        ))}
                      </div>
                    )}
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
                  <Button variant="ghost" onClick={() => { leaveReadingMode(); setSurahError(''); }} className="font-cairo">
                    العودة للقائمة
                  </Button>
                </div>
              </div>
            )}

            {selectedSurah && !surahLoading && (
              <div
                className={cn('quran-reader-reading-view w-full', immersiveReading && 'quran-reader-reading-view--immersive')}
              >
                <div
                  ref={pageTrackRef}
                  className={cn(
                    'quran-reader-page-track',
                    immersiveReading && 'quran-reader-page-track--immersive',
                    isDraggingPage && 'quran-reader-page-track--dragging'
                  )}
                  onScroll={handlePageTrackScroll}
                  onWheel={immersiveReading ? handleReaderWheel : undefined}
                  onPointerDown={immersiveReading ? handleReaderPointerDown : undefined}
                  onPointerMove={immersiveReading ? handleReaderPointerMove : undefined}
                  onPointerUp={immersiveReading ? handleReaderPointerUp : undefined}
                  onPointerCancel={() => {
                    pointerStartRef.current = null;
                    setIsDraggingPage(false);
                  }}
                >
                  {(immersiveReading ? readingPages : currentReadingPage ? [currentReadingPage] : []).map((page) => (
                    <article
                      key={page.pageNumber}
                      className="quran-mushaf-page"
                      aria-label={`صفحة المصحف ${page.pageNumber}`}
                      dir="rtl"
                    >
                      <header className="quran-mushaf-page__header">
                        <span>سورة {surahDisplayName}</span>
                        <span>{selectedSurah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</span>
                      </header>
                      {page.ayahs[0]?.numberInSurah === 1 &&
                        selectedSurah.number !== 1 &&
                        selectedSurah.number !== 9 && (
                          <p className="quran-mushaf-page__basmala" lang="ar">
                            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                          </p>
                        )}
                      <div
                        className="quran-mushaf-page__text font-quran"
                        dir="rtl"
                        lang="ar"
                        style={immersiveReading ? undefined : { fontSize: `${1.55 + fontSize * 0.2}rem` }}
                      >
                        {page.ayahs.map((ayah) => {
                          const isCurrentAyah =
                            player.currentSurahNumber === selectedSurah.number &&
                            player.currentTrackIndex + 1 === ayah.numberInSurah;
                          return (
                            <span
                              key={ayah.number}
                              role="button"
                              tabIndex={0}
                              aria-label={`استمع إلى الآية ${ayah.numberInSurah} من سورة ${surahDisplayName}`}
                              className={cn(
                                'quran-mushaf-page__ayah',
                                isCurrentAyah && 'is-playing'
                              )}
                              onClick={() => playAyah(selectedSurah.number, ayah.numberInSurah)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault();
                                  playAyah(selectedSurah.number, ayah.numberInSurah);
                                }
                              }}
                            >
                              {ayah.numberInSurah === 1 && selectedSurah.number !== 1 && selectedSurah.number !== 9
                                ? stripOpeningBasmala(ayah.text)
                                : ayah.text}
                              {'\u00a0'}
                              <span className="quran-mushaf-page__marker" aria-hidden="true">
                                {ayah.numberInSurah.toLocaleString('ar')}
                              </span>
                            </span>
                          );
                        })}
                      </div>
                      <footer className="quran-mushaf-page__footer">
                        <span aria-hidden="true" />
                        <span>{page.pageNumber.toLocaleString('ar')}</span>
                        <span aria-hidden="true" />
                      </footer>
                    </article>
                  ))}
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
                  placeholder="اكتب كلمة أو عبارة للبحث في القرآن..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchPage(0);
                  }}
                  className="pr-10 font-cairo text-lg py-6"
                />
                {searchLoading && (
                  <Loader2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-accent" aria-label="جاري البحث" />
                )}
              </div>

              {searchResults.length > 0 && (
                <div className="quran-search-results">
                  <div className="quran-search-results__summary">
                    <span>نتائج البحث عن <strong>«{searchQuery.trim()}»</strong></span>
                    {searchResults.length > SEARCH_PAGE_SIZE
                      ? <small>عرض {searchPage * SEARCH_PAGE_SIZE + 1}–{Math.min((searchPage + 1) * SEARCH_PAGE_SIZE, searchResults.length)} من {searchResults.length}</small>
                      : <small>{searchResults.length} نتيجة</small>}
                  </div>
                  {visibleSearchResults.map((result, index) => (
                    <div
                      key={result.number}
                      className="quran-search-result animate-fade-in-up"
                      style={{ animationDelay: `${Math.min(index * 0.03, 0.5)}s` }}
                    >
                      <div className="quran-search-result__header">
                        <span className="quran-search-result__number">
                          {result.surah.number}
                        </span>
                        <div>
                          <strong>{getSurahDisplayName(result.surah.name)}</strong>
                          <small>الآية {result.numberInSurah.toLocaleString('ar')} · {result.surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</small>
                        </div>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => void loadSurah(result.surah.number)}
                          className="quran-search-result__open mr-auto h-auto px-1 text-xs font-cairo"
                        >
                          عرض السورة
                        </Button>
                      </div>
                      <p className="quran-search-result__text font-quran">
                        {result.text}
                      </p>
                      <div className="quran-search-result__actions">
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
                      : searchQuery.trim().length === 1
                        ? 'اكتب حرفًا آخر لبدء البحث'
                        : 'اكتب كلمة أو عبارة، وستظهر الآيات المطابقة تلقائيًا'}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        {!immersiveReading && copyError && (
          <p role="alert" className="mt-4 text-center text-sm text-destructive">
            {copyError}
          </p>
        )}
        {!immersiveReading && (
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
        )}
      </div>
    </PageLayout>
  );
}
