import Link from 'next/link';
import { ArrowLeft, BookOpen, Headphones, UserRound } from 'lucide-react';
import { PageHeader, PageLayout } from '@/components/page-layout';
import { QURAN_RECITERS } from '@/lib/quran-api';

function ReciterCard({ reciter }: { reciter: (typeof QURAN_RECITERS)[number] }) {
  return (
    <article className="quran-reciter-card">
      <Link
        href={`/quran/reciters/${reciter.id}`}
        className="quran-reciter-card__main group"
        aria-label={`استمع إلى تلاوات ${reciter.name}`}
      >
        <div className="quran-reciter-card__portrait">
          {reciter.portraitUrl && (
            <img
              src={reciter.portraitUrl}
              alt=""
              loading="lazy"
            />
          )}
          <span
            className="quran-reciter-card__portrait-fallback"
          >
            <UserRound aria-hidden="true" />
          </span>
          <span className="quran-reciter-card__play" aria-hidden="true">
            <Headphones />
          </span>
        </div>
        <div className="quran-reciter-card__info">
          <h2>{reciter.name}</h2>
          <p>{reciter.englishName}</p>
          <span>استمع للتلاوات <ArrowLeft aria-hidden="true" /></span>
        </div>
      </Link>
      {reciter.portraitSourceUrl && (
        <a
          className="quran-reciter-card__credit"
          href={reciter.portraitSourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          الصورة: {reciter.portraitAttribution} · {reciter.portraitLicense}
        </a>
      )}
    </article>
  );
}

export default function QuranListeningHomePage() {
  return (
    <PageLayout>
      <PageHeader
        title="استمع"
        subtitle="اختر قارئك، ثم اختر السورة لتبدأ التلاوة كاملة."
        icon={<Headphones className="h-8 w-8 text-accent" />}
      />

      <section className="container mx-auto px-4 py-8 lg:px-8 lg:py-12" aria-label="قائمة القراء">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-kufi text-xl font-bold text-foreground">القراء</h2>
          <Link
            href="/quran/read"
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border/70 px-4 text-sm text-muted-foreground transition-colors hover:border-accent/50 hover:text-primary"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            المصحف للقراءة
          </Link>
        </div>

        <div className="quran-reciter-grid">
          {QURAN_RECITERS.map((reciter) => (
            <ReciterCard key={reciter.id} reciter={reciter} />
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
