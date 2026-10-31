import { ArrowRight, ExternalLink, GraduationCap, MessageCircle, Send, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/page-layout';

const projects = [
  {
    title: 'حريف إنجليش',
    description: 'منصة تعليم اللغة الإنجليزية لكل المراحل مع مستر محمود عبد الواحد.',
    url: 'https://hareef-english.vercel.app/',
    image: 'https://hareef-english.vercel.app/logo-horizontal-light.png',
    accent: 'purple',
  },
  {
    title: 'منصة العرّاب',
    description: 'منصة تعليم اللغة العربية مع دروس منظمة وتدريبات ومتابعة مستمرة.',
    url: 'https://el-arrab-edu-eji8.vercel.app/',
    image: 'https://el-arrab-edu-eji8.vercel.app/brand-icon.png',
    accent: 'sand',
  },
  {
    title: 'زين والمهندس ستور',
    description: 'متجر إلكتروني للأجهزة والهواتف وقطع الغيار والذهب بالتقسيط.',
    url: 'https://zain-store1.vercel.app/',
    image: 'https://zain-store1.vercel.app/og-image.png',
    accent: 'teal',
  },
  {
    title: 'DeepLearn',
    description: 'منصة أحمد ديب لتعلم البرمجة والذكاء الاصطناعي بطريقة تفاعلية.',
    url: 'https://deeb-learn.vercel.app/',
    image: 'https://deeb-learn.vercel.app/assets/protofil.jpeg',
    accent: 'blue',
  },
  {
    title: 'السيرة الذاتية',
    description: 'الموقع الشخصي والسيرة الذاتية ومجالات الخبرة والمشاريع.',
    url: 'https://mycv-red.vercel.app/',
    image: '/images/developer-ahmed.jpg',
    accent: 'dark',
  },
];

export default function DeveloperPage() {
  return (
    <PageLayout>
      <main className="developer-page" dir="rtl">
        <Link to="/" className="developer-back-link">
          <ArrowRight aria-hidden="true" />
          العودة إلى الرئيسية
        </Link>

        <section className="developer-card" aria-labelledby="developer-title">
          <div className="developer-card__content">
            <span className="developer-kicker">
              <Sparkles aria-hidden="true" />
              صانع تجربة سُبُل
            </span>
            <h1 id="developer-title">المهندس أحمد ديب</h1>
            <p className="developer-role">طالب بكلية الذكاء الاصطناعي وعلوم الحاسب</p>
            <p className="developer-bio">
              أعمل على بناء تجارب رقمية عربية تجمع بين التقنية والمعرفة، وأسعى لتقديم
              منتجات بسيطة، سريعة، وقريبة من احتياجات المستخدم.
            </p>

            <div className="developer-contact">
              <a href="https://wa.me/201283865399" target="_blank" rel="noreferrer">
                <MessageCircle aria-hidden="true" />
                واتساب
              </a>
              <a href="https://t.me/01283865399" target="_blank" rel="noreferrer">
                <Send aria-hidden="true" />
                تليجرام
              </a>
              <a href="tel:+201283865399">
                <span aria-hidden="true">☎</span>
                01283865399
              </a>
            </div>
          </div>
          <div className="developer-card__portrait">
            <img src="/images/developer-ahmed.jpg" alt="المهندس أحمد ديب" />
            <span><GraduationCap aria-hidden="true" /> AI &amp; Computer Science</span>
          </div>
        </section>

        <section className="developer-projects" aria-labelledby="projects-title">
          <div className="developer-section-heading">
            <div>
              <span className="developer-kicker"><Sparkles aria-hidden="true" /> أعمال ومشاريع</span>
              <h2 id="projects-title">مشاريع صنعتها</h2>
            </div>
            <span>اضغط لاستكشاف أي مشروع</span>
          </div>
          <div className="developer-project-grid">
            {projects.map((project) => (
              <a
                className={`developer-project developer-project--${project.accent}`}
                href={project.url}
                target="_blank"
                rel="noreferrer"
                key={project.url}
              >
                <div className="developer-project__image">
                  <img src={project.image} alt="" loading="lazy" />
                </div>
                <div className="developer-project__body">
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <span>زيارة المشروع <ExternalLink aria-hidden="true" /></span>
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>
    </PageLayout>
  );
}
