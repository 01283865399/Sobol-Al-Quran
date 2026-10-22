'use client';

import * as React from 'react';
import {
  Check,
  ChevronDown,
  ListMusic,
  Pause,
  Play,
  Repeat2,
  SkipBack,
  SkipForward,
  Star,
  Volume2,
  X,
} from 'lucide-react';
import { LISTENING_AMBIENCES } from '@/lib/listening-ambiences';

export interface HadithAudioItem {
  id: number;
  text: string;
  narrator: string;
  source: string;
  book: string;
  grade: 'صحيح' | 'حسن' | 'ضعيف';
}

interface HadithListeningPlayerProps {
  open: boolean;
  onClose: () => void;
  hadith: HadithAudioItem;
  hadiths: HadithAudioItem[];
  onSelectHadith: (hadith: HadithAudioItem) => void;
}

const speechRates = [0.75, 1, 1.25, 1.5, 1.75, 2];

export function HadithListeningPlayer({
  open,
  onClose,
  hadith,
  hadiths,
  onSelectHadith,
}: HadithListeningPlayerProps) {
  const [ambienceId, setAmbienceId] = React.useState<(typeof LISTENING_AMBIENCES)[number]['id']>('rain');
  const [ambienceMenuOpen, setAmbienceMenuOpen] = React.useState(false);
  const [playlistOpen, setPlaylistOpen] = React.useState(false);
  const [rateIndex, setRateIndex] = React.useState(1);
  const [repeat, setRepeat] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [error, setError] = React.useState('');
  const [favorites, setFavorites] = React.useState<number[]>([]);
  const [favoriteReady, setFavoriteReady] = React.useState(false);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const backgroundVideoRef = React.useRef<HTMLVideoElement>(null);
  const utteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null);
  const repeatRef = React.useRef(false);
  const rate = speechRates[rateIndex];
  const currentIndex = hadiths.findIndex((item) => item.id === hadith.id);
  const ambience = LISTENING_AMBIENCES.find((item) => item.id === ambienceId) ?? LISTENING_AMBIENCES[0];
  const Icon = ambience.icon;
  const isFavorite = favorites.includes(hadith.id);

  React.useEffect(() => {
    try {
      const saved = window.localStorage.getItem('subul-hadith-favorites');
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.every(Number.isInteger)) setFavorites(parsed);
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
      window.localStorage.setItem('subul-hadith-favorites', JSON.stringify(favorites));
    } catch {
      // Favorites remain available for this session if browser storage is unavailable.
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
    if (!open || !ambience.video) return;
    const video = backgroundVideoRef.current;
    if (!video) return;

    video.muted = true;
    void video.play().catch((playbackError: unknown) => {
      if (playbackError instanceof DOMException && playbackError.name === 'AbortError') return;
      console.error(`Unable to play hadith ambience video: ${ambience.id}`, playbackError);
    });
    return () => video.pause();
  }, [ambience.id, ambience.video, open]);

  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (playlistOpen) setPlaylistOpen(false);
      else if (ambienceMenuOpen) setAmbienceMenuOpen(false);
      else onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, playlistOpen, ambienceMenuOpen, onClose]);

  React.useEffect(() => () => {
    window.speechSynthesis?.cancel();
    utteranceRef.current = null;
  }, []);

  const speak = (item: HadithAudioItem, speechRate = rate) => {
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      setError('ميزة القراءة الصوتية غير مدعومة في هذا المتصفح.');
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(item.text);
    utterance.lang = 'ar-SA';
    utterance.rate = speechRate;
    const arabicVoice = window.speechSynthesis.getVoices().find((voice) => /^ar(-|$)/i.test(voice.lang));
    if (arabicVoice) utterance.voice = arabicVoice;
    utterance.onend = () => {
      if (utteranceRef.current === utterance) {
        utteranceRef.current = null;
        if (repeatRef.current) {
          speak(item);
          return;
        }
        setIsPlaying(false);
      }
    };
    utterance.onerror = () => {
      if (utteranceRef.current === utterance) {
        utteranceRef.current = null;
        setIsPlaying(false);
        setError('تعذرت القراءة الصوتية. قد لا يتوفر صوت عربي على هذا الجهاز.');
      }
    };
    utteranceRef.current = utterance;
    setError('');
    setIsPlaying(true);
    onSelectHadith(item);
    window.speechSynthesis.speak(utterance);
  };

  const togglePlayback = () => {
    if (window.speechSynthesis.paused && utteranceRef.current) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      return;
    }
    if (isPlaying && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      return;
    }
    speak(hadith);
  };

  const selectAdjacent = (offset: -1 | 1) => {
    const next = hadiths[currentIndex + offset];
    if (next) speak(next);
  };

  const changeRate = () => {
    const nextIndex = (rateIndex + 1) % speechRates.length;
    setRateIndex(nextIndex);
    if (utteranceRef.current) speak(hadith, speechRates[nextIndex]);
  };

  const closePlayer = () => {
    window.speechSynthesis?.cancel();
    utteranceRef.current = null;
    setIsPlaying(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="مشغل الاستماع إلى الحديث"
      tabIndex={-1}
      className="quran-listening"
      style={{
        backgroundImage: ambience.image
          ? `url("${ambience.image}")`
          : ambience.fallback,
      }}
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
        />
      )}
      <div className="quran-listening__shade" aria-hidden="true" />

      <header className="quran-listening__top">
        <button
          type="button"
          className="quran-listening__icon-button"
          onClick={closePlayer}
          aria-label="إغلاق المشغل والعودة للأحاديث"
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
              previous.includes(hadith.id)
                ? previous.filter((id) => id !== hadith.id)
                : [...previous, hadith.id]
            ))}
            aria-label={isFavorite ? 'إزالة الحديث من المفضلة' : 'إضافة الحديث إلى المفضلة'}
            aria-pressed={isFavorite}
          >
            <Star aria-hidden="true" />
          </button>
          <div className="quran-listening__track-info" dir="rtl">
            <div className="quran-listening__reciter-avatar"><Volume2 aria-hidden="true" /></div>
            <div className="quran-listening__track-copy">
              <p className="quran-listening__surah">حديث رقم {hadith.id} · {hadith.grade}</p>
              <p className="quran-listening__reciter">{hadith.narrator}</p>
              <p className="quran-listening__status" role="status" aria-live="polite">
                {error || (isPlaying ? 'قراءة صوتية آلية من جهازك' : hadith.source)}
              </p>
              <p className="quran-listening__hadith-text">{hadith.text}</p>
            </div>
          </div>
        </div>

        <div className="quran-listening__controls" dir="ltr">
          <button
            type="button"
            className={`quran-listening__control${repeat ? ' is-active' : ''}`}
            onClick={() => setRepeat((value) => {
              repeatRef.current = !value;
              return !value;
            })}
            aria-label={repeat ? 'إيقاف تكرار الحديث' : 'تكرار الحديث'}
            aria-pressed={repeat}
          >
            <Repeat2 aria-hidden="true" />
          </button>
          <button
            type="button"
            className="quran-listening__control"
            onClick={() => selectAdjacent(-1)}
            disabled={currentIndex <= 0}
            aria-label="الحديث السابق"
          >
            <SkipBack aria-hidden="true" />
          </button>
          <button
            type="button"
            className="quran-listening__play"
            onClick={togglePlayback}
            aria-label={isPlaying ? 'إيقاف مؤقت' : 'استمع إلى الحديث'}
          >
            {isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          </button>
          <button
            type="button"
            className="quran-listening__control"
            onClick={() => selectAdjacent(1)}
            disabled={currentIndex < 0 || currentIndex >= hadiths.length - 1}
            aria-label="الحديث التالي"
          >
            <SkipForward aria-hidden="true" />
          </button>
          <button
            type="button"
            className="quran-listening__control quran-listening__speed"
            onClick={changeRate}
            aria-label={`سرعة القراءة ${rate} مرة`}
          >
            {rate}×
          </button>
        </div>

        <div className="quran-listening__live-status" role="status">
          <span className="quran-listening__live-dot" />
          <span>قراءة آلية بصوت عربي متاح على جهازك، وليست تسجيلًا صوتيًا</span>
        </div>

        <footer className="quran-listening__utilities">
          <button
            type="button"
            className="quran-listening__utility"
            onClick={() => {
              setAmbienceMenuOpen(false);
              setPlaylistOpen(true);
            }}
            aria-label="فتح قائمة الأحاديث"
          >
            <ListMusic aria-hidden="true" />
            <span>قائمة الأحاديث</span>
          </button>
          <div className="quran-listening__volume-wrap">
            <span className="quran-listening__utility" aria-label="قراءة صوتية من الجهاز">
              <Volume2 aria-hidden="true" />
              <span>صوت الجهاز</span>
            </span>
          </div>
        </footer>
      </div>

      {playlistOpen && (
        <div className="quran-listening__drawer-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setPlaylistOpen(false);
        }}>
          <section className="quran-listening__drawer" role="dialog" aria-modal="true" aria-label="قائمة الأحاديث">
            <div className="quran-listening__drawer-heading">
              <div>
                <p>القراءة الحالية</p>
                <h2>قائمة الأحاديث</h2>
              </div>
              <button type="button" className="quran-listening__icon-button" onClick={() => setPlaylistOpen(false)} aria-label="إغلاق قائمة الأحاديث">
                <X aria-hidden="true" />
              </button>
            </div>
            <div className="quran-listening__playlist">
              {hadiths.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`quran-listening__playlist-item${item.id === hadith.id ? ' is-current' : ''}`}
                  onClick={() => {
                    speak(item);
                    setPlaylistOpen(false);
                  }}
                >
                  <span className="quran-listening__surah-number">{item.id}</span>
                  <span className="quran-listening__playlist-name">
                    <strong>حديث رقم {item.id}</strong>
                    <small>{item.narrator}</small>
                  </span>
                  {item.id === hadith.id && <Play aria-hidden="true" />}
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
