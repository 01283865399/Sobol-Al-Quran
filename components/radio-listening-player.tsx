'use client';

import * as React from 'react';
import {
  ListMusic,
  Loader2,
  Pause,
  Play,
  Radio,
  SkipBack,
  SkipForward,
  Star,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { RadioStation } from '@/lib/radio-types';

interface RadioListeningPlayerProps {
  open: boolean;
  onClose: () => void;
  station: RadioStation;
  stations: RadioStation[];
  onSelectStation: (station: RadioStation) => void;
  onTogglePlayback: () => void;
  isLoading: boolean;
  isPlaying: boolean;
  error: string;
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export function RadioListeningPlayer({
  open,
  onClose,
  station,
  stations,
  onSelectStation,
  onTogglePlayback,
  isLoading,
  isPlaying,
  error,
  volume,
  onVolumeChange,
}: RadioListeningPlayerProps) {
  const [playlistOpen, setPlaylistOpen] = React.useState(false);
  const [favorites, setFavorites] = React.useState<number[]>([]);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const stationSelectOpenRef = React.useRef(false);
  const currentIndex = stations.findIndex((item) => item.id === station.id);
  const isFavorite = favorites.includes(station.id);

  React.useEffect(() => {
    try {
      const saved = window.localStorage.getItem('subul-radio-favorites');
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.every(Number.isInteger)) setFavorites(parsed);
      }
    } catch {
      setFavorites([]);
    }
  }, []);

  React.useEffect(() => {
    try {
      window.localStorage.setItem('subul-radio-favorites', JSON.stringify(favorites));
    } catch {
      // Favorites remain available for this session if browser storage is unavailable.
    }
  }, [favorites]);

  React.useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (
        stationSelectOpenRef.current
        || (event.target instanceof Element && event.target.closest('[role="combobox"], [role="listbox"]'))
      ) return;
      if (playlistOpen) setPlaylistOpen(false);
      else onClose();
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [open, playlistOpen, onClose]);

  if (!open) return null;

  const selectAdjacent = (offset: -1 | 1) => {
    const next = stations[currentIndex + offset];
    if (next) onSelectStation(next);
  };

  const selectStation = (stationId: string) => {
    const next = stations.find((item) => item.id === Number(stationId));
    if (next) onSelectStation(next);
  };

  const statusLabel = isLoading
    ? 'جارٍ الاتصال بالبث'
    : error
      ? 'تعذر الاتصال'
      : isPlaying
        ? 'بث مباشر الآن'
        : 'البث متوقف مؤقتًا';

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="مشغل الإذاعة"
      tabIndex={-1}
      className="quran-listening radio-listening"
      dir="rtl"
    >
      <header className="quran-listening__top">
        <button
          type="button"
          className="quran-listening__icon-button"
          onClick={onClose}
          aria-label="إغلاق المشغل والعودة إلى الإذاعات"
        >
          <X aria-hidden="true" />
        </button>
        <span className="quran-listening__brand" aria-label="سُبُل">سُبُل</span>
        <div className="radio-listening__actions">
          <button
            type="button"
            className="radio-listening__stations"
            onClick={() => setPlaylistOpen(true)}
          >
            <ListMusic aria-hidden="true" />
            <span>المحطات</span>
          </button>
        </div>
      </header>

      <picture className="radio-listening__backdrop">
        <source
          media="(max-width: 640px) and (orientation: portrait), (min-width: 641px) and (max-width: 1024px) and (orientation: portrait)"
          srcSet="/images/quran-radio-sunny-corner.png"
        />
        <img
          src="/images/quran-radio-corner.png"
          alt=""
          aria-hidden="true"
          draggable={false}
        />
      </picture>
      <div className="quran-listening__shade radio-listening__shade" aria-hidden="true" />

      <div className="quran-listening__main radio-listening__main" dir="rtl">
        <div className="quran-listening__track">
          <button
            type="button"
            className={`quran-listening__icon-button quran-listening__favorite${isFavorite ? ' is-active' : ''}`}
            onClick={() => setFavorites((previous) => (
              previous.includes(station.id)
                ? previous.filter((id) => id !== station.id)
                : [...previous, station.id]
            ))}
            aria-label={isFavorite ? 'إزالة المحطة من المفضلة' : 'إضافة المحطة إلى المفضلة'}
            aria-pressed={isFavorite}
            title={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
          >
            <Star aria-hidden="true" />
          </button>
          <div className="quran-listening__track-info" dir="rtl">
            <div className="quran-listening__reciter-avatar">
              <Radio aria-hidden="true" />
            </div>
            <div className="quran-listening__track-copy">
              <p className="quran-listening__surah" title={station.name}>{station.name}</p>
              <p className="quran-listening__reciter">إذاعة القرآن الكريم</p>
              <p className="quran-listening__status" role="status" aria-live="polite">
                {isLoading ? 'جارٍ الاتصال بالبث…' : statusLabel}
              </p>
            </div>
          </div>
        </div>

        <div className="quran-listening__controls radio-listening__controls" dir="ltr">
          <button
            type="button"
            className="quran-listening__control"
            onClick={() => selectAdjacent(-1)}
            disabled={currentIndex <= 0}
            aria-label="المحطة السابقة"
            title="المحطة السابقة"
          >
            <SkipBack aria-hidden="true" />
          </button>
          <button
            type="button"
            className="quran-listening__play"
            onClick={onTogglePlayback}
            disabled={isLoading && !isPlaying}
            aria-label={isPlaying ? 'إيقاف مؤقت' : 'استئناف البث'}
            title={isPlaying ? 'إيقاف مؤقت' : 'استئناف البث'}
          >
            {isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          </button>
          <button
            type="button"
            className="quran-listening__control"
            onClick={() => selectAdjacent(1)}
            disabled={currentIndex < 0 || currentIndex >= stations.length - 1}
            aria-label="المحطة التالية"
            title="المحطة التالية"
          >
            <SkipForward aria-hidden="true" />
          </button>
        </div>

        <div className="radio-listening__settings">
          <label className="radio-listening__station-control">
            <span>المحطة</span>
            <Select
              value={String(station.id)}
              onValueChange={selectStation}
              onOpenChange={(isOpen) => { stationSelectOpenRef.current = isOpen; }}
              dir="rtl"
            >
              <SelectTrigger
                className="radio-listening__station-trigger"
                aria-label="اختيار محطة إذاعية"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                className="radio-device__station-options"
                position="popper"
                align="center"
                side="bottom"
                sideOffset={6}
              >
                {stations.map((item) => (
                  <SelectItem
                    key={item.id}
                    value={String(item.id)}
                    className="radio-device__station-option"
                    dir="rtl"
                  >
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="radio-listening__volume-control">
            <span>الصوت</span>
            {volume === 0 ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={volume}
              onChange={(event) => onVolumeChange(Number(event.target.value))}
              dir="ltr"
              aria-label="مستوى صوت الإذاعة"
            />
            <span className="radio-listening__volume-value">{volume}%</span>
          </label>
        </div>

        {error && <p className="radio-listening__panel-error" role="alert">{error}</p>}
      </div>

      {playlistOpen && (
        <div className="quran-listening__drawer-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setPlaylistOpen(false);
        }}>
          <section className="quran-listening__drawer" role="dialog" aria-modal="true" aria-label="قائمة الإذاعات">
            <div className="quran-listening__drawer-heading">
              <div>
                <p>البث الحالي</p>
                <h2>قائمة الإذاعات</h2>
              </div>
              <button type="button" className="quran-listening__icon-button" onClick={() => setPlaylistOpen(false)} aria-label="إغلاق قائمة الإذاعات">
                <X aria-hidden="true" />
              </button>
            </div>
            <div className="quran-listening__playlist">
              {stations.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`quran-listening__playlist-item${item.id === station.id ? ' is-current' : ''}`}
                  onClick={() => {
                    onSelectStation(item);
                    setPlaylistOpen(false);
                  }}
                >
                  <span className="quran-listening__surah-number"><Radio aria-hidden="true" /></span>
                  <span className="quran-listening__playlist-name"><strong>{item.name}</strong></span>
                  {item.id === station.id && <Play aria-hidden="true" />}
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
