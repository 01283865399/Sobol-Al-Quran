import {
  ArrowLeft,
  BookOpen,
  Headphones,
  MessageCircle,
  Radio,
  ScrollText,
  Sparkles,
  CircleDot,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Footer } from '@/components/sections/footer';
import { Navbar } from '@/components/navbar';

const sitePaths = [
  {
    title: 'القرآن الكريم',
    description: 'استمع إلى تلاوات نخبة من القراء واختر السورة التي تحب.',
    href: '/quran',
    icon: Headphones,
    label: 'استمع للتلاوات',
    number: '١',
  },
  {
    title: 'المصحف للقراءة',
    description: 'تصفّح سور القرآن واقرأ الآيات في مساحة هادئة وواضحة.',
    href: '/quran/read',
    icon: BookOpen,
    label: 'افتح المصحف',
    number: '٢',
  },
  {
    title: 'إذاعة القرآن',
    description: 'استمع إلى محطات قرآنية مباشرة وتلاوات متواصلة.',
    href: '/radio',
    icon: Radio,
    label: 'تصفّح الإذاعات',
    number: '٣',
  },
  {
    title: 'الحديث الشريف',
    description: 'ابحث في الأحاديث المتاحة حسب الكتاب أو الكلمات.',
    href: '/hadith',
    icon: ScrollText,
    label: 'اقرأ الأحاديث',
    number: '٤',
  },
  {
    title: 'المساعد الإسلامي',
    description: 'اطرح سؤالك واستكشف إجابات تعليمية مع مصادرها.',
    href: '/chat',
    icon: MessageCircle,
    label: 'اسأل المساعد',
    number: '٥',
  },
  {
    title: 'السبحة الإلكترونية',
    description: 'تابع أذكارك وعدّادك اليومي ببساطة.',
    href: '/tasbih',
    icon: CircleDot,
    label: 'ابدأ التسبيح',
    number: '٦',
  },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="home-page">
        <section className="home-hero" aria-labelledby="home-title">
          <div className="home-hero__copy">
            <span className="home-hero__eyebrow">
              <Sparkles aria-hidden="true" />
              رفيقك للقرآن والعلم والطمأنينة
            </span>
            <p className="home-hero__basmala">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
            <h1 id="home-title">طريقك إلى <span>نور</span></h1>
            <p className="home-hero__description">
              مساحة عربية تجمع القرآن الكريم والحديث والإذاعة والمساعد الإسلامي،
              لتكون قريبة منك أينما كنت.
            </p>
            <div className="home-hero__actions">
              <Link to="/quran" className="home-action home-action--primary">
                ابدأ الاستماع
                <ArrowLeft aria-hidden="true" />
              </Link>
              <Link to="/quran/read" className="home-action home-action--secondary">
                <BookOpen aria-hidden="true" />
                اقرأ القرآن
              </Link>
            </div>
            <div className="home-hero__facts" aria-label="معلومات عن الموقع">
              <span><strong>١١٤</strong> سورة</span>
              <i aria-hidden="true" />
              <span>تلاوات وإذاعات مباشرة</span>
              <i aria-hidden="true" />
              <span>تجربة عربية متكاملة</span>
            </div>
          </div>

          <aside className="home-hero__art" aria-label="آية قرآنية">
            <div className="home-hero__ornament" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className="home-hero__art-label">
              <span className="home-hero__art-dot" />
              آية تضيء يومك
            </div>
            <blockquote>
              <p>وَقُل رَّبِّ زِدْنِي عِلْمًا</p>
              <cite>سورة طه · ١١٤</cite>
            </blockquote>
            <div className="home-hero__art-footer">
              <span>تلاوة</span>
              <span>تدبّر</span>
              <span>طمأنينة</span>
            </div>
          </aside>
          <div className="home-hero__glow" aria-hidden="true" />
        </section>

        <section className="home-paths" aria-labelledby="home-paths-title">
          <div className="home-section-heading">
            <div>
              <p>اكتشف سُبُل</p>
              <h2 id="home-paths-title">كل ما تحتاجه في مكان واحد</h2>
            </div>
            <span>اختر وجهتك وابدأ</span>
          </div>
          <div className="home-path-grid">
            {sitePaths.map(({ title, description, href, icon: Icon, label, number }) => (
              <Link className="home-path-card" key={href} to={href}>
                <span className="home-path-card__number">{number}</span>
                <span className="home-path-card__icon"><Icon aria-hidden="true" /></span>
                <span className="home-path-card__title">{title}</span>
                <span className="home-path-card__description">{description}</span>
                <span className="home-path-card__link">
                  {label}
                  <ArrowLeft aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="home-verse" aria-label="آية اليوم">
          <span className="home-verse__icon"><BookOpen aria-hidden="true" /></span>
          <div>
            <p className="home-verse__eyebrow">زاد يومك</p>
            <blockquote>«أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ»</blockquote>
            <cite>سورة الرعد · ٢٨</cite>
          </div>
          <Link to="/quran/read" aria-label="اقرأ القرآن الكريم">
            اقرأ وتدبّر
            <ArrowLeft aria-hidden="true" />
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
