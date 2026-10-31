import { Link } from 'react-router-dom';
import { ArrowLeft, Headphones, ListMusic, UserRound } from 'lucide-react';
import { PageHeader, PageLayout } from '@/components/page-layout';
import { QURAN_RECITERS } from '@/lib/quran-api';

function ReciterCategorySection({
  id,
  title,
  reciters,
  ambienceProfile,
  directoryCategory,
}: {
  id: string;
  title: string;
  reciters: (typeof QURAN_RECITERS)[number][];
  ambienceProfile?: 'haramain';
  directoryCategory: string;
}) {
  const visibleReciters = reciters.slice(0, 6);

  return (
    <section aria-labelledby={id} className="quran-reciter-category">
      <div className="quran-reciter-category__heading">
        <div>
          <h3 id={id}>{title}</h3>
          <span className="quran-reciter-section-count">
            {visibleReciters.length} من {reciters.length} قارئًا
          </span>
        </div>
        <Link
          to={`/quran/reciters?category=${directoryCategory}`}
          className="quran-reciter-category__toggle"
        >
          عرض الكل
          <ArrowLeft aria-hidden="true" />
        </Link>
      </div>
      <div
        className="quran-reciter-row"
        dir="rtl"
        role="list"
      >
        {visibleReciters.map((reciter) => (
          <ReciterCard
            key={reciter.id}
            reciter={reciter}
            ambienceProfile={ambienceProfile}
          />
        ))}
      </div>
    </section>
  );
}

function ReciterCard({
  reciter,
  ambienceProfile,
}: {
  reciter: (typeof QURAN_RECITERS)[number];
  ambienceProfile?: 'haramain';
}) {
  const honorTier = reciter.honorTier ?? 'bronze';
  const honorLabel = honorTier === 'gold' ? 'من كبار القراء' : 'قارئ مميز';

  return (
    <article
      className={`quran-reciter-card quran-reciter-card--${honorTier}`}
      role="listitem"
    >
      <Link
        to={`/quran/reciters/${reciter.id}${ambienceProfile ? '?ambience=haramain' : ''}`}
        className="quran-reciter-card__main group"
        aria-label={`استمع إلى تلاوات ${reciter.name}، ${honorLabel}`}
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
        </div>
      </Link>
    </article>
  );
}

export default function QuranListeningHomePage() {
  const featuredReciterIds = [
    'ar.yasseraldossari',
    'ar.nasseralqatami',
    'ar.ahmadnufais',
    'ar.abdulrahman-massaad',
  ];
  const featuredReciters = featuredReciterIds
    .map((id) => QURAN_RECITERS.find((reciter) => reciter.id === id))
    .filter((reciter): reciter is (typeof QURAN_RECITERS)[number] => Boolean(reciter));
  const featuredIdSet = new Set(featuredReciters.map((reciter) => reciter.id));
  const haramainImamIds = new Set([
    'ar.abdurrahmaansudais',
    'ar.hudhaify',
    'ar.saud-shuraim',
    'ar.salah-budair',
    'ar.abdullah-juhani',
    'ar.khalid-ghamdi',
    'ar.abdulbari-thubaiti',
    'ar.abdulmohsen-qasim',
    'ar.ali-jaber',
    'ar.mahermuaiqly',
    'ar.yasseraldossari',
  ]);
  const usedReciterIds = new Set(featuredIdSet);
  const haramainImams = QURAN_RECITERS.filter(
    (reciter) => haramainImamIds.has(reciter.id) && !usedReciterIds.has(reciter.id)
  );
  haramainImams.slice(0, 6).forEach((reciter) => usedReciterIds.add(reciter.id));
  const murattalReciters = QURAN_RECITERS.filter(
    (reciter) =>
      reciter.recitationCategory === 'murattal' &&
      !usedReciterIds.has(reciter.id)
  );
  murattalReciters.slice(0, 6).forEach((reciter) => usedReciterIds.add(reciter.id));
  const mujawwadReciters = QURAN_RECITERS.filter(
    (reciter) =>
      reciter.recitationCategory === 'mujawwad' &&
      !usedReciterIds.has(reciter.id)
  );
  const creditedReciters = QURAN_RECITERS.filter(
    (reciter) => reciter.portraitSourceUrl || reciter.recordingsSourceUrl
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
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-kufi text-xl font-bold text-foreground">
              استكشف القراء
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/quran/reciters"
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-primary/25 bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <UserRound className="h-4 w-4" aria-hidden="true" />
                جميع القراء ({QURAN_RECITERS.length})
              </Link>
              <Link
                to="/quran/playlists"
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border/70 px-4 text-sm text-muted-foreground transition-colors hover:border-accent/50 hover:text-primary"
              >
                <ListMusic className="h-4 w-4" aria-hidden="true" />
                قوائم التشغيل
              </Link>
            </div>
          </div>
        </div>

        <div className="quran-listening-home">
          <ReciterCategorySection
            id="featured-reciter-heading"
            title="أشهر القراء"
            reciters={featuredReciters}
            directoryCategory="featured"
          />
          <ReciterCategorySection
            id="haramain-imam-heading"
            title="أئمة الحرمين"
            reciters={haramainImams}
            ambienceProfile="haramain"
            directoryCategory="haramain"
          />
          <ReciterCategorySection
            id="murattal-reciter-heading"
            title="قراء الترتيل"
            reciters={murattalReciters}
            directoryCategory="murattal"
          />
          {mujawwadReciters.length > 0 && (
            <ReciterCategorySection
              id="mujawwad-reciter-heading"
              title="قراء التجويد"
              reciters={mujawwadReciters}
              directoryCategory="mujawwad"
            />
          )}
        </div>

        <details className="quran-reciter-credits">
          <summary>اعتمادات الصور والتلاوات</summary>
          <ul>
            {creditedReciters.map((reciter) => (
              <li key={reciter.id}>
                <strong>{reciter.name}</strong>
                {reciter.portraitSourceUrl && (
                  <span>
                    الصورة: {reciter.portraitAttribution}
                    {reciter.portraitLicense && ` · ${reciter.portraitLicense}`}
                    {' · '}
                    <a href={reciter.portraitSourceUrl} target="_blank" rel="noreferrer">
                      المصدر
                    </a>
                  </span>
                )}
                {reciter.recordingsSourceUrl && (
                  <span>
                    التلاوات:{' '}
                    <a href={reciter.recordingsSourceUrl} target="_blank" rel="noreferrer">
                      المصدر
                    </a>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </details>
      </section>
    </PageLayout>
  );
}
