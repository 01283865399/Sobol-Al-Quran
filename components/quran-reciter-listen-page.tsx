'use client';

import * as React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, BookOpen, Headphones, Loader2, ListMusic, Play, Plus, RotateCcw } from 'lucide-react';
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
import {
  saveQuranPlaylists,
  useQuranPlaylists,
} from '@/lib/quran-playlists';

export function QuranReciterListenPage({ reciter }: { reciter: QuranReciter }) {
  const [searchParams] = useSearchParams();
  const ambienceProfile = searchParams.get('ambience') === 'haramain' ? 'haramain' : undefined;
  const { quran: player } = useQuranPlayback();
  const { playlists } = useQuranPlaylists();
  const {
    mainPlayerOpen,
    setMainPlayerOpen,
    setPlayerRoute,
  } = useAudioNavigation();
  const changeReciter = player.changeReciter;
  const playFullSurah = player.playFullSurah;
  const hasSurahAudio = Boolean(
    reciter.surahAudioUrls
      || reciter.availableSurahNumbers
      || reciter.fullSurahAudioBaseUrl
  );
  const [surahs, setSurahs] = React.useState<SurahMeta[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [attempt, setAttempt] = React.useState(0);
  const [portraitFailed, setPortraitFailed] = React.useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = React.useState('');
  const [playlistNotice, setPlaylistNotice] = React.useState('');

  React.useEffect(() => {
    void changeReciter(reciter.id);
  }, [changeReciter, reciter.id]);

  React.useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    if (!hasSurahAudio) {
      setSurahs([]);
      setLoading(false);
      return () => controller.abort();
    }
    fetchSurahList(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setSurahs(
            reciter.surahAudioUrls
              ? result.filter((surah) => reciter.surahAudioUrls?.[surah.number])
              : reciter.availableSurahNumbers
                ? result.filter((surah) => reciter.availableSurahNumbers?.includes(surah.number))
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
  }, [attempt, hasSurahAudio, reciter]);

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

  const addToPlaylist = (surahNumber: number) => {
    const playlistId = selectedPlaylistId || playlists[0]?.id;
    if (!playlistId) {
      setPlaylistNotice('أنشئ قائمة تشغيل أولًا، ثم أضف السور إليها.');
      return;
    }
    const next = playlists.map((playlist) => {
      if (playlist.id !== playlistId) return playlist;
      if (playlist.items.some(
        (item) => item.reciterId === reciter.id && item.surahNumber === surahNumber
      )) {
        return playlist;
      }
      return {
        ...playlist,
        items: [
          ...playlist.items,
          {
            id: globalThis.crypto?.randomUUID?.()
              ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            reciterId: reciter.id,
            surahNumber,
          },
        ],
      };
    });
    try {
      saveQuranPlaylists(next);
      const selected = playlists.find((playlist) => playlist.id === playlistId);
      setPlaylistNotice(
        selected?.items.some(
          (item) => item.reciterId === reciter.id && item.surahNumber === surahNumber
        )
          ? 'السورة موجودة بالفعل في القائمة.'
          : 'أُضيفت السورة إلى قائمة التشغيل.'
      );
    } catch {
      setPlaylistNotice('تعذر حفظ القائمة على هذا الجهاز.');
    }
  };
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
        ambienceProfile={ambienceProfile}
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
                ) : reciter.availableSurahNumbers ? (
                  <span>{reciter.availableSurahNumbers.length} سورة متاحة</span>
                ) : reciter.fullSurahAudioBaseUrl ? (
                  <span>المصحف كاملًا</span>
                ) : (
                  <span>التلاوات قريبًا</span>
                )}
              </div>
            </div>
          </header>

          <div className="quran-reciter-toolbar">
            <Link to="/quran/playlists" className="quran-reciter-hero__browse">
              <ListMusic aria-hidden="true" />
              قوائم التشغيل
            </Link>
            {hasSurahAudio && (
              <>
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
                {playlists.length > 0 && (
                  <label className="quran-reciter-playlist-select">
                    <span>أضف إلى:</span>
                    <select
                      aria-label="اختر قائمة التشغيل لإضافة السورة إليها"
                      value={playlists.some((playlist) => playlist.id === selectedPlaylistId)
                        ? selectedPlaylistId
                        : playlists[0].id}
                      onChange={(event) => setSelectedPlaylistId(event.target.value)}
                    >
                      {playlists.map((playlist) => (
                        <option key={playlist.id} value={playlist.id}>{playlist.name}</option>
                      ))}
                    </select>
                  </label>
                )}
              </>
            )}
          </div>
          {playlistNotice && (
            <p className="quran-reciter-playlist-notice" role="status">{playlistNotice}</p>
          )}

          <section id="surah-list" className="quran-reciter-surahs" aria-labelledby="surah-list-heading">
            <div className="quran-reciter-surahs__heading">
              <div>
                <h2 id="surah-list-heading">{hasSurahAudio ? 'السور المتاحة' : 'التلاوات قريبًا'}</h2>
                <p>{hasSurahAudio ? 'اختر سورة لبدء الاستماع' : 'نعمل على توفير تسجيلات هذا القارئ'}</p>
              </div>
              <span>{hasSurahAudio ? surahs.length : 'قريبًا'}</span>
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
              <>
                <div className="quran-surah-grid">
                  {surahs.map((surah) => (
                    <div className="quran-reciter-surah-actions" key={surah.number}>
                      <button
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
                      {playlists.length > 0 && (
                        <button
                          type="button"
                          className="quran-reciter-surah-add"
                          onClick={() => addToPlaylist(surah.number)}
                          aria-label={`إضافة سورة ${surah.name} إلى قائمة التشغيل`}
                          title="أضف إلى قائمة التشغيل"
                        >
                          <Plus aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
            {!loading && !error && surahs.length === 0 && (
              <p className="quran-reciter-surahs__empty">
                {!hasSurahAudio ? (
                  'نعمل على إضافة تسجيلات هذا القارئ. ستتوفر قريبًا بإذن الله.'
                ) : (
                  'لا توجد سور متاحة حاليًا لهذا القارئ.'
                )}
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
