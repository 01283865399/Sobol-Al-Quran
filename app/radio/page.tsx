'use client';

import * as React from 'react';
import { PageLayout } from '@/components/page-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioListeningPlayer } from '@/components/radio-listening-player';
import { radioListResponseSchema, type RadioStation } from '@/lib/radio-types';
import { useAudioPlayback } from '@/components/audio-playback-provider';
import {
  Headphones,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pause,
  Play,
  Radio,
  RefreshCw,
  Search,
  Volume2,
} from 'lucide-react';

type StationFilter = 'all' | 'broadcasts' | 'recitations' | 'learning';
const STATIONS_PER_PAGE = 30;

const filters: { id: StationFilter; label: string }[] = [
  { id: 'all', label: 'كل المحطات' },
  { id: 'broadcasts', label: 'إذاعات مباشرة' },
  { id: 'recitations', label: 'التلاوات' },
  { id: 'learning', label: 'التفسير والترجمات' },
];

function matchesFilter(station: RadioStation, filter: StationFilter) {
  const isBroadcast = /إذاعة|راديو/.test(station.name);
  const isLearning = /تفسير|ترجمة|تعليم/.test(station.name);

  if (filter === 'broadcasts') return isBroadcast;
  if (filter === 'learning') return isLearning;
  if (filter === 'recitations') return !isBroadcast && !isLearning;
  return true;
}

function sortStations(stations: RadioStation[]) {
  return [...stations].sort((a, b) => {
    const aEgyptFeatured = a.id === 900001;
    const bEgyptFeatured = b.id === 900001;
    if (aEgyptFeatured !== bEgyptFeatured) return aEgyptFeatured ? -1 : 1;
    const aFeatured = a.name.includes('إذاعة القرآن الكريم - السعودية');
    const bFeatured = b.name.includes('إذاعة القرآن الكريم - السعودية');
    if (aFeatured !== bFeatured) return aFeatured ? -1 : 1;
    return a.name.localeCompare(b.name, 'ar');
  });
}

export default function RadioPage() {
  const {
    selectedStation,
    isRadioLoading: isLoading,
    isRadioPlaying: isPlaying,
    radioError: streamError,
    radioVolume: volume,
    playRadioStation: playStation,
    toggleRadioPlayback,
    setRadioVolume: setVolume,
    mainPlayerOpen,
    setMainPlayerOpen,
    setPlayerRoute,
  } = useAudioPlayback();
  const [stations, setStations] = React.useState<RadioStation[]>([]);
  const [stationsLoading, setStationsLoading] = React.useState(true);
  const [stationsError, setStationsError] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState<StationFilter>('all');
  const [stationPage, setStationPage] = React.useState(1);

  const loadStations = React.useCallback(async () => {
    setStationsLoading(true);
    setStationsError('');

    try {
      const response = await fetch('/api/radio', { cache: 'no-store' });
      const payload: unknown = await response.json();
      const result = radioListResponseSchema.safeParse(payload);

      if (!response.ok || !result.success) {
        throw new Error('Radio directory could not be loaded');
      }

      setStations(sortStations(result.data.stations));
    } catch {
      setStationsError('تعذر تحميل قائمة الإذاعات. تحقق من اتصالك ثم أعد المحاولة.');
    } finally {
      setStationsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadStations();
  }, [loadStations]);

  const openStation = (station: RadioStation) => {
    if (selectedStation?.id === station.id) toggleRadioPlayback();
    else playStation(station);
    setPlayerRoute('/radio');
    setMainPlayerOpen(true);
  };

  const visibleStations = React.useMemo(() => {
    const query = search.trim().toLocaleLowerCase('ar');
    return stations.filter((station) => (
      matchesFilter(station, filter) &&
      (!query || station.name.toLocaleLowerCase('ar').includes(query))
    ));
  }, [filter, search, stations]);
  const pageCount = Math.max(1, Math.ceil(visibleStations.length / STATIONS_PER_PAGE));
  const pageStations = visibleStations.slice(
    (stationPage - 1) * STATIONS_PER_PAGE,
    stationPage * STATIONS_PER_PAGE
  );

  return (
    <PageLayout>
      {selectedStation && (
        <RadioListeningPlayer
          open={mainPlayerOpen}
          onClose={() => setMainPlayerOpen(false)}
          station={selectedStation}
          stations={stations.filter((item) => item.playback === 'audio')}
          onSelectStation={playStation}
          onTogglePlayback={toggleRadioPlayback}
          isLoading={isLoading}
          isPlaying={isPlaying}
          error={streamError}
          volume={volume}
          onVolumeChange={setVolume}
        />
      )}
      <div className="container mx-auto px-4 py-4 lg:px-8 lg:py-6">
        {selectedStation && (
          <section
            aria-label="مشغل الإذاعة"
            className="sticky top-16 lg:top-[4.5rem] z-40 mb-8 rounded-2xl border border-accent/20 bg-card/95 p-4 shadow-card backdrop-blur"
          >
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
                  ) : (
                    <Radio className="h-6 w-6" aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">
                    {isLoading ? 'جارٍ الاتصال بالبث' : isPlaying ? 'يُبث الآن' : 'متوقفة مؤقتًا'}
                  </p>
                  <h2 className="truncate font-kufi font-bold text-primary">
                    {selectedStation.name}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="default"
                  size="icon"
                  className="h-11 w-11 rounded-full"
                  onClick={toggleRadioPlayback}
                  aria-label={isPlaying ? 'إيقاف مؤقت' : 'استئناف البث'}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Play className="h-5 w-5" aria-hidden="true" />
                  )}
                </Button>
                <label className="flex items-center gap-2" aria-label="مستوى الصوت">
                  <Volume2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(event) => setVolume(Number(event.target.value))}
                    className="w-20 accent-primary"
                    aria-label="مستوى الصوت"
                  />
                </label>
              </div>
            </div>
            <p className="mt-3 text-sm text-destructive" role="status" aria-live="polite">
              {streamError}
            </p>
          </section>
        )}

        <section className="mb-5 rounded-2xl border border-accent/10 bg-card p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary">
                <Radio className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h1 className="font-kufi text-lg font-bold text-foreground">إذاعة القرآن الكريم</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  ابحث عن محطة أو اختر تصنيفًا لبدء الاستماع.
                </p>
              </div>
            </div>
            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setStationPage(1);
                }}
                placeholder="ابحث عن محطة أو قارئ..."
                className="pr-9"
                aria-label="ابحث عن محطة أو قارئ"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="تصفية المحطات">
            {filters.map((item) => (
              <Button
                key={item.id}
                type="button"
                variant={filter === item.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setFilter(item.id);
                  setStationPage(1);
                }}
                aria-pressed={filter === item.id}
                className="rounded-full"
              >
                {item.label}
              </Button>
            ))}
            {!stationsLoading && !stationsError && (
              <span className="ms-auto self-center text-xs text-muted-foreground" aria-live="polite">
                {visibleStations.length} محطة
              </span>
            )}
          </div>
        </section>

        {stationsLoading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-muted-foreground" role="status">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            <span>جارٍ تحميل المحطات...</span>
          </div>
        ) : stationsError ? (
          <div className="rounded-2xl border border-destructive/20 bg-card p-8 text-center">
            <p className="mb-4 text-muted-foreground" role="alert">{stationsError}</p>
            <Button type="button" onClick={() => void loadStations()}>
              <RefreshCw className="ml-2 h-4 w-4" aria-hidden="true" />
              إعادة المحاولة
            </Button>
          </div>
        ) : visibleStations.length === 0 ? (
          <div className="rounded-2xl border border-border/50 bg-card p-10 text-center">
            <p className="text-muted-foreground">لا توجد محطات مطابقة لبحثك.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-card">
            <ul className="divide-y divide-border/50">
              {pageStations.map((station) => {
                const active = selectedStation?.id === station.id;
                const playing = active && isPlaying;
                return (
                  <li
                    key={station.id}
                    className={`flex min-h-[68px] items-center gap-3 px-3 py-2.5 transition-colors sm:px-4 ${
                      active ? 'bg-primary/5' : 'hover:bg-accent/5'
                    }`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      active ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                    }`}>
                      {playing ? (
                        <Radio className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <Headphones className="h-5 w-5" aria-hidden="true" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-kufi text-sm font-bold leading-6 text-foreground">
                        {station.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {station.name.includes('إذاعة') ? 'إذاعة مباشرة' : 'تلاوة قرآنية'}
                        {active && isLoading ? ' · جارٍ الاتصال' : playing ? ' · تُبث الآن' : ''}
                      </span>
                    </span>
                    <Button
                      type="button"
                      variant={active ? 'default' : 'outline'}
                      size="icon"
                      className="h-9 w-9 shrink-0 rounded-full"
                      onClick={() => openStation(station)}
                      aria-pressed={playing}
                      aria-label={`${playing ? 'إيقاف مؤقت' : active ? 'استئناف البث' : 'استمع الآن'}: ${station.name}`}
                    >
                      {playing ? (
                        <Pause className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Play className="h-4 w-4" aria-hidden="true" />
                      )}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {!stationsLoading && !stationsError && visibleStations.length > STATIONS_PER_PAGE && (
          <nav className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-border/50 bg-card px-3 py-2" aria-label="صفحات المحطات">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              disabled={stationPage <= 1}
              onClick={() => setStationPage((page) => Math.max(1, page - 1))}
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              السابق
            </Button>
            <span className="text-xs text-muted-foreground" aria-live="polite">
              صفحة {stationPage} من {pageCount}
              <span className="mx-2">·</span>
              {visibleStations.length} محطة
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              disabled={stationPage >= pageCount}
              onClick={() => setStationPage((page) => Math.min(pageCount, page + 1))}
            >
              التالي
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
          </nav>
        )}

        <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground">
          البث الصوتي مقدم من مصادر خارجية عبر{' '}
          <a
            href="https://mp3quran.net/"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            MP3Quran
          </a>
          . قد يختلف التوفر حسب المحطة والمنطقة.
        </p>
      </div>
    </PageLayout>
  );
}
