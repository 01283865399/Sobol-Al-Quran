'use client';

import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Maximize2,
  Pause,
  Play,
  Radio,
  Square,
  Volume2,
} from 'lucide-react';
import { useQuranAudio } from '@/hooks/use-quran-audio';
import { QURAN_RECITERS } from '@/lib/quran-api';
import type { RadioStation } from '@/lib/radio-types';

type QuranAudioPlayer = ReturnType<typeof useQuranAudio>;

interface AudioNavigationContextValue {
  playerRoute: string;
  mainPlayerOpen: boolean;
  setMainPlayerOpen: (open: boolean) => void;
  setPlayerRoute: (route: string) => void;
  openMainPlayer: () => void;
}

interface QuranPlaybackContextValue {
  quran: QuranAudioPlayer;
}

interface RadioPlaybackContextValue {
  radioAudioRef: React.RefObject<HTMLAudioElement>;
  selectedStation: RadioStation | null;
  isRadioLoading: boolean;
  isRadioPlaying: boolean;
  radioError: string;
  radioVolume: number;
  playRadioStation: (station: RadioStation) => void;
  toggleRadioPlayback: () => void;
  stopRadioPlayback: () => void;
  setRadioVolume: (volume: number) => void;
}

const AudioNavigationContext = React.createContext<AudioNavigationContextValue | null>(null);
const QuranPlaybackContext = React.createContext<QuranPlaybackContextValue | null>(null);
const RadioPlaybackContext = React.createContext<RadioPlaybackContextValue | null>(null);

export function AudioPlaybackProvider({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const quranPlayer = useQuranAudio();
  const radioAudioRef = React.useRef<HTMLAudioElement>(null);
  const radioAttemptRef = React.useRef(0);
  const previousPathRef = React.useRef(pathname);
  const pendingOpenRouteRef = React.useRef<string | null>(null);
  const stopQuranPlayback = quranPlayer.stop;
  const [playerRoute, setPlayerRoute] = React.useState(pathname);
  const [mainPlayerOpen, setMainPlayerOpen] = React.useState(false);
  const [selectedStation, setSelectedStation] = React.useState<RadioStation | null>(null);
  const [isRadioLoading, setIsRadioLoading] = React.useState(false);
  const [isRadioPlaying, setIsRadioPlaying] = React.useState(false);
  const [radioError, setRadioError] = React.useState('');
  const [radioVolume, setRadioVolumeState] = React.useState(75);

  const stopRadioPlayback = React.useCallback(() => {
    radioAttemptRef.current += 1;
    const audio = radioAudioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    setSelectedStation(null);
    setIsRadioLoading(false);
    setIsRadioPlaying(false);
    setRadioError('');
  }, []);

  const playRadioStation = React.useCallback((station: RadioStation) => {
    const audio = radioAudioRef.current;
    if (!audio) return;

    stopQuranPlayback();
    const attempt = ++radioAttemptRef.current;
    setSelectedStation(station);
    setRadioError('');
    setIsRadioLoading(true);
    setIsRadioPlaying(false);
    audio.pause();
    audio.src = station.url;
    audio.load();
    void audio.play().catch(() => {
      if (attempt !== radioAttemptRef.current) return;
      setIsRadioLoading(false);
      setIsRadioPlaying(false);
      setRadioError('تعذر تشغيل هذه المحطة الآن. تحقق من اتصالك أو اختر محطة أخرى.');
    });
  }, [stopQuranPlayback]);

  const toggleRadioPlayback = React.useCallback(() => {
    const audio = radioAudioRef.current;
    if (!audio || !selectedStation) return;

    if (!audio.paused) {
      audio.pause();
      return;
    }

    const attempt = ++radioAttemptRef.current;
    setRadioError('');
    setIsRadioLoading(true);
    void audio.play().catch(() => {
      if (attempt !== radioAttemptRef.current) return;
      setIsRadioLoading(false);
      setRadioError('تعذر استئناف البث. اختر محطة أخرى أو أعد المحاولة.');
    });
  }, [selectedStation]);

  const setRadioVolume = React.useCallback((volume: number) => {
    const nextVolume = Math.max(0, Math.min(100, volume));
    if (radioAudioRef.current) radioAudioRef.current.volume = nextVolume / 100;
    setRadioVolumeState(nextVolume);
  }, []);

  const openMainPlayer = React.useCallback(() => {
    if (!playerRoute) return;
    if (pathname === playerRoute) {
      setMainPlayerOpen(true);
      return;
    }
    pendingOpenRouteRef.current = playerRoute;
    navigate(playerRoute);
  }, [navigate, pathname, playerRoute]);

  React.useEffect(() => {
    if (previousPathRef.current === pathname) return;
    previousPathRef.current = pathname;
    if (pendingOpenRouteRef.current === pathname) {
      pendingOpenRouteRef.current = null;
      setMainPlayerOpen(true);
      return;
    }
    pendingOpenRouteRef.current = null;
    setMainPlayerOpen(false);
  }, [pathname]);

  const quran = React.useMemo<QuranAudioPlayer>(() => ({
    ...quranPlayer,
    playSurah: (...args) => {
      stopRadioPlayback();
      return quranPlayer.playSurah(...args);
    },
    playFullSurah: (...args) => {
      stopRadioPlayback();
      return quranPlayer.playFullSurah(...args);
    },
    playAyah: (...args) => {
      stopRadioPlayback();
      return quranPlayer.playAyah(...args);
    },
    togglePlayback: () => {
      if (quranPlayer.audioRef.current?.paused) stopRadioPlayback();
      quranPlayer.togglePlayback();
    },
  }), [quranPlayer, stopRadioPlayback]);

  React.useEffect(() => {
    const audio = radioAudioRef.current;
    if (!audio) return;
    audio.volume = radioVolume / 100;

    const onPlaying = () => {
      setIsRadioLoading(false);
      setIsRadioPlaying(true);
      setRadioError('');
    };
    const onWaiting = () => setIsRadioLoading(true);
    const onPause = () => {
      setIsRadioLoading(false);
      setIsRadioPlaying(false);
    };
    const onError = () => {
      setIsRadioLoading(false);
      setIsRadioPlaying(false);
      setRadioError('تعذر تشغيل هذه المحطة الآن. اختر محطة أخرى أو أعد المحاولة.');
    };

    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onError);
    return () => {
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError);
    };
  }, [radioVolume]);

  React.useEffect(() => () => {
    radioAttemptRef.current += 1;
    radioAudioRef.current?.pause();
  }, []);

  const navigationValue = React.useMemo(() => ({
    playerRoute,
    mainPlayerOpen,
    setMainPlayerOpen,
    setPlayerRoute,
    openMainPlayer,
  }), [playerRoute, mainPlayerOpen, openMainPlayer]);
  const quranValue = React.useMemo(() => ({ quran }), [quran]);
  const radioValue = React.useMemo(() => ({
    radioAudioRef,
    selectedStation,
    isRadioLoading,
    isRadioPlaying,
    radioError,
    radioVolume,
    playRadioStation,
    toggleRadioPlayback,
    stopRadioPlayback,
    setRadioVolume,
  }), [
    selectedStation,
    isRadioLoading,
    isRadioPlaying,
    radioError,
    radioVolume,
    playRadioStation,
    toggleRadioPlayback,
    stopRadioPlayback,
    setRadioVolume,
  ]);

  const reciter = QURAN_RECITERS.find((item) => item.id === quran.selectedReciter);
  const hasQuranPlayback = quran.currentSurahNumber !== null;
  const hasActivePlayback = selectedStation !== null || hasQuranPlayback;
  const isRadioSelected = selectedStation !== null;
  const isPlaying = isRadioSelected ? isRadioPlaying : quran.isPlaying;
  const isLoading = isRadioSelected ? isRadioLoading : quran.isLoading;
  const progress = !isRadioSelected && quran.duration > 0
    ? Math.min(100, (quran.currentTime / quran.duration) * 100)
    : 0;

  return (
    <AudioNavigationContext.Provider value={navigationValue}>
      <QuranPlaybackContext.Provider value={quranValue}>
        <RadioPlaybackContext.Provider value={radioValue}>
          <audio ref={quranPlayer.audioRef} preload="none" aria-hidden="true" />
          <audio ref={radioAudioRef} preload="none" aria-label="مشغل البث الإذاعي" />
          {children}
          {hasActivePlayback && !mainPlayerOpen && (
            <aside
              className="global-audio-player"
              aria-label="مشغل صوت مستمر"
            >
          {!isRadioSelected && (
            <div
              className="global-audio-player__progress"
              style={{ '--player-progress': `${progress}%` } as React.CSSProperties}
            />
          )}
          <button
            type="button"
            className="global-audio-player__art"
            onClick={openMainPlayer}
            aria-label="العودة إلى المشغل الكامل"
            title="فتح المشغل الكامل"
          >
            {isRadioSelected
              ? <Radio className="h-5 w-5" aria-hidden="true" />
              : <Volume2 className="h-5 w-5" aria-hidden="true" />}
          </button>
          <button type="button" className="global-audio-player__track" onClick={openMainPlayer}>
            <span className="global-audio-player__title">
              {selectedStation?.name ?? `سورة ${quran.currentSurahNumber}`}
            </span>
            <span className="global-audio-player__subtitle">
              {isRadioSelected ? 'إذاعة القرآن الكريم' : reciter?.name ?? 'تلاوة القرآن الكريم'}
              {isLoading ? ' · جارٍ التحميل' : ''}
            </span>
            {!isRadioSelected && quran.duration > 0 && (
              <span className="global-audio-player__time" dir="ltr">
                {formatAudioTime(quran.currentTime)} / {formatAudioTime(quran.duration)}
              </span>
            )}
          </button>
          <label className="global-audio-player__volume">
            <Volume2 className="h-4 w-4" aria-hidden="true" />
            <input
              type="range"
              min="0"
              max={isRadioSelected ? 100 : 1}
              step={isRadioSelected ? 1 : 0.01}
              value={isRadioSelected ? radioVolume : quran.volume}
              onChange={(event) => {
                const nextVolume = Number(event.target.value);
                if (isRadioSelected) setRadioVolume(nextVolume);
                else quran.changeVolume(nextVolume);
              }}
              aria-label={isRadioSelected ? 'مستوى صوت الإذاعة' : 'مستوى صوت التلاوة'}
            />
          </label>
          <div className="global-audio-player__actions">
            <button
              type="button"
              className="global-audio-player__button global-audio-player__button--play"
              onClick={isRadioSelected ? toggleRadioPlayback : quran.togglePlayback}
              aria-label={
                isRadioSelected
                  ? isRadioPlaying ? 'إيقاف الإذاعة مؤقتًا' : 'استئناف الإذاعة'
                  : quran.isPlaying ? 'إيقاف التلاوة مؤقتًا' : 'استئناف التلاوة'
              }
            >
              {isPlaying
                ? <Pause className="h-5 w-5" aria-hidden="true" />
                : <Play className="h-5 w-5" aria-hidden="true" />}
            </button>
            <button
              type="button"
              className="global-audio-player__button global-audio-player__button--open"
              onClick={openMainPlayer}
              aria-label="العودة إلى المشغل الكامل"
              title="فتح المشغل الكامل"
            >
              <Maximize2 className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="global-audio-player__button global-audio-player__button--stop"
              onClick={isRadioSelected ? stopRadioPlayback : quran.stop}
              aria-label="إيقاف الصوت"
              title="إيقاف الصوت"
            >
              <Square className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
            </aside>
          )}
        </RadioPlaybackContext.Provider>
      </QuranPlaybackContext.Provider>
    </AudioNavigationContext.Provider>
  );
}

function formatAudioTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
}

export function useAudioNavigation() {
  const context = React.useContext(AudioNavigationContext);
  if (!context) {
    throw new Error('useAudioNavigation must be used within AudioPlaybackProvider');
  }
  return context;
}

export function useQuranPlayback() {
  const context = React.useContext(QuranPlaybackContext);
  if (!context) {
    throw new Error('useQuranPlayback must be used within AudioPlaybackProvider');
  }
  return context;
}

export function useRadioPlayback() {
  const context = React.useContext(RadioPlaybackContext);
  if (!context) {
    throw new Error('useRadioPlayback must be used within AudioPlaybackProvider');
  }
  return context;
}
