import { PageLayout, PageHeader } from '@/components/page-layout';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <PageLayout>
      <PageHeader
        title="الشروط والأحكام"
        subtitle="الشروط الخاصة باستخدام موقع سُبُل"
        icon={<FileText className="w-8 h-8 text-accent" />}
      />
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-2xl p-8 border border-border/50 space-y-6 font-cairo leading-relaxed text-muted-foreground">
            <section>
              <h2 className="font-kufi text-xl font-bold text-primary mb-3">استخدام الموقع</h2>
              <p>موقع سُبُل خدمة مجانية مخصصة لخدمة الأمة الإسلامية. يُمنع استخدام الموقع لأي أغراض غير مشروعة أو مخالفة للشريعة الإسلامية.</p>
            </section>
            <section>
              <h2 className="font-kufi text-xl font-bold text-primary mb-3">المحتوى</h2>
              <p>جميع المحتوى الديني في الموقع من مصادر موثوقة ومعتمدة. المحتوى الإداري (الصدقة الجارية، التعليقات) يخضع لمراجعة الإدارة قبل النشر.</p>
            </section>
            <section>
              <h2 className="font-kufi text-xl font-bold text-primary mb-3">المسؤولية</h2>
              <p>لا يتحمل موقع سُبُل أي مسؤولية عن أي ضرر ناتج عن استخدام الموقع أو الاعتماد على محتواه. يُنصح المستخدم بالرجوع لأهل العلم في المسائل الشرعية.</p>
            </section>
            <section>
              <h2 className="font-kufi text-xl font-bold text-primary mb-3">التعديلات</h2>
              <p>نحتفظ بحق تعديل هذه الشروط في أي وقت، وسيتم إعلام المستخدمين بأي تغييرات جوهرية.</p>
            </section>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
