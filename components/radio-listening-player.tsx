'use client';

import * as React from 'react';
import {
  Check,
  ChevronDown,
  Headphones,
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
import { LISTENING_AMBIENCES } from '@/lib/listening-ambiences';
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
  const [ambienceId, setAmbienceId] = React.useState<(typeof LISTENING_AMBIENCES)[number]['id']>('rain');
  const [ambienceMenuOpen, setAmbienceMenuOpen] = React.useState(false);
  const [playlistOpen, setPlaylistOpen] = React.useState(false);
  const [volumeOpen, setVolumeOpen] = React.useState(false);
  const [favorites, setFavorites] = React.useState<number[]>([]);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const backgroundVideoRef = React.useRef<HTMLVideoElement>(null);
  const currentIndex = stations.findIndex((item) => item.id === station.id);
  const ambience = LISTENING_AMBIENCES.find((item) => item.id === ambienceId) ?? LISTENING_AMBIENCES[0];
  const Icon = ambience.icon;
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
    if (!open || !ambience.video) return;
    const video = backgroundVideoRef.current;
    if (!video) return;

    video.muted = true;
    void video.play().catch((error: unknown) => {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      console.error(`Unable to play radio ambience video: ${ambience.id}`, error);
    });
    return () => video.pause();
  }, [ambience.id, ambience.video, open]);

  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (playlistOpen) setPlaylistOpen(false);
      else if (ambienceMenuOpen) setAmbienceMenuOpen(false);
      else if (volumeOpen) setVolumeOpen(false);
      else onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, playlistOpen, ambienceMenuOpen, volumeOpen, onClose]);

  if (!open) return null;

  const selectAdjacent = (offset: -1 | 1) => {
    const next = stations[currentIndex + offset];
    if (next) onSelectStation(next);
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="مشغل الإذاعة"
      tabIndex={-1}
      className="quran-listening"
      style={{ backgroundImage: ambience.video ? undefined : ambience.fallback }}
    >
      {ambience.video && (
        <video
          ref={backgroundVideoRef}
          className="quran-listening__video"
          src={ambience.video}
          muted
          loop
          autoPlay
          playsInline
          preload="auto"
          aria-hidden="true"
        />
      )}
      <div className="quran-listening__shade" aria-hidden="true" />

      <header className="quran-listening__top">
        <button
          type="button"
          className="quran-listening__icon-button"
          onClick={onClose}
          aria-label="إغلاق المشغل والعودة إلى الإذاعات"
        >
          <X aria-hidden="true" />
        </button>
        <div className="quran-listening__ambience-wrap">
          <button
            type="button"
            className="quran-listening__ambience"
            aria-expanded={ambienceMenuOpen}
            aria-haspopup="listbox"
            onClick={() => setAmbienceMenuOpen((value) => !value)}
          >
            <Icon aria-hidden="true" />
            <span>{ambience.label}</span>
            <ChevronDown className="quran-listening__chevron" aria-hidden="true" />
          </button>
          {ambienceMenuOpen && (
            <div className="quran-listening__ambience-menu" role="listbox" aria-label="اختر الخلفية">
              {LISTENING_AMBIENCES.map((option) => {
                const OptionIcon = option.icon;
                const selected = option.id === ambience.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className="quran-listening__menu-option"
                    onClick={() => {
                      setAmbienceId(option.id);
                      setAmbienceMenuOpen(false);
                    }}
                  >
                    <OptionIcon aria-hidden="true" />
                    <span>{option.label}</span>
                    {selected && <Check className="quran-listening__selected" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <span className="quran-listening__brand" aria-label="سُبُل">سُبُل</span>
      </header>

      <div className="quran-listening__main">
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
          >
            <Star aria-hidden="true" />
          </button>
          <div className="quran-listening__track-info" dir="rtl">
            <div className="quran-listening__reciter-avatar">
              <Radio aria-hidden="true" />
            </div>
            <div className="quran-listening__track-copy">
              <p className="quran-listening__surah">{station.name}</p>
              <p className="quran-listening__reciter">إذاعة القرآن الكريم</p>
              <p className="quran-listening__status" role="status" aria-live="polite">
                {isLoading ? 'جارٍ الاتصال بالبث…' : error || (isPlaying ? 'بث مباشر الآن' : 'البث متوقف مؤقتًا')}
              </p>
            </div>
          </div>
        </div>

        <div className="quran-listening__controls" dir="ltr">
          <span className="quran-listening__control quran-listening__live" aria-label="بث مباشر">LIVE</span>
          <button
            type="button"
            className="quran-listening__control"
            onClick={() => selectAdjacent(-1)}
            disabled={currentIndex <= 0}
            aria-label="المحطة السابقة"
          >
            <SkipBack aria-hidden="true" />
          </button>
          <button
            type="button"
            className="quran-listening__play"
            onClick={onTogglePlayback}
            disabled={isLoading && !isPlaying}
            aria-label={isPlaying ? 'إيقاف مؤقت' : 'استئناف البث'}
          >
            {isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          </button>
          <button
            type="button"
            className="quran-listening__control"
            onClick={() => selectAdjacent(1)}
            disabled={currentIndex < 0 || currentIndex >= stations.length - 1}
            aria-label="المحطة التالية"
          >
            <SkipForward aria-hidden="true" />
          </button>
          <span className="quran-listening__control" aria-hidden="true"><Headphones /></span>
        </div>

        <div className="quran-listening__progress quran-listening__live-status" role="status" aria-label="إذاعة مباشرة">
          <span className="quran-listening__live-dot" />
          <span>{isPlaying ? 'يُبث الآن مباشرة' : isLoading ? 'جارٍ الاتصال بالمحطة' : 'جاهز للاستماع'}</span>
          {error && <span className="quran-listening__retry-text">{error}</span>}
        </div>

        <footer className="quran-listening__utilities">
          <button
            type="button"
            className="quran-listening__utility"
            onClick={() => {
              setAmbienceMenuOpen(false);
              setVolumeOpen(false);
              setPlaylistOpen(true);
            }}
            aria-label="فتح قائمة الإذاعات"
          >
            <ListMusic aria-hidden="true" />
            <span>قائمة الإذاعات</span>
          </button>
          <div className="quran-listening__volume-wrap">
            <button
              type="button"
              className="quran-listening__utility"
              onClick={() => setVolumeOpen((value) => !value)}
              aria-expanded={volumeOpen}
              aria-label="خيارات مستوى الصوت"
            >
              {volume === 0 ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
              <span>الصوت</span>
            </button>
            {volumeOpen && (
              <label className="quran-listening__volume">
                <Headphones aria-hidden="true" />
                <span className="sr-only">مستوى الصوت</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={volume}
                  onChange={(event) => onVolumeChange(Number(event.target.value))}
                  aria-label="مستوى الصوت"
                />
              </label>
            )}
          </div>
        </footer>
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
