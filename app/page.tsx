'use client';

import Link from 'next/link';
import * as React from 'react';
import { ArrowLeft, BookOpen, Headphones, MessageSquareText, Star, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/sections/footer';

const highlightTiles = [
  { title: 'القرآن الكريم', description: 'تصفح المصحف، البحث، ومقاطع التلاوة', href: '/quran', icon: BookOpen },
  { title: 'المساعد الإسلامي', description: 'أسئلة موثقة ومشاركات من مصادر معتمدة', href: '/chat', icon: MessageSquareText },
  { title: 'إذاعة القرآن', description: 'تلاوات مباشرة من محطات موثوقة', href: '/radio', icon: Headphones },
];

export default function Home() {
  const [heroTilt, setHeroTilt] = React.useState({ x: 0, y: 0 });
  const [tiles, setTiles] = React.useState<Record<string, { x: number; y: number }>>({});

  const handleHeroMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * -16;
    setHeroTilt({ x, y });
  };

  const handleTileMove = (id: string, event: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * -12;
    setTiles((prev) => ({ ...prev, [id]: { x, y } }));
  };

  const resetTile = (id: string) => setTiles((prev) => ({ ...prev, [id]: { x: 0, y: 0 } }));

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 pb-20 lg:px-8">
        <section className="hero home-hero pt-10 lg:pt-16">
          <div className="home-hero__content">
            <div className="home-hero__eyebrow">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span>رفيقك للقرآن والعلم والطمأنينة</span>
            </div>
            <div className="bsm">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</div>
            <h1 className="font-kufi text-gold-gradient">نور</h1>
            <p className="home-hero__description mt-4 max-w-xl text-lg leading-8 text-muted-foreground">
              منصة إسلامية عربية تجمع بين القرآن، الحديث، والمساعد الإسلامي في تجربة هادئة ومريحة.
            </p>
            <div className="cta">
              <Link href="/quran" className="btn fill">
                استكشف المصحف
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <Link href="/chat" className="btn">
                اسأل المساعد
              </Link>
            </div>
            <div className="home-hero__highlights" aria-label="مميزات المنصة">
              <span><BookOpen aria-hidden="true" /> 114 سورة</span>
              <span><Headphones aria-hidden="true" /> تلاوات وإذاعة</span>
              <span><MessageSquareText aria-hidden="true" /> مساعد إسلامي</span>
            </div>
          </div>

          <div
            aria-label="لوحة تجسيد تصميم نور"
            className="arch"
            onMouseMove={handleHeroMove}
            onMouseLeave={() => setHeroTilt({ x: 0, y: 0 })}
            style={{
              transform: `perspective(1200px) rotateX(${heroTilt.y}deg) rotateY(${heroTilt.x}deg) translateY(${Math.abs(heroTilt.y) * 0.25}px)`,
            }}
          >
            <svg className="rosette" viewBox="0 0 200 200" aria-hidden="true">
              <g transform="translate(100 100)" fill="none" stroke="currentColor" strokeWidth="1.35">
                <circle className="l1" r="75" />
                <circle className="l2" r="58" />
                <circle className="d" r="42" strokeDasharray="7 18" />
                <circle className="d" r="24" strokeDasharray="5 16" />
                <g strokeWidth="1.1">
                  <path d="M0 -82 L0 -62 M0 62 L0 82 M-82 0 L-62 0 M62 0 L82 0 M-58 -58 L-45 -45 M45 -45 L58 -58 M-58 58 L-45 45 M45 45 L58 58" />
                </g>
              </g>
            </svg>
            <q>وَفِي ذَٰلِكَ لَذِكْرَىٰ لِأُولِي الْأَلْبَابِ</q>
            <small>رحلة تجمع بين التلاوة والعلم والطمأنينة</small>
          </div>
        </section>

        <section className="pt-10 lg:pt-14">
          <div className="ph">
            <h2>مراكز الموقع</h2>
            <p className="lead">نحو تجربة إسلامية متكاملة، تجمع بين القراءة، الاستماع، والطمأنينة اليومية.</p>
          </div>

          <div className="tiles">
            {highlightTiles.map(({ title, description, href, icon: Icon }) => {
              const tilt = tiles[href] ?? { x: 0, y: 0 };
              return (
                <Link
                  key={href}
                  href={href}
                  className="group tilt-card"
                  onMouseMove={(event) => handleTileMove(href, event)}
                  onMouseLeave={() => resetTile(href)}
                  style={{
                    transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateY(0)`,
                    boxShadow: `0 ${Math.abs(tilt.y) * 2}px ${Math.abs(tilt.x) * 3 + 18}px rgba(221, 183, 104, 0.12)`,
                  }}
                >
                  <div className="niche"><Icon className="h-5 w-5" /></div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="pt-12 lg:pt-16">
          <div className="glass-gold rounded-[30px] p-6 lg:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gold">Daily light</p>
                <h3 className="mt-2 text-2xl font-black text-gold-gradient">آية اليوم</h3>
              </div>
              <Star className="h-6 w-6 text-gold" />
            </div>
            <p className="font-quran text-3xl leading-[2.2] text-foreground lg:text-4xl">
              وَقُلْ رَبِّ زِدْنِي عِلْمًا
            </p>
            <p className="mt-4 text-sm text-muted-foreground">طه — الآية 114</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
