'use client';

import * as React from 'react';
import {
  fetchSurahAudio,
  QURAN_RECITERS,
  type QuranAudioTrack,
} from '@/lib/quran-api';

const PLAYBACK_ERROR = 'تعذر تشغيل التلاوة، جرّب المصدر البديل أو أعد المحاولة';

export function useQuranAudio() {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const tracksRef = React.useRef<QuranAudioTrack[]>([]);
  const playlistKeyRef = React.useRef('');
  const currentSurahRef = React.useRef<number | null>(null);
  const currentTrackIndexRef = React.useRef(-1);
  const sourceIndexRef = React.useRef(0);
  const autoplayRef = React.useRef(true);
  const pendingSeekRef = React.useRef<number | null>(null);
  const playbackAttemptRef = React.useRef(0);
  const playlistRequestRef = React.useRef(0);
  const selectedReciterRef = React.useRef(QURAN_RECITERS[5].id);

  const [selectedReciter, setSelectedReciter] = React.useState(selectedReciterRef.current);
  const [currentSurahNumber, setCurrentSurahNumber] = React.useState<number | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = React.useState(-1);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [audioError, setAudioError] = React.useState('');
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(1);
  const [playbackRate, setPlaybackRate] = React.useState(1);
  const [repeatTrack, setRepeatTrack] = React.useState(false);
  const repeatTrackRef = React.useRef(false);

  React.useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  React.useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  const playTrackAt = React.useCallback((
    trackIndex: number,
    sourceIndex = 0,
    autoplay = true,
    seekTo = 0
  ) => {
    const audio = audioRef.current;
    const track = tracksRef.current[trackIndex];
    const source = track?.sources[sourceIndex];

    if (!audio || !track || !source) {
      setIsLoading(false);
      setIsPlaying(false);
      setAudioError(PLAYBACK_ERROR);
      return;
    }

    const attempt = ++playbackAttemptRef.current;
    currentTrackIndexRef.current = trackIndex;
    sourceIndexRef.current = sourceIndex;
    autoplayRef.current = autoplay;
    pendingSeekRef.current = seekTo > 0 ? seekTo : null;
    setCurrentTrackIndex(trackIndex);
    setCurrentTime(seekTo);
    setDuration(0);
    setAudioError('');
    setIsLoading(true);
    setIsPlaying(false);

    audio.pause();
    audio.src = source;
    audio.load();

    if (autoplay) {
      audio.play().then(() => {
        if (attempt === playbackAttemptRef.current) setIsPlaying(true);
      }).catch(() => {
        if (attempt !== playbackAttemptRef.current) return;
        setIsLoading(false);
        setIsPlaying(false);
        setAudioError(PLAYBACK_ERROR);
      });
    }
  }, []);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      if (repeatTrackRef.current) {
        playTrackAt(currentTrackIndexRef.current);
        return;
      }
      const nextTrack = currentTrackIndexRef.current + 1;
      if (nextTrack < tracksRef.current.length) {
        playTrackAt(nextTrack);
      } else {
        setIsPlaying(false);
        setIsLoading(false);
      }
    };
    const onError = () => {
      const track = tracksRef.current[currentTrackIndexRef.current];
      const nextSource = sourceIndexRef.current + 1;
      if (track && nextSource < track.sources.length) {
        playTrackAt(currentTrackIndexRef.current, nextSource, autoplayRef.current);
      } else {
        setIsLoading(false);
        setIsPlaying(false);
        setAudioError(PLAYBACK_ERROR);
      }
    };
    const onLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
      const pendingSeek = pendingSeekRef.current;
      if (pendingSeek !== null && Number.isFinite(audio.duration)) {
        audio.currentTime = Math.min(pendingSeek, audio.duration);
        pendingSeekRef.current = null;
        setCurrentTime(audio.currentTime);
      }
      setIsLoading(false);
    };
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
    };
  }, [playTrackAt]);

  React.useEffect(() => () => {
    playlistRequestRef.current += 1;
    playbackAttemptRef.current += 1;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
  }, []);

  const loadPlaylist = React.useCallback(async (
    surahNumber: number,
    reciterId: string,
    startTrack: number,
    autoplay: boolean,
    seekTo = 0
  ) => {
    const key = `${surahNumber}:${reciterId}`;
    const request = ++playlistRequestRef.current;
    currentSurahRef.current = surahNumber;
    setCurrentSurahNumber(surahNumber);
    setAudioError('');
    setIsLoading(true);
    if (key !== playlistKeyRef.current) {
      audioRef.current?.pause();
      tracksRef.current = [];
      playlistKeyRef.current = '';
      currentTrackIndexRef.current = -1;
      setCurrentTrackIndex(-1);
    }

    try {
      const tracks = key === playlistKeyRef.current
        ? tracksRef.current
        : await fetchSurahAudio(surahNumber, reciterId);
      if (request !== playlistRequestRef.current) return false;
      if (tracks.length === 0 || startTrack < 0 || startTrack >= tracks.length) {
        throw new Error(`No audio track is available for ayah ${startTrack + 1}`);
      }

      tracksRef.current = tracks;
      playlistKeyRef.current = key;
      playTrackAt(startTrack, 0, autoplay, seekTo);
      return true;
    } catch {
      if (request === playlistRequestRef.current) {
        setIsLoading(false);
        setIsPlaying(false);
        setAudioError('تعذر تحميل تلاوة السورة، تحقق من اتصالك ثم أعد المحاولة');
      }
      return false;
    }
  }, [playTrackAt]);

  const playSurah = React.useCallback(
    (surahNumber: number, startTrack = 0) =>
      loadPlaylist(surahNumber, selectedReciterRef.current, startTrack, true),
    [loadPlaylist]
  );

  const playFullSurah = React.useCallback((surahNumber: number, audioUrl: string, reciterId: string) => {
    if (
      !Number.isInteger(surahNumber) ||
      surahNumber < 1 ||
      surahNumber > 114 ||
      !QURAN_RECITERS.some((reciter) => reciter.id === reciterId)
    ) {
      setAudioError('تعذر تحديد السورة أو القارئ المطلوب');
      return false;
    }

    let source: URL;
    try {
      source = new URL(audioUrl);
    } catch {
      setAudioError('رابط التلاوة غير صالح');
      return false;
    }
    if (source.protocol !== 'https:') {
      setAudioError('مصدر التلاوة غير آمن');
      return false;
    }

    playlistRequestRef.current += 1;
    currentSurahRef.current = surahNumber;
    currentTrackIndexRef.current = 0;
    selectedReciterRef.current = reciterId;
    playlistKeyRef.current = `full:${surahNumber}:${reciterId}`;
    tracksRef.current = [{ numberInSurah: 1, sources: [source.href] }];
    setCurrentSurahNumber(surahNumber);
    setSelectedReciter(reciterId);
    playTrackAt(0, 0, true);
    return true;
  }, [playTrackAt]);

  const playAyah = React.useCallback(
    (surahNumber: number, ayahNumber: number) =>
      loadPlaylist(surahNumber, selectedReciterRef.current, ayahNumber - 1, true),
    [loadPlaylist]
  );

  const changeReciter = React.useCallback(async (reciterId: string) => {
    if (reciterId === selectedReciterRef.current) return true;
    const surahNumber = currentSurahRef.current;
    if (surahNumber === null) {
      selectedReciterRef.current = reciterId;
      setSelectedReciter(reciterId);
      return true;
    }

    const audio = audioRef.current;
    const wasPlaying = Boolean(audio && !audio.paused);
    const seekTo = audio?.currentTime ?? 0;
    const trackIndex = Math.max(0, currentTrackIndexRef.current);
    const request = ++playlistRequestRef.current;
    setIsLoading(true);
    setAudioError('');

    try {
      const tracks = await fetchSurahAudio(surahNumber, reciterId);
      if (request !== playlistRequestRef.current) return false;
      if (trackIndex >= tracks.length) {
        throw new Error(`Reciter ${reciterId} does not have ayah ${trackIndex + 1}`);
      }

      selectedReciterRef.current = reciterId;
      setSelectedReciter(reciterId);
      tracksRef.current = tracks;
      playlistKeyRef.current = `${surahNumber}:${reciterId}`;
      playTrackAt(trackIndex, 0, wasPlaying, wasPlaying ? 0 : seekTo);
      return true;
    } catch {
      if (request === playlistRequestRef.current) {
        setIsLoading(false);
        setAudioError('تعذر تبديل القارئ، استمر التشغيل بالمصدر الحالي');
      }
      return false;
    }
  }, [playTrackAt]);

  const togglePlayback = React.useCallback(() => {
    const audio = audioRef.current;
    if (!audio || currentSurahRef.current === null) return;

    if (audio.paused) {
      audio.play().then(() => {
        setAudioError('');
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
        setAudioError(PLAYBACK_ERROR);
      });
    } else {
      audio.pause();
    }
  }, []);

  const retry = React.useCallback(() => {
    if (currentTrackIndexRef.current >= 0) {
      playTrackAt(currentTrackIndexRef.current);
    } else if (currentSurahRef.current !== null) {
      void playSurah(currentSurahRef.current);
    }
  }, [playSurah, playTrackAt]);

  const stop = React.useCallback(() => {
    playlistRequestRef.current += 1;
    playbackAttemptRef.current += 1;
    currentSurahRef.current = null;
    currentTrackIndexRef.current = -1;
    tracksRef.current = [];
    playlistKeyRef.current = '';
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    setCurrentSurahNumber(null);
    setCurrentTrackIndex(-1);
    setIsPlaying(false);
    setIsLoading(false);
    setAudioError('');
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const seek = React.useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio && Number.isFinite(audio.duration)) {
      audio.currentTime = Math.max(0, Math.min(time, audio.duration));
      setCurrentTime(audio.currentTime);
    }
  }, []);

  const changeVolume = React.useCallback((nextVolume: number) => {
    const next = Math.max(0, Math.min(1, nextVolume));
    if (audioRef.current) audioRef.current.volume = next;
    setVolume(next);
  }, []);

  const changePlaybackRate = React.useCallback((nextRate: number) => {
    const next = Math.max(0.5, Math.min(2, nextRate));
    if (audioRef.current) audioRef.current.playbackRate = next;
    setPlaybackRate(next);
  }, []);

  const toggleRepeatTrack = React.useCallback(() => {
    const next = !repeatTrackRef.current;
    repeatTrackRef.current = next;
    setRepeatTrack(next);
  }, []);

  return {
    audioRef,
    selectedReciter,
    changeReciter,
    currentSurahNumber,
    currentTrackIndex,
    trackCount: tracksRef.current.length,
    isPlaying,
    isLoading,
    audioError,
    currentTime,
    duration,
    volume,
    playbackRate,
    repeatTrack,
    playSurah,
    playFullSurah,
    playAyah,
    togglePlayback,
    retry,
    stop,
    seek,
    changeVolume,
    changePlaybackRate,
    toggleRepeatTrack,
  };
}
