'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Headphones, Loader2, RotateCcw } from 'lucide-react';
import { PageHeader, PageLayout } from '@/components/page-layout';
import { QuranListeningPlayer } from '@/components/quran-listening-player';
import { Button } from '@/components/ui/button';
import { useAudioPlayback } from '@/components/audio-playback-provider';
import {
  fetchSurahList,
  type QuranReciter,
  type SurahMeta,
} from '@/lib/quran-api';

export function QuranReciterListenPage({ reciter }: { reciter: QuranReciter }) {
  const {
    quran: player,
    mainPlayerOpen,
    setMainPlayerOpen,
    setPlayerRoute,
  } = useAudioPlayback();
  const changeReciter = player.changeReciter;
  const playFullSurah = player.playFullSurah;
  const [surahs, setSurahs] = React.useState<SurahMeta[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [attempt, setAttempt] = React.useState(0);

  React.useEffect(() => {
    void changeReciter(reciter.id);
  }, [changeReciter, reciter.id]);

  React.useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    fetchSurahList(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setSurahs(result);
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
  }, [attempt]);

  const playSurah = React.useCallback((surahNumber: number) => {
    const audioUrl = `${reciter.fullSurahAudioBaseUrl}${String(surahNumber).padStart(3, '0')}.mp3`;
    if (playFullSurah(surahNumber, audioUrl, reciter.id)) {
      setPlayerRoute(`/quran/reciters/${reciter.id}`);
      setMainPlayerOpen(true);
    }
  }, [playFullSurah, reciter, setMainPlayerOpen, setPlayerRoute]);

  return (
    <PageLayout>
      <QuranListeningPlayer
        open={mainPlayerOpen}
        onClose={() => setMainPlayerOpen(false)}
        surahs={surahs}
        reciter={reciter}
        player={player}
        playSurah={playSurah}
        fullSurahMode
      />
      <PageHeader
        title={`استمع إلى ${reciter.name}`}
        subtitle={reciter.englishName}
        icon={<Headphones className="h-8 w-8 text-accent" />}
      />

      <section className="container mx-auto px-4 py-8 lg:px-8 lg:py-12">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-kufi text-xl font-bold text-foreground">اختر السورة</h2>
            <p className="mt-1 text-sm text-muted-foreground">تُشغّل كل سورة كتلاوة كاملة.</p>
          </div>
          <Link
            href="/quran"
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border/70 px-4 text-sm text-muted-foreground transition-colors hover:border-accent/50 hover:text-primary"
          >
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
            قائمة القراء
          </Link>
        </div>

        {loading && (
          <div role="status" className="flex justify-center py-16 text-primary">
            <Loader2 className="h-8 w-8 animate-spin" aria-label="جارٍ تحميل السور" />
          </div>
        )}

        {error && !loading && (
          <div role="alert" className="rounded-2xl border border-destructive/30 bg-card p-8 text-center">
            <p className="text-muted-foreground">{error}</p>
            <Button className="mt-4" variant="outline" onClick={() => setAttempt((value) => value + 1)}>
              <RotateCcw className="ml-2 h-4 w-4" aria-hidden="true" />
              إعادة المحاولة
            </Button>
          </div>
        )}

        {!loading && !error && (
          <div className="quran-surah-grid">
            {surahs.map((surah) => (
              <button
                key={surah.number}
                type="button"
                className={`quran-surah-option${mainPlayerOpen && player.currentSurahNumber === surah.number ? ' is-current' : ''}`}
                onClick={() => playSurah(surah.number)}
              >
                <span className="quran-surah-option__number">{surah.number}</span>
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

        <Link href="/quran/read" className="quran-reading-link">
          <BookOpen aria-hidden="true" />
          الانتقال إلى المصحف للقراءة
        </Link>
      </section>
    </PageLayout>
  );
}
