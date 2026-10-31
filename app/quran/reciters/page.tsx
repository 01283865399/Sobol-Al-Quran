'use client';

import * as React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, BookOpen, Headphones, ListMusic, Search, UserRound } from 'lucide-react';
import { PageHeader, PageLayout } from '@/components/page-layout';
import { Input } from '@/components/ui/input';
import { QURAN_RECITERS } from '@/lib/quran-api';

const filters = [
  { id: 'all', label: 'كل القراء' },
  { id: 'featured', label: 'أشهر القراء' },
  { id: 'haramain', label: 'أئمة الحرمين' },
  { id: 'murattal', label: 'الترتيل' },
  { id: 'mujawwad', label: 'التجويد' },
] as const;

const featuredIds = new Set([
  'ar.yasseraldossari',
  'ar.nasseralqatami',
  'ar.ahmadnufais',
  'ar.abdulrahman-massaad',
]);

const haramainIds = new Set([
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

function normalize(value: string) {
  return value
    .toLocaleLowerCase('ar')
    .normalize('NFD')
    .replace(/[\u064b-\u065f\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه');
}

function ReciterDirectoryCard({
  reciter,
  isHaramain,
}: {
  reciter: (typeof QURAN_RECITERS)[number];
  isHaramain: boolean;
}) {
  const [imageFailed, setImageFailed] = React.useState(false);

  return (
    <article className="reciter-directory-card">
      <Link
        to={`/quran/reciters/${reciter.id}${isHaramain ? '?ambience=haramain' : ''}`}
        className="reciter-directory-card__link"
        aria-label={`استمع إلى تلاوات ${reciter.name}`}
      >
        <div className="reciter-directory-card__portrait">
          {reciter.portraitUrl && !imageFailed ? (
            <img
              src={reciter.portraitUrl}
              alt=""
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <UserRound aria-hidden="true" />
          )}
          <span className="reciter-directory-card__play" aria-hidden="true">
            <Headphones />
          </span>
        </div>
        <div className="reciter-directory-card__info">
          <div className="reciter-directory-card__title">
            <h2>{reciter.name}</h2>
            {reciter.honorTier === 'gold' && <span>قارئ مميز</span>}
          </div>
          <p>{reciter.englishName}</p>
          <div className="reciter-directory-card__meta">
            <span>{reciter.recitationCategory === 'mujawwad' ? 'التجويد' : 'الترتيل'}</span>
            {reciter.country === 'Egypt' && <span>مصر</span>}
            {isHaramain && <span>أئمة الحرمين</span>}
          </div>
        </div>
      </Link>
    </article>
  );
}

export default function RecitersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = React.useState('');
  const requestedFilter = searchParams.get('category') ?? 'all';
  const selectedFilter = filters.some((filter) => filter.id === requestedFilter)
    ? requestedFilter
    : 'all';

  const filteredReciters = QURAN_RECITERS.filter((reciter) => {
    const matchesFilter = selectedFilter === 'all'
      || (selectedFilter === 'featured' && featuredIds.has(reciter.id))
      || (selectedFilter === 'haramain' && haramainIds.has(reciter.id))
      || reciter.recitationCategory === selectedFilter;
    const query = normalize(search.trim());
    const matchesSearch = !query
      || normalize(`${reciter.name} ${reciter.englishName}`).includes(query);
    return matchesFilter && matchesSearch;
  });

  const setFilter = (filter: string) => {
    const next = new URLSearchParams(searchParams);
    if (filter === 'all') next.delete('category');
    else next.set('category', filter);
    setSearchParams(next, { replace: true });
  };

  return (
    <PageLayout showHomeLink={false}>
      <PageHeader
        title="قراء القرآن الكريم"
        subtitle="اختر قارئك المفضل واستمع إلى تلاوات السور كاملة."
        icon={<Headphones className="h-8 w-8 text-accent" />}
        compact
      />

      <section className="reciter-directory" aria-label="استكشاف القراء">
        <div className="reciter-directory__toolbar">
          <Link to="/quran" className="reciter-directory__back">
            <ArrowRight aria-hidden="true" />
            العودة إلى الاستماع
          </Link>
          <Link to="/quran/read" className="reciter-directory__quran">
            <BookOpen aria-hidden="true" />
            المصحف للقراءة
          </Link>
          <Link to="/quran/playlists" className="reciter-directory__quran">
            <ListMusic aria-hidden="true" />
            قوائم التشغيل
          </Link>
        </div>

        <div className="reciter-directory__filters">
          <div className="reciter-directory__tabs" role="group" aria-label="تصفية القراء">
            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                aria-pressed={selectedFilter === filter.id}
                onClick={() => setFilter(filter.id)}
              >
                {filter.label}
                {filter.id === 'all' && <span>{QURAN_RECITERS.length}</span>}
              </button>
            ))}
          </div>
          <label className="reciter-directory__search">
            <Search aria-hidden="true" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ابحث باسم القارئ..."
              aria-label="ابحث باسم القارئ"
            />
          </label>
        </div>

        <div className="reciter-directory__results">
          <div className="reciter-directory__results-heading">
            <h2>{filters.find((filter) => filter.id === selectedFilter)?.label}</h2>
            <span>{filteredReciters.length} قارئًا</span>
          </div>
          {filteredReciters.length > 0 ? (
            <div className="reciter-directory__grid">
              {filteredReciters.map((reciter) => (
                <ReciterDirectoryCard
                  key={reciter.id}
                  reciter={reciter}
                  isHaramain={haramainIds.has(reciter.id)}
                />
              ))}
            </div>
          ) : (
            <p className="reciter-directory__empty">لا يوجد قارئ بهذا الاسم.</p>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
