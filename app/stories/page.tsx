import { BookOpen, Sparkles } from 'lucide-react';
import { PageLayout } from '@/components/page-layout';

export default function StoriesPage() {
  return (
    <PageLayout>
      <main className="stories-page" dir="rtl">
        <section className="stories-intro" aria-labelledby="stories-title">
          <div>
            <span className="stories-kicker"><Sparkles aria-hidden="true" /> قصص وعِبر</span>
            <h1 id="stories-title">محتوى قصص وعِبر قريبًا</h1>
            <p>
              نعمل على إعداد مكتبة موثوقة من القصص الإسلامية والرسوم الكرتونية المناسبة
              للعائلة، مع التأكد من جودة الصوت وحقوق العرض قبل نشرها.
            </p>
          </div>
          <div className="stories-intro__mark" aria-hidden="true"><BookOpen /></div>
        </section>

        <section className="stories-coming-soon" aria-label="حالة القسم">
          <BookOpen aria-hidden="true" />
          <h2>القسم مؤرشف مؤقتًا</h2>
          <p>سيعود بمحتوى أفضل وأوثق قريبًا.</p>
        </section>
      </main>
    </PageLayout>
  );
}
