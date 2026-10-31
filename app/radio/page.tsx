'use client';

import * as React from 'react';
import { PageLayout } from '@/components/page-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioListeningPlayer } from '@/components/radio-listening-player';
import { useAudioNavigation, useRadioPlayback } from '@/components/audio-playback-provider';
import { radioListResponseSchema, type RadioStation } from '@/lib/radio-types';
import {
  ChevronLeft,
  ChevronRight,
  Headphones,
  Loader2,
  Pause,
  Play,
  Radio,
  RefreshCw,
  Search,
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
    if ((a.id === 900001) !== (b.id === 900001)) return a.id === 900001 ? -1 : 1;
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
    playRadioStation: playStation,
    toggleRadioPlayback,
    radioVolume: volume,
    setRadioVolume: setVolume,
  } = useRadioPlayback();
  const { mainPlayerOpen, setMainPlayerOpen, setPlayerRoute } = useAudioNavigation();
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

  const playableStations = React.useMemo(
    () => stations.filter((station) => station.playback === 'audio'),
    [stations]
  );

  const openStation = (station: RadioStation) => {
    if (selectedStation?.id !== station.id) {
      playStation(station);
    } else if (!isPlaying && !isLoading) {
      toggleRadioPlayback();
    }
    setPlayerRoute('/radio');
    setMainPlayerOpen(true);
  };

  const visibleStations = React.useMemo(() => {
    const query = search.trim().toLocaleLowerCase('ar');
    return playableStations.filter((station) => (
      matchesFilter(station, filter) &&
      (!query || station.name.toLocaleLowerCase('ar').includes(query))
    ));
  }, [filter, playableStations, search]);

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
          stations={playableStations}
          onSelectStation={playStation}
          onTogglePlayback={toggleRadioPlayback}
          isLoading={isLoading}
          isPlaying={isPlaying}
          error={streamError}
          volume={volume}
          onVolumeChange={setVolume}
        />
      )}
      <div className="radio-page-content w-full px-4 py-4 lg:px-8 lg:py-6">
        <section className="radio-directory-header mb-5">
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
            <label className="relative w-full lg:max-w-sm">
              <Search
                className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
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
            </label>
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
        ) : pageStations.length === 0 ? (
          <div className="rounded-2xl border border-border/50 bg-card p-10 text-center">
            <p className="text-muted-foreground">لا توجد محطات مطابقة لبحثك.</p>
          </div>
        ) : (
          <ul className="radio-station-list" aria-label="محطات إذاعة القرآن الكريم">
            {pageStations.map((station) => {
              const active = selectedStation?.id === station.id;
              const playing = active && isPlaying;
              const isBroadcast = /إذاعة|راديو/.test(station.name);

              return (
                <li key={station.id}>
                  <button
                    type="button"
                    className={`radio-station${active ? ' is-active' : ''}`}
                    onClick={() => openStation(station)}
                    aria-pressed={playing}
                    aria-label={`${playing ? 'فتح مشغل' : 'استمع الآن'}: ${station.name}`}
                  >
                    <span className="radio-station__top">
                      <span className="radio-station__icon">
                        {playing ? <Radio aria-hidden="true" /> : <Headphones aria-hidden="true" />}
                      </span>
                      <span className="radio-station__badge">
                        {isBroadcast ? 'إذاعة مباشرة' : 'تلاوة قرآنية'}
                      </span>
                    </span>
                    <span className="radio-station__content">
                      <span className="radio-station__name">{station.name}</span>
                      <span className="radio-station__description">
                        {isBroadcast
                          ? 'بث قرآني مباشر متواصل.'
                          : 'تلاوات وبرامج قرآنية للاستماع.'}
                      </span>
                    </span>
                    <span className="radio-station__footer">
                      <span className={`radio-station__status${playing ? ' is-playing' : ''}`}>
                        <span aria-hidden="true" />
                        {active && isLoading ? 'جارٍ الاتصال' : playing ? 'تُبث الآن' : 'جاهز للاستماع'}
                      </span>
                      <span className="radio-station__play" aria-hidden="true">
                        {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {!stationsLoading && !stationsError && visibleStations.length > STATIONS_PER_PAGE && (
          <nav
            className="mt-4 flex items-center justify-between gap-3 border-t border-border/50 px-1 py-3"
            aria-label="صفحات المحطات"
          >
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
