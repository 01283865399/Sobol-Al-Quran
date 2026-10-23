import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Headphones, UserRound } from 'lucide-react';
import { PageHeader, PageLayout } from '@/components/page-layout';
import { QURAN_RECITERS } from '@/lib/quran-api';

function ReciterCard({ reciter }: { reciter: (typeof QURAN_RECITERS)[number] }) {
  return (
    <article className="quran-reciter-card">
      <Link
        to={`/quran/reciters/${reciter.id}`}
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
          <small className="quran-reciter-card__style">
            {reciter.recitationCategory === 'mujawwad' ? 'التجويد' : 'الترتيل'}
          </small>
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
          {reciter.portraitLicense
            ? `الصورة: ${reciter.portraitAttribution} · ${reciter.portraitLicense}`
            : `مصدر الصورة: ${reciter.portraitAttribution}`}
        </a>
      )}
      {reciter.recordingsSourceUrl && (
        <a
          className="quran-reciter-card__credit"
          href={reciter.recordingsSourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          مصدر التلاوات: Internet Archive
        </a>
      )}
    </article>
  );
}

export default function QuranListeningHomePage() {
  const murattalReciters = QURAN_RECITERS.filter(
    (reciter) => reciter.recitationCategory === 'murattal'
  );
  const mujawwadReciters = QURAN_RECITERS.filter(
    (reciter) => reciter.recitationCategory === 'mujawwad'
  );

  return (
    <PageLayout showHomeLink={false}>
      <PageHeader
        title="استمع"
        subtitle="اختر قارئك، ثم اختر السورة لتبدأ التلاوة كاملة."
        icon={<Headphones className="h-8 w-8 text-accent" />}
      />

      <section className="w-full px-4 py-8 lg:px-8 lg:py-12" aria-label="قائمة القراء">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-kufi text-xl font-bold text-foreground">
            جميع القراء ({QURAN_RECITERS.length})
          </h2>
          <Link
            to="/quran/read"
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border/70 px-4 text-sm text-muted-foreground transition-colors hover:border-accent/50 hover:text-primary"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            المصحف للقراءة
          </Link>
        </div>

        <div className="quran-reciter-categories">
          <section aria-labelledby="murattal-reciter-heading">
            <h3 className="mb-4 font-kufi text-lg font-bold text-foreground">
              <span id="murattal-reciter-heading">الترتيل</span>
              <span className="quran-reciter-section-count">{murattalReciters.length} قارئًا</span>
            </h3>
            <div className="quran-reciter-grid">
              {murattalReciters.map((reciter) => (
                <ReciterCard key={reciter.id} reciter={reciter} />
              ))}
            </div>
          </section>

          {mujawwadReciters.length > 0 && (
            <section aria-labelledby="mujawwad-reciter-heading">
              <h3 className="mb-4 font-kufi text-lg font-bold text-foreground">
                <span id="mujawwad-reciter-heading">التجويد</span>
                <span className="quran-reciter-section-count">{mujawwadReciters.length} قراء</span>
              </h3>
              <div className="quran-reciter-grid">
                {mujawwadReciters.map((reciter) => (
                  <ReciterCard key={reciter.id} reciter={reciter} />
                ))}
              </div>
            </section>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
