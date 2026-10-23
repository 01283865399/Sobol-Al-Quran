'use client';

import * as React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Check,
  ChevronDown,
  Headphones,
  ListMusic,
  Loader2,
  Pause,
  Play,
  Repeat2,
  SkipBack,
  SkipForward,
  Star,
  UserRound,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import type { useQuranAudio } from '@/hooks/use-quran-audio';
import { useGlassPlayerSize } from '@/hooks/use-glass-player-size';
import { useGeneratedAmbience } from '@/hooks/use-generated-ambience';
import type { QuranReciter, SurahMeta } from '@/lib/quran-api';
import { LISTENING_AMBIENCES } from '@/lib/listening-ambiences';

type QuranAudioPlayer = ReturnType<typeof useQuranAudio>;

interface QuranListeningPlayerProps {
  open: boolean;
  onClose: () => void;
  surahs: SurahMeta[];
  reciter: QuranReciter;
  player: QuranAudioPlayer;
  playSurah?: (surahNumber: number) => void;
  fullSurahMode?: boolean;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '--:--';
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}

export function QuranListeningPlayer({
  open,
  onClose,
  surahs,
  reciter,
  player,
  playSurah,
  fullSurahMode = false,
}: QuranListeningPlayerProps) {
  const { style: playerSizeStyle, handles: resizeHandles } = useGlassPlayerSize();
  const generatedAmbience = useGeneratedAmbience();
  const prefersReducedMotion = useReducedMotion();
  const [ambienceId, setAmbienceId] = React.useState<(typeof LISTENING_AMBIENCES)[number]['id']>('rain');
  const [ambienceMenuOpen, setAmbienceMenuOpen] = React.useState(false);
  const [playlistOpen, setPlaylistOpen] = React.useState(false);
  const [volumeOpen, setVolumeOpen] = React.useState(false);
  const [ambienceVolume, setAmbienceVolume] = React.useState(0.2);
  const [ambienceSoundEnabled, setAmbienceSoundEnabled] = React.useState(false);
  const [ambienceAudioBlocked, setAmbienceAudioBlocked] = React.useState(false);
  const [ambienceAudioError, setAmbienceAudioError] = React.useState(false);
  const [controlsVisible, setControlsVisible] = React.useState(true);
  const [favorites, setFavorites] = React.useState<number[]>([]);
  const [favoriteReady, setFavoriteReady] = React.useState(false);
  const [failedVideoId, setFailedVideoId] = React.useState<string | null>(null);
  const backgroundVideoRef = React.useRef<HTMLVideoElement>(null);
  const ambienceAudioRef = React.useRef<HTMLAudioElement>(null);
  const activeAmbienceIdRef = React.useRef(ambienceId);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const idleTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAmbienceVolumeRef = React.useRef(0.2);
  const keyboardNavigationRef = React.useRef(false);

  const currentSurah = surahs.find((surah) => surah.number === player.currentSurahNumber);
  const currentIndex = surahs.findIndex((surah) => surah.number === player.currentSurahNumber);
  const ambience = LISTENING_AMBIENCES.find((item) => item.id === ambienceId) ?? LISTENING_AMBIENCES[0];
  activeAmbienceIdRef.current = ambience.id;
  const Icon = ambience.icon;
  const isFavorite =
    player.currentSurahNumber !== null && favorites.includes(player.currentSurahNumber);
  const progress =
    player.duration > 0 ? Math.min(100, (player.currentTime / player.duration) * 100) : 0;
  const playerAudioRef = player.audioRef;
  const currentSurahNumber = player.currentSurahNumber;
  const repeatTrack = player.repeatTrack;
  const playRegularSurah = player.playSurah;

  const handleVideoPlaybackError = React.useCallback(
    (error: unknown, videoAmbienceId: string) => {
      if (videoAmbienceId !== activeAmbienceIdRef.current) return;
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        if (backgroundVideoRef.current) backgroundVideoRef.current.muted = true;
        setAmbienceSoundEnabled(false);
        setAmbienceAudioBlocked(true);
        return;
      }
      if (error instanceof DOMException && error.name === 'AbortError') return;
      console.error(`Unable to play Quran ambience video: ${videoAmbienceId}`, error);
      setFailedVideoId(videoAmbienceId);
    },
    []
  );

  const handleAmbienceAudioError = React.useCallback(
    (error: unknown, audioAmbienceId: string) => {
      if (audioAmbienceId !== activeAmbienceIdRef.current) return;
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        setAmbienceSoundEnabled(false);
        setAmbienceAudioBlocked(true);
        return;
      }
      if (error instanceof DOMException && error.name === 'AbortError') return;
      console.error(`Unable to play Quran ambience sound: ${audioAmbienceId}`, error);
      setAmbienceSoundEnabled(false);
      setAmbienceAudioError(true);
    },
    []
  );

  const playAmbienceAudio = React.useCallback(
    (audio: HTMLAudioElement) => {
      const video = backgroundVideoRef.current;
      if (video && audio.readyState > 0 && Number.isFinite(audio.duration)) {
        audio.currentTime = video.currentTime % audio.duration;
      } else if (video) {
        const syncPosition = () => {
          if (Number.isFinite(audio.duration) && audio.duration > 0) {
            audio.currentTime = video.currentTime % audio.duration;
          }
        };
        audio.addEventListener('loadedmetadata', syncPosition, { once: true });
      }
      audio.volume = lastAmbienceVolumeRef.current;
      setAmbienceSoundEnabled(true);
      setAmbienceAudioBlocked(false);
      setAmbienceAudioError(false);
      void audio.play().catch((error: unknown) => {
        handleAmbienceAudioError(error, ambience.id);
      });
    },
    [ambience.id, handleAmbienceAudioError]
  );

  const activateAmbience = () => {
    const video = backgroundVideoRef.current;
    if (video) {
      video.muted = true;
      void video.play().catch((error: unknown) => {
        handleVideoPlaybackError(error, ambience.id);
      });
    }
    const audio = ambienceAudioRef.current;
    if (ambience.audioSource && audio && ambienceVolume > 0 && !ambienceSoundEnabled) {
      playAmbienceAudio(audio);
    } else if (ambience.video && !ambience.audioSource && ambienceVolume > 0 && !ambienceSoundEnabled) {
      void generatedAmbience.play(ambience.id, ambienceVolume).then(() => {
        setAmbienceSoundEnabled(true);
        setAmbienceAudioBlocked(false);
      }).catch((error: unknown) => {
        handleAmbienceAudioError(error, ambience.id);
      });
    }
  };

  const revealControls = React.useCallback(() => {
    setControlsVisible(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (playlistOpen) return;

    idleTimerRef.current = setTimeout(() => {
      const activeElement = document.activeElement;
      if (
        keyboardNavigationRef.current &&
        activeElement &&
        activeElement !== dialogRef.current &&
        dialogRef.current?.contains(activeElement)
      ) {
        return;
      }
      setAmbienceMenuOpen(false);
      setVolumeOpen(false);
      setControlsVisible(false);
    }, 4000);
  }, [playlistOpen]);

  const handlePointerActivity = () => {
    keyboardNavigationRef.current = false;
    revealControls();
  };

  const handleKeyboardActivity = () => {
    keyboardNavigationRef.current = true;
    revealControls();
  };

  const changeAmbienceVolume = (volume: number) => {
    setAmbienceVolume(volume);
    if (volume > 0) lastAmbienceVolumeRef.current = volume;

    const audio = ambienceAudioRef.current;
    if (volume === 0) {
      audio?.pause();
      generatedAmbience.stop();
      setAmbienceSoundEnabled(false);
    } else if (ambience.audioSource) {
      if (!audio) return;
      audio.volume = volume;
      playAmbienceAudio(audio);
    } else if (ambience.video) {
      generatedAmbience.setVolume(volume);
      if (!ambienceSoundEnabled) {
        void generatedAmbience.play(ambience.id, volume).then(() => {
          setAmbienceSoundEnabled(true);
          setAmbienceAudioBlocked(false);
        }).catch((error: unknown) => {
          handleAmbienceAudioError(error, ambience.id);
        });
      }
    }
  };

  const toggleAmbienceMute = () => {
    const audio = ambienceAudioRef.current;
    if (!ambienceSoundEnabled || ambienceAudioBlocked || ambienceVolume === 0) {
      const volume = lastAmbienceVolumeRef.current || 0.2;
      lastAmbienceVolumeRef.current = volume;
      setAmbienceVolume(volume);
      if (ambience.audioSource && audio) {
        playAmbienceAudio(audio);
      } else if (ambience.video) {
        void generatedAmbience.play(ambience.id, volume).then(() => {
          setAmbienceSoundEnabled(true);
          setAmbienceAudioBlocked(false);
          setAmbienceAudioError(false);
        }).catch((error: unknown) => {
          handleAmbienceAudioError(error, ambience.id);
        });
      }
      return;
    }
    audio?.pause();
    generatedAmbience.stop();
    setAmbienceSoundEnabled(false);
    setAmbienceVolume(0);
  };

  React.useEffect(() => {
    try {
      const saved = window.localStorage.getItem('subul-quran-favorites');
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.every(Number.isInteger)) {
          setFavorites(parsed.filter((number) => number >= 1 && number <= 114));
        }
      }
    } catch {
      setFavorites([]);
    } finally {
      setFavoriteReady(true);
    }
  }, []);

  React.useEffect(() => {
    if (!favoriteReady) return;
    try {
      window.localStorage.setItem('subul-quran-favorites', JSON.stringify(favorites));
    } catch {
      // Favorites still work for this session when browser storage is unavailable.
    }
  }, [favorites, favoriteReady]);

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
    if (!open || !ambience.video || failedVideoId === ambience.id) return;
    const video = backgroundVideoRef.current;
    if (!video) return;
    let cancelled = false;
    video.muted = true;
    void video.play().catch((error: unknown) => {
      if (cancelled) return;
      handleVideoPlaybackError(error, ambience.id);
    });

    return () => {
      cancelled = true;
      video.pause();
    };
  }, [
    ambience.id,
    ambience.video,
    failedVideoId,
    handleVideoPlaybackError,
    open,
  ]);

  React.useEffect(() => {
    const audio = ambienceAudioRef.current;
    if (!open || !audio || !ambience.audioSource || !ambienceSoundEnabled) {
      audio?.pause();
      return;
    }

    if (!ambienceAudioBlocked) {
      playAmbienceAudio(audio);
    }
    return () => {
      audio.pause();
    };
  }, [
    ambience.id,
    ambience.audioSource,
    ambienceAudioBlocked,
    ambienceSoundEnabled,
    open,
    playAmbienceAudio,
  ]);

  React.useEffect(() => {
    if (
      !open ||
      !ambience.video ||
      ambience.audioSource ||
      !ambienceSoundEnabled ||
      ambienceVolume === 0
    ) {
      generatedAmbience.stop();
      return;
    }
    generatedAmbience.setVolume(ambienceVolume);
  }, [
    ambience.audioSource,
    ambience.id,
    ambience.video,
    ambienceSoundEnabled,
    ambienceVolume,
    generatedAmbience,
    open,
  ]);

  React.useEffect(() => {
    if (!open || !fullSurahMode) return;
    const audio = playerAudioRef.current;
    if (!audio) return;

    const playNextSurah = () => {
      if (repeatTrack) return;
      const endedSurahIndex = surahs.findIndex(
        (surah) => surah.number === currentSurahNumber
      );
      if (endedSurahIndex < 0) return;
      const nextSurah = surahs[endedSurahIndex + 1];
      if (!nextSurah) return;
      if (playSurah) playSurah(nextSurah.number);
      else void playRegularSurah(nextSurah.number);
    };

    audio.addEventListener('ended', playNextSurah);
    return () => audio.removeEventListener('ended', playNextSurah);
  }, [
    fullSurahMode,
    open,
    playerAudioRef,
    currentSurahNumber,
    repeatTrack,
    playRegularSurah,
    playSurah,
    surahs,
  ]);

  React.useEffect(() => {
    const audio = ambienceAudioRef.current;
    if (open && audio) audio.volume = ambienceVolume;
  }, [ambience.id, ambience.audioSource, ambienceVolume, open]);

  React.useEffect(() => {
    if (!open) return;
    setControlsVisible(true);
    revealControls();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [open, playlistOpen, revealControls]);

  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (playlistOpen) setPlaylistOpen(false);
        else if (ambienceMenuOpen) setAmbienceMenuOpen(false);
        else if (volumeOpen) setVolumeOpen(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, playlistOpen, ambienceMenuOpen, volumeOpen, onClose]);

  const playAdjacentSurah = (offset: -1 | 1) => {
    const nextSurah = surahs[currentIndex + offset];
    if (!nextSurah) return;
    if (playSurah) playSurah(nextSurah.number);
    else void player.playSurah(nextSurah.number);
  };

  const toggleFavorite = () => {
    const surahNumber = player.currentSurahNumber;
    if (surahNumber === null) return;
    setFavorites((previous) =>
      previous.includes(surahNumber)
        ? previous.filter((number) => number !== surahNumber)
        : [...previous, surahNumber]
    );
  };

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="مشغل الاستماع للقرآن"
      tabIndex={-1}
      className={`quran-listening${controlsVisible ? '' : ' is-idle'}`}
      style={{
        backgroundImage: ambience.image
          ? `url("${ambience.image}")`
          : ambience.fallback,
      }}
      onPointerMove={handlePointerActivity}
      onPointerDown={() => {
        handlePointerActivity();
        activateAmbience();
      }}
      onKeyDown={handleKeyboardActivity}
    >
      {open && ambience.video && (
        <video
          key={ambience.id}
          ref={backgroundVideoRef}
          className="quran-listening__video"
          src={ambience.video}
          poster={ambience.image ?? undefined}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          onError={() => {
            if (activeAmbienceIdRef.current !== ambience.id) return;
            console.error(`Unable to load Quran ambience video: ${ambience.id}`);
            setFailedVideoId(ambience.id);
          }}
        />
      )}
      {open && ambience.audioSource && (
        <audio
          ref={ambienceAudioRef}
          src={ambience.audioSource}
          loop
          preload="none"
          aria-hidden="true"
        />
      )}
      {ambience.video && failedVideoId === ambience.id && (
        <p className="quran-listening__background-status" role="status">
          تعذّر تحميل الفيديو. اختر الخلفية مجددًا للمحاولة.
        </p>
      )}
      <div className="quran-listening__shade" aria-hidden="true" />

      <header className="quran-listening__top">
        <button
          type="button"
          className="quran-listening__icon-button"
          onClick={onClose}
          aria-label="إغلاق المشغل والعودة للمصحف"
          title="العودة للمصحف"
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
                      setFailedVideoId(null);
                      if (option.audioSource && ambienceVolume > 0) {
                        generatedAmbience.stop();
                        setAmbienceSoundEnabled(true);
                        setAmbienceAudioBlocked(false);
                        setAmbienceAudioError(false);
                      } else if (option.video && ambienceVolume > 0) {
                        void generatedAmbience.play(option.id, ambienceVolume).then(() => {
                          setAmbienceSoundEnabled(true);
                          setAmbienceAudioBlocked(false);
                          setAmbienceAudioError(false);
                        }).catch((error: unknown) => {
                          handleAmbienceAudioError(error, option.id);
                        });
                      } else {
                        generatedAmbience.stop();
                        setAmbienceSoundEnabled(false);
                      }
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

      <div id="glass-listening-player" className="quran-listening__main" style={playerSizeStyle}>
        <div className="quran-listening__track">
          <button
            type="button"
            className={`quran-listening__icon-button quran-listening__favorite${isFavorite ? ' is-active' : ''}`}
            onClick={toggleFavorite}
            aria-label={isFavorite ? 'إزالة السورة من المفضلة' : 'إضافة السورة إلى المفضلة'}
            aria-pressed={isFavorite}
            title={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
          >
            <Star aria-hidden="true" />
          </button>
          <div className="quran-listening__track-info" dir="rtl">
            <div className="quran-listening__reciter-avatar">
              {reciter.portraitUrl ? (
                <img src={reciter.portraitUrl} alt={`صورة ${reciter.name}`} />
              ) : (
                <UserRound aria-hidden="true" />
              )}
            </div>
            <div className="quran-listening__track-copy">
              <p className="quran-listening__surah">
                {currentSurah?.englishName
                  ? `${currentSurah.englishName} · ${currentSurah.name}`
                  : currentSurah?.name ?? `سورة ${player.currentSurahNumber ?? ''}`}
              </p>
              <p className="quran-listening__reciter">{reciter.name}</p>
              <p className="quran-listening__status" role="status" aria-live="polite">
                {player.isLoading
                  ? 'جارٍ تحميل التلاوة…'
                  : player.audioError
                    ? player.audioError
                    : fullSurahMode
                    ? player.isPlaying
                      ? 'تلاوة السورة كاملة'
                      : 'السورة كاملة'
                    : player.isPlaying
                      ? `الآية ${player.currentTrackIndex + 1} من ${player.trackCount}`
                      : 'التلاوة متوقفة مؤقتًا'}
              </p>
            </div>
          </div>
        </div>

        <div className="quran-listening__controls" dir="ltr">
          <button
            type="button"
            className={`quran-listening__control${player.repeatTrack ? ' is-active' : ''}`}
            onClick={player.toggleRepeatTrack}
            aria-label={
              player.repeatTrack
                ? fullSurahMode
                  ? 'إيقاف تكرار السورة'
                  : 'إيقاف تكرار الآية'
                : fullSurahMode
                  ? 'تكرار السورة الحالية'
                  : 'تكرار الآية الحالية'
            }
            aria-pressed={player.repeatTrack}
            title="تكرار الآية الحالية"
          >
            <Repeat2 aria-hidden="true" />
          </button>
          <button
            type="button"
            className="quran-listening__control"
            onClick={() => playAdjacentSurah(-1)}
            disabled={currentIndex <= 0}
            aria-label="السورة السابقة"
            title="السورة السابقة"
          >
            <SkipBack aria-hidden="true" />
          </button>
          <button
            type="button"
            className="quran-listening__play"
            onClick={player.togglePlayback}
            disabled={player.isLoading && !player.isPlaying}
            aria-label={player.isPlaying ? 'إيقاف مؤقت' : 'استئناف التلاوة'}
            title={player.isPlaying ? 'إيقاف مؤقت' : 'استئناف التلاوة'}
          >
            {player.isLoading ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : player.isPlaying ? (
              <Pause aria-hidden="true" />
            ) : (
              <Play aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            className="quran-listening__control"
            onClick={() => playAdjacentSurah(1)}
            disabled={currentIndex < 0 || currentIndex >= surahs.length - 1}
            aria-label="السورة التالية"
            title="السورة التالية"
          >
            <SkipForward aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`quran-listening__control quran-listening__speed${player.playbackRate !== 1 ? ' is-active' : ''}`}
            onClick={() =>
              player.changePlaybackRate(
                player.playbackRate >= 2 ? 0.5 : player.playbackRate + 0.25
              )
            }
            aria-label={`سرعة التشغيل ${player.playbackRate} مرة`}
            title="تغيير سرعة التشغيل"
          >
            {player.playbackRate}×
          </button>
        </div>

        <div className="quran-listening__progress">
          <input
            type="range"
            dir="ltr"
            min={0}
            max={player.duration || 1}
            step={0.1}
            value={Math.min(player.currentTime, player.duration || 0)}
            disabled={!player.duration}
            onChange={(event) => player.seek(Number(event.target.value))}
            aria-label="التقدم في التلاوة"
            style={{ '--quran-progress': `${progress}%` } as React.CSSProperties}
          />
          <div className="quran-listening__time" dir="ltr">
            <span>{formatTime(player.currentTime)}</span>
            <span>{formatTime(player.duration)}</span>
          </div>
          {player.audioError && (
            <button
              type="button"
              className="quran-listening__retry"
              onClick={player.retry}
            >
              إعادة المحاولة
            </button>
          )}
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
            aria-label="فتح قائمة السور"
          >
            <ListMusic aria-hidden="true" />
            <span>قائمة السور</span>
          </button>
          <div className="quran-listening__volume-wrap">
            <button
              type="button"
              className="quran-listening__utility"
              onClick={() => setVolumeOpen((value) => !value)}
              aria-expanded={volumeOpen}
              aria-label="خيارات مستوى صوت القارئ والخلفية"
            >
              {player.volume === 0 && ambienceVolume === 0 ? (
                <VolumeX aria-hidden="true" />
              ) : (
                <Volume2 aria-hidden="true" />
              )}
              <span>الصوت</span>
            </button>
            {volumeOpen && (
              <div className="quran-listening__volume">
                <label className="quran-listening__volume-row">
                  <Headphones aria-hidden="true" />
                  <span>صوت القارئ</span>
                  <span>{Math.round(player.volume * 100)}%</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={player.volume}
                    onChange={(event) => player.changeVolume(Number(event.target.value))}
                    aria-label="مستوى صوت القارئ"
                  />
                </label>
                {ambience.video ? (
                  <div className="quran-listening__volume-row">
                    {ambienceVolume === 0 || ambienceAudioBlocked ? (
                      <VolumeX aria-hidden="true" />
                    ) : (
                      <Volume2 aria-hidden="true" />
                    )}
                    <span>
                      {ambience.audioSource ? 'صوت الخلفية' : 'صوت المحيط'}{' '}
                      <strong>{Math.round(ambienceVolume * 100)}%</strong>
                    </span>
                    <button
                      type="button"
                      className="quran-listening__ambience-mute"
                      onClick={toggleAmbienceMute}
                      aria-label={
                        ambienceVolume === 0 || ambienceAudioBlocked
                          ? 'تفعيل صوت الخلفية'
                          : 'كتم صوت الخلفية'
                      }
                    >
                      {ambienceVolume === 0 || ambienceAudioBlocked ? (
                        <Volume2 aria-hidden="true" />
                      ) : (
                        <VolumeX aria-hidden="true" />
                      )}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={ambienceVolume}
                      onChange={(event) => changeAmbienceVolume(Number(event.target.value))}
                      aria-label="مستوى صوت الخلفية"
                    />
                    {ambienceAudioError && (
                      <span className="quran-listening__volume-hint">
                        تعذّر تشغيل صوت الخلفية.
                      </span>
                    )}
                    {(ambienceAudioBlocked || !ambienceSoundEnabled) && (
                      <span className="quran-listening__volume-hint">
                        {ambienceAudioBlocked
                          ? 'المس زر الصوت للسماح بتشغيله'
                          : 'المس زر الصوت لتشغيل صوت الخلفية'}
                      </span>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </footer>
        {resizeHandles}
      </div>

      <AnimatePresence>
        {playlistOpen && (
          <motion.div
            key="quran-playlist-backdrop"
            className="quran-listening__drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setPlaylistOpen(false);
            }}
          >
            <motion.section
              className="quran-listening__drawer"
              role="dialog"
              aria-modal="true"
              aria-label="قائمة سور القرآن"
              initial={{ y: prefersReducedMotion ? 0 : 32, opacity: prefersReducedMotion ? 1 : 0.84 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: prefersReducedMotion ? 0 : 20, opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.24, ease: 'easeOut' }}
            >
              <div className="quran-listening__drawer-heading">
                <div>
                  <p>التلاوة الحالية</p>
                  <h2>قائمة السور</h2>
                </div>
                <button
                  type="button"
                  className="quran-listening__icon-button"
                  onClick={() => setPlaylistOpen(false)}
                  aria-label="إغلاق قائمة السور"
                >
                  <X aria-hidden="true" />
                </button>
              </div>
              <div className="quran-listening__playlist">
                {surahs.map((surah) => (
                  <button
                    key={surah.number}
                    type="button"
                    className={`quran-listening__playlist-item${surah.number === player.currentSurahNumber ? ' is-current' : ''}`}
                    onClick={() => {
                      if (playSurah) playSurah(surah.number);
                      else void player.playSurah(surah.number);
                      setPlaylistOpen(false);
                    }}
                  >
                    <span className="quran-listening__surah-number">{surah.number}</span>
                    <span className="quran-listening__playlist-name">
                      <strong>{surah.name}</strong>
                      <small>{surah.englishName}</small>
                    </span>
                    {surah.number === player.currentSurahNumber && <Play aria-hidden="true" />}
                  </button>
                ))}
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
