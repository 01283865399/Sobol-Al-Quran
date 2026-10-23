'use client';

import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Headphones, Loader2, Play, RotateCcw } from 'lucide-react';
import { PageLayout } from '@/components/page-layout';
import { QuranListeningPlayer } from '@/components/quran-listening-player';
import { Button } from '@/components/ui/button';
import {
  useAudioNavigation,
  useQuranPlayback,
} from '@/components/audio-playback-provider';
import {
  fetchSurahList,
  type QuranReciter,
  type SurahMeta,
} from '@/lib/quran-api';

export function QuranReciterListenPage({ reciter }: { reciter: QuranReciter }) {
  const { quran: player } = useQuranPlayback();
  const {
    mainPlayerOpen,
    setMainPlayerOpen,
    setPlayerRoute,
  } = useAudioNavigation();
  const changeReciter = player.changeReciter;
  const playFullSurah = player.playFullSurah;
  const [surahs, setSurahs] = React.useState<SurahMeta[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [attempt, setAttempt] = React.useState(0);
  const [portraitFailed, setPortraitFailed] = React.useState(false);

  React.useEffect(() => {
    void changeReciter(reciter.id);
  }, [changeReciter, reciter.id]);

  React.useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    fetchSurahList(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setSurahs(
            reciter.surahAudioUrls
              ? result.filter((surah) => reciter.surahAudioUrls?.[surah.number])
              : reciter.fullSurahAudioBaseUrl
                ? result
                : []
          );
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setError('تعذر تحميل قائمة السور. تحقق من اتصالك ثم أعد المحاولة.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [attempt, reciter]);

  const playSurah = React.useCallback((surahNumber: number) => {
    const audioUrl =
      reciter.surahAudioUrls?.[surahNumber] ??
      (reciter.fullSurahAudioBaseUrl
        ? `${reciter.fullSurahAudioBaseUrl}${String(surahNumber).padStart(3, '0')}.mp3`
        : undefined);
    if (!audioUrl) return;
    if (playFullSurah(surahNumber, audioUrl, reciter.id)) {
      setPlayerRoute(`/quran/reciters/${reciter.id}`);
      setMainPlayerOpen(true);
    }
  }, [playFullSurah, reciter, setMainPlayerOpen, setPlayerRoute]);

  return (
    <PageLayout showHomeLink={false}>
      <QuranListeningPlayer
        open={mainPlayerOpen}
        onClose={() => setMainPlayerOpen(false)}
        surahs={surahs}
        reciter={reciter}
        player={player}
        playSurah={playSurah}
        fullSurahMode
      />
      <section className="quran-reciter-page w-full">
        <div className="quran-reciter-layout">
          <header className="quran-reciter-hero">
            {reciter.portraitUrl && !portraitFailed ? (
              <img
                className="quran-reciter-hero__backdrop"
                src={reciter.portraitUrl}
                alt=""
                onError={() => setPortraitFailed(true)}
              />
            ) : (
              <div className="quran-reciter-hero__backdrop-fallback" aria-hidden="true">
                <Headphones />
              </div>
            )}
            {reciter.portraitUrl && !portraitFailed && (
              <img
                className="quran-reciter-hero__portrait"
                src={reciter.portraitUrl}
                alt={`صورة ${reciter.name}`}
                onError={() => setPortraitFailed(true)}
              />
            )}
            <div className="quran-reciter-hero__content">
              <Link to="/quran" className="quran-reciter-hero__back">
                <ArrowRight aria-hidden="true" />
                قائمة القراء
              </Link>
              <p className="quran-reciter-hero__eyebrow">القارئ</p>
              <h1>{reciter.name}</h1>
              <p className="quran-reciter-hero__english">{reciter.englishName}</p>
              <p className="quran-reciter-hero__bio">{reciter.bio}</p>
              <div className="quran-reciter-hero__details">
                <span>{reciter.recitationCategory === 'mujawwad' ? 'تلاوة مجوّدة' : 'تلاوة مرتّلة'}</span>
                {reciter.surahAudioUrls ? (
                  <span>{Object.keys(reciter.surahAudioUrls).length} سور متاحة</span>
                ) : (
                  <span>المصحف كاملًا</span>
                )}
              </div>
            </div>
          </header>

          <div className="quran-reciter-toolbar">
            <button
              type="button"
              className="quran-reciter-hero__play"
              onClick={() => surahs[0] && playSurah(surahs[0].number)}
              disabled={loading || surahs.length === 0}
            >
              <Play fill="currentColor" aria-hidden="true" />
              ابدأ الاستماع
            </button>
            <a className="quran-reciter-hero__browse" href="#surah-list">
              <BookOpen aria-hidden="true" />
              قائمة السور
            </a>
          </div>

          <section id="surah-list" className="quran-reciter-surahs" aria-labelledby="surah-list-heading">
            <div className="quran-reciter-surahs__heading">
              <div>
                <h2 id="surah-list-heading">السور المتاحة</h2>
                <p>اختر سورة لبدء الاستماع</p>
              </div>
              <span>{surahs.length}</span>
            </div>

            {loading && (
              <div role="status" className="flex justify-center py-16 text-primary">
                <Loader2 className="h-8 w-8 animate-spin" aria-label="جارٍ تحميل السور" />
              </div>
            )}

            {error && !loading && (
              <div role="alert" className="quran-reciter-surahs__error">
                <p>{error}</p>
                <Button className="mt-4" variant="outline" onClick={() => setAttempt((value) => value + 1)}>
                  <RotateCcw className="ml-2 h-4 w-4" aria-hidden="true" />
                  إعادة المحاولة
                </Button>
              </div>
            )}

            {!loading && !error && surahs.length > 0 && (
              <div className="quran-surah-grid">
                {surahs.map((surah) => (
                  <button
                    key={surah.number}
                    type="button"
                    className={`quran-surah-option${mainPlayerOpen && player.currentSurahNumber === surah.number ? ' is-current' : ''}`}
                    onClick={() => playSurah(surah.number)}
                    aria-label={`استمع إلى سورة ${surah.name}، رقم ${surah.number}`}
                  >
                    <span className="quran-surah-option__art" aria-hidden="true">
                      {reciter.portraitUrl && !portraitFailed ? (
                        <img
                          src={reciter.portraitUrl}
                          alt=""
                          onError={() => setPortraitFailed(true)}
                        />
                      ) : (
                        <span>{surah.number}</span>
                      )}
                    </span>
                    <span className="quran-surah-option__name">
                      <strong>{surah.name}</strong>
                      <small>{surah.englishName}</small>
                    </span>
                    <span className="quran-surah-option__meta">{surah.numberOfAyahs} آية</span>
                    <span className="quran-surah-option__play">
                      <Headphones aria-hidden="true" />
                      استمع
                    </span>
                  </button>
                ))}
              </div>
            )}
            {!loading && !error && surahs.length === 0 && (
              <p className="quran-reciter-surahs__empty">
                لا توجد سور متاحة حاليًا لهذا القارئ.
              </p>
            )}
            <Link to="/quran/read" className="quran-reading-link">
              <BookOpen aria-hidden="true" />
              الانتقال إلى المصحف للقراءة
            </Link>
          </section>
        </div>
      </section>
    </PageLayout>
  );
}
