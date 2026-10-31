'use client';

import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Headphones,
  ListMusic,
  Play,
  Plus,
  Shuffle,
  Trash2,
  X,
} from 'lucide-react';
import { PageHeader, PageLayout } from '@/components/page-layout';
import {
  useAudioNavigation,
  useQuranPlayback,
} from '@/components/audio-playback-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  saveQuranPlaylists,
  useQuranPlaylists,
  type QuranPlaylist,
  type QuranPlaylistItem,
} from '@/lib/quran-playlists';
import { QURAN_RECITERS, fetchSurahList, type SurahMeta } from '@/lib/quran-api';

function createId() {
  return globalThis.crypto?.randomUUID?.()
    ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function QuranPlaylistsPage() {
  const { playlists, error: storageError, refresh } = useQuranPlaylists();
  const { quran: player } = useQuranPlayback();
  const { openMainPlayer } = useAudioNavigation();
  const [name, setName] = React.useState('');
  const [notice, setNotice] = React.useState('');
  const [surahs, setSurahs] = React.useState<SurahMeta[]>([]);
  const [surahError, setSurahError] = React.useState('');

  React.useEffect(() => {
    const controller = new AbortController();
    fetchSurahList(controller.signal)
      .then(setSurahs)
      .catch(() => {
        if (!controller.signal.aborted) {
          setSurahError('تعذر تحميل أسماء السور. يمكنك استخدام القوائم، لكن قد تظهر أرقام السور مؤقتًا.');
        }
      });
    return () => controller.abort();
  }, []);

  const updatePlaylists = React.useCallback((next: QuranPlaylist[]) => {
    try {
      saveQuranPlaylists(next);
      setNotice('');
    } catch {
      setNotice('تعذر حفظ التغييرات على هذا الجهاز. تحقق من مساحة التخزين.');
    }
  }, []);

  const createPlaylist = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextName = name.trim();
    if (!nextName) {
      setNotice('اكتب اسمًا لقائمة التشغيل أولًا.');
      return;
    }
    if (nextName.length > 40) {
      setNotice('اسم القائمة يجب ألا يتجاوز 40 حرفًا.');
      return;
    }
    updatePlaylists([
      { id: createId(), name: nextName, createdAt: Date.now(), items: [] },
      ...playlists,
    ]);
    setName('');
  };

  const removePlaylist = (playlistId: string) => {
    updatePlaylists(playlists.filter((playlist) => playlist.id !== playlistId));
  };

  const removeItem = (playlistId: string, itemId: string) => {
    updatePlaylists(playlists.map((playlist) => (
      playlist.id === playlistId
        ? { ...playlist, items: playlist.items.filter((item) => item.id !== itemId) }
        : playlist
    )));
  };

  const moveItem = (playlist: QuranPlaylist, index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= playlist.items.length) return;
    const items = [...playlist.items];
    [items[index], items[nextIndex]] = [items[nextIndex], items[index]];
    updatePlaylists(playlists.map((item) => (
      item.id === playlist.id ? { ...item, items } : item
    )));
  };

  const playPlaylist = (playlist: QuranPlaylist, startIndex = 0, shuffle = false) => {
    let playableItems: QuranPlaylistItem[] = playlist.items.filter((item) => {
      const reciter = QURAN_RECITERS.find((candidate) => candidate.id === item.reciterId);
      return Boolean(
        reciter?.surahAudioUrls?.[item.surahNumber] ||
        (reciter?.fullSurahAudioBaseUrl &&
          (!reciter.availableSurahNumbers ||
            reciter.availableSurahNumbers.includes(item.surahNumber)))
      );
    });
    if (playableItems.length === 0) {
      setNotice('لا توجد في هذه القائمة تلاوات متاحة للتشغيل.');
      return;
    }
    if (shuffle) {
      playableItems = [...playableItems];
      for (let index = playableItems.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [playableItems[index], playableItems[randomIndex]] =
          [playableItems[randomIndex], playableItems[index]];
      }
      startIndex = 0;
    }

    const selectedItem = playlist.items[startIndex];
    const queueStartIndex = Math.max(
      0,
      playableItems.findIndex((item) => item.id === selectedItem?.id)
    );
    const first = playableItems[queueStartIndex];
    const route = `/quran/reciters/${encodeURIComponent(first.reciterId)}`;
    if (player.playFullSurahQueue(playableItems, queueStartIndex)) {
      openMainPlayer(route);
    } else {
      setNotice(player.audioError || 'تعذر بدء قائمة التشغيل.');
    }
  };

  const getItemTitle = (item: QuranPlaylistItem) => {
    const surah = surahs.find((candidate) => candidate.number === item.surahNumber);
    const reciter = QURAN_RECITERS.find((candidate) => candidate.id === item.reciterId);
    return {
      surahName: surah?.name ?? `سورة ${item.surahNumber}`,
      reciterName: reciter?.name ?? 'قارئ غير متاح',
      reciterId: reciter?.id,
    };
  };

  const handleStorageError = () => {
    if (!storageError) return null;
    return (
      <div className="quran-playlists__error" role="alert">
        <p>{storageError}</p>
        <Button variant="outline" onClick={refresh}>إعادة المحاولة</Button>
      </div>
    );
  };

  return (
    <PageLayout showHomeLink={false}>
      <PageHeader
        title="قوائم التشغيل"
        subtitle="رتّب السور التي تحبها واستمع إليها بالتتابع. تُحفظ القوائم على هذا الجهاز."
        icon={<ListMusic className="h-8 w-8 text-accent" />}
      />

      <main className="quran-playlists">
        <nav className="quran-playlists__toolbar" aria-label="التنقل في قسم الاستماع">
          <Link to="/quran" className="reciter-directory__back">
            <ArrowRight aria-hidden="true" />
            العودة إلى الاستماع
          </Link>
          <Link to="/quran/reciters" className="reciter-directory__quran">
            <Headphones aria-hidden="true" />
            استكشف القراء
          </Link>
        </nav>

        {handleStorageError()}
        {surahError && <p className="quran-playlists__notice" role="status">{surahError}</p>}
        {notice && <p className="quran-playlists__notice" role="status">{notice}</p>}

        <form className="quran-playlists__create" onSubmit={createPlaylist}>
          <div>
            <h2>أنشئ قائمة جديدة</h2>
            <p>مثل: ورد الصباح، سور للحفظ، أو تلاواتي المفضلة.</p>
          </div>
          <label className="quran-playlists__create-field">
            <span className="sr-only">اسم قائمة التشغيل</span>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="اسم القائمة"
              maxLength={40}
              aria-label="اسم قائمة التشغيل"
            />
            <Button type="submit">
              <Plus aria-hidden="true" />
              إنشاء قائمة
            </Button>
          </label>
        </form>

        <section className="quran-playlists__collection" aria-labelledby="playlists-heading">
          <div className="quran-playlists__heading">
            <div>
              <h2 id="playlists-heading">قوائمك</h2>
              <p>يمكنك تعديل ترتيب السور أو حذفها في أي وقت.</p>
            </div>
            <span>{playlists.length} قائمة</span>
          </div>

          {playlists.length === 0 ? (
            <div className="quran-playlists__empty">
              <ListMusic aria-hidden="true" />
              <h3>ابدأ بقائمة من اختيارك</h3>
              <p>بعد إنشاء القائمة، أضف إليها السور من صفحة أي قارئ.</p>
              <Link to="/quran/reciters" className="quran-playlists__browse">
                تصفح القراء
              </Link>
            </div>
          ) : (
            <div className="quran-playlists__list">
              {playlists.map((playlist) => (
                <article className="quran-playlist" key={playlist.id}>
                  <header className="quran-playlist__header">
                    <div>
                      <h3>{playlist.name}</h3>
                      <span>{playlist.items.length} سورة</span>
                    </div>
                    <div className="quran-playlist__actions">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={playlist.items.length === 0}
                        onClick={() => playPlaylist(playlist)}
                      >
                        <Play fill="currentColor" aria-hidden="true" />
                        تشغيل القائمة
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={playlist.items.length === 0}
                        onClick={() => playPlaylist(playlist, 0, true)}
                        aria-label={`تشغيل ${playlist.name} عشوائيًا`}
                      >
                        <Shuffle aria-hidden="true" />
                        عشوائي
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        aria-label={`حذف قائمة ${playlist.name}`}
                        onClick={() => removePlaylist(playlist.id)}
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
                  </header>

                  {playlist.items.length === 0 ? (
                    <p className="quran-playlist__empty">
                      هذه القائمة فارغة. أضف السور من صفحة القارئ.
                    </p>
                  ) : (
                    <ol className="quran-playlist__items">
                      {playlist.items.map((item, index) => {
                        const title = getItemTitle(item);
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              className="quran-playlist__play-item"
                              onClick={() => playPlaylist(playlist, index)}
                              aria-label={`تشغيل ${title.surahName} بصوت ${title.reciterName}`}
                            >
                              <span>{String(index + 1).padStart(2, '0')}</span>
                              <span>
                                <strong>{title.surahName}</strong>
                                <small>{title.reciterName}</small>
                              </span>
                              <Play aria-hidden="true" />
                            </button>
                            <div className="quran-playlist__item-actions">
                              <button
                                type="button"
                                onClick={() => moveItem(playlist, index, -1)}
                                disabled={index === 0}
                                aria-label={`نقل ${title.surahName} للأعلى`}
                              >
                                <ArrowUp aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveItem(playlist, index, 1)}
                                disabled={index === playlist.items.length - 1}
                                aria-label={`نقل ${title.surahName} للأسفل`}
                              >
                                <ArrowDown aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeItem(playlist.id, item.id)}
                                aria-label={`إزالة ${title.surahName} من القائمة`}
                              >
                                <X aria-hidden="true" />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </PageLayout>
  );
}
