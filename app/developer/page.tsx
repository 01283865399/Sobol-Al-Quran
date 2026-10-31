import { ArrowRight, GraduationCap, MessageCircle, Send, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/page-layout';

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
      </main>
    </PageLayout>
  );
}
