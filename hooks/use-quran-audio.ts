'use client';

import * as React from 'react';
import {
  fetchSurahAudio,
  QURAN_RECITERS,
  type QuranAudioTrack,
} from '@/lib/quran-api';

const PLAYBACK_ERROR = 'تعذر تشغيل التلاوة، جرّب المصدر البديل أو أعد المحاولة';

export interface QuranFullSurahQueueItem {
  surahNumber: number;
  reciterId: string;
}

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
  const selectedReciterRef = React.useRef('ar.alafasy');
  const lastReportedTimeRef = React.useRef(0);

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
  const fullSurahQueueRef = React.useRef<QuranFullSurahQueueItem[]>([]);
  const fullSurahQueueIndexRef = React.useRef(-1);
  const [fullSurahQueueIndex, setFullSurahQueueIndex] = React.useState(-1);

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
    lastReportedTimeRef.current = seekTo;
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

  const startFullSurah = React.useCallback((
    item: QuranFullSurahQueueItem,
    clearQueue = false
  ) => {
    const reciter = QURAN_RECITERS.find((candidate) => candidate.id === item.reciterId);
    const audioUrl = reciter?.surahAudioUrls?.[item.surahNumber] ??
      (reciter?.fullSurahAudioBaseUrl
        ? `${reciter.fullSurahAudioBaseUrl}${String(item.surahNumber).padStart(3, '0')}.mp3`
        : undefined);

    if (
      !Number.isInteger(item.surahNumber) ||
      item.surahNumber < 1 ||
      item.surahNumber > 114 ||
      !reciter
    ) {
      setAudioError('تعذر تحديد السورة أو القارئ المطلوب');
      return false;
    }
    if (!audioUrl) {
      setAudioError('لا تتوفر تلاوة لهذه السورة ضمن قائمة التشغيل');
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

    if (clearQueue) {
      fullSurahQueueRef.current = [];
      fullSurahQueueIndexRef.current = -1;
      setFullSurahQueueIndex(-1);
    }
    playlistRequestRef.current += 1;
    currentSurahRef.current = item.surahNumber;
    currentTrackIndexRef.current = 0;
    selectedReciterRef.current = item.reciterId;
    playlistKeyRef.current = `full:${item.surahNumber}:${item.reciterId}`;
    tracksRef.current = [{ numberInSurah: 1, sources: [source.href] }];
    setCurrentSurahNumber(item.surahNumber);
    setSelectedReciter(item.reciterId);
    playTrackAt(0, 0, true);
    return true;
  }, [playTrackAt]);

  const playFullSurahQueueItem = React.useCallback((index: number) => {
    const item = fullSurahQueueRef.current[index];
    if (!item) return false;
    fullSurahQueueIndexRef.current = index;
    setFullSurahQueueIndex(index);
    return startFullSurah(item);
  }, [startFullSurah]);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      if (repeatTrackRef.current) {
        playTrackAt(currentTrackIndexRef.current);
        return;
      }
      if (fullSurahQueueRef.current.length > 0) {
        const nextQueueIndex = fullSurahQueueIndexRef.current + 1;
        if (nextQueueIndex < fullSurahQueueRef.current.length) {
          playFullSurahQueueItem(nextQueueIndex);
          return;
        }
        fullSurahQueueRef.current = [];
        fullSurahQueueIndexRef.current = -1;
        setFullSurahQueueIndex(-1);
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
      }
      lastReportedTimeRef.current = audio.currentTime;
      setCurrentTime(audio.currentTime);
      setIsLoading(false);
    };
    const onTimeUpdate = () => {
      if (
        Math.abs(audio.currentTime - lastReportedTimeRef.current) < 0.5 &&
        audio.currentTime !== audio.duration
      ) {
        return;
      }
      lastReportedTimeRef.current = audio.currentTime;
      setCurrentTime(audio.currentTime);
    };
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
  }, [playFullSurahQueueItem, playTrackAt]);

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
    fullSurahQueueRef.current = [];
    fullSurahQueueIndexRef.current = -1;
    setFullSurahQueueIndex(-1);
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
    const reciter = QURAN_RECITERS.find((candidate) => candidate.id === reciterId);
    const configuredUrl = reciter?.surahAudioUrls?.[surahNumber] ??
      (reciter?.fullSurahAudioBaseUrl
        ? `${reciter.fullSurahAudioBaseUrl}${String(surahNumber).padStart(3, '0')}.mp3`
        : undefined);
    if (configuredUrl !== audioUrl) {
      setAudioError('رابط التلاوة لا يطابق بيانات القارئ');
      return false;
    }
    return startFullSurah({ surahNumber, reciterId }, true);
  }, [startFullSurah]);

  const playFullSurahQueue = React.useCallback((
    items: QuranFullSurahQueueItem[],
    startIndex = 0
  ) => {
    if (
      items.length === 0 ||
      !Number.isInteger(startIndex) ||
      startIndex < 0 ||
      startIndex >= items.length
    ) {
      setAudioError('قائمة التشغيل فارغة أو لا تحتوي على سورة صالحة');
      return false;
    }
    fullSurahQueueRef.current = items.map((item) => ({ ...item }));
    fullSurahQueueIndexRef.current = startIndex;
    setFullSurahQueueIndex(startIndex);
    if (!startFullSurah(items[startIndex])) {
      fullSurahQueueRef.current = [];
      fullSurahQueueIndexRef.current = -1;
      setFullSurahQueueIndex(-1);
      return false;
    }
    return true;
  }, [startFullSurah]);

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
    fullSurahQueueRef.current = [];
    fullSurahQueueIndexRef.current = -1;
    setFullSurahQueueIndex(-1);
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
    lastReportedTimeRef.current = 0;
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const seek = React.useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio && Number.isFinite(audio.duration)) {
      audio.currentTime = Math.max(0, Math.min(time, audio.duration));
      lastReportedTimeRef.current = audio.currentTime;
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

  const skipFullSurahQueue = React.useCallback((offset: -1 | 1) => {
    const nextIndex = fullSurahQueueIndexRef.current + offset;
    if (nextIndex < 0 || nextIndex >= fullSurahQueueRef.current.length) return false;
    return playFullSurahQueueItem(nextIndex);
  }, [playFullSurahQueueItem]);

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
    fullSurahQueueIndex,
    fullSurahQueueLength: fullSurahQueueRef.current.length,
    skipFullSurahQueue,
    playSurah,
    playFullSurah,
    playFullSurahQueue,
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
