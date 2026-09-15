import { PageLayout, PageHeader } from '@/components/page-layout';
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <PageLayout>
      <PageHeader
        title="سياسة الخصوصية"
        subtitle="نحن نحترم خصوصيتك ونحمي بياناتك"
        icon={<Shield className="w-8 h-8 text-accent" />}
      />
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="max-w-2xl mx-auto prose prose-sm dark:prose-invert">
          <div className="bg-card rounded-2xl p-8 border border-border/50 space-y-6 font-cairo leading-relaxed text-muted-foreground">
            <section>
              <h2 className="font-kufi text-xl font-bold text-primary mb-3">جمع البيانات</h2>
              <p>يجمع موقع سُبُل البيانات اللازمة فقط لتقديم خدماته، مثل الموقع الجغرافي لحساب مواقيت الصلاة واتجاه القبلة. لا نبيع بياناتك لأي طرف ثالث.</p>
            </section>
            <section>
              <h2 className="font-kufi text-xl font-bold text-primary mb-3">استخدام البيانات</h2>
              <p>تُستخدم بياناتك لتحسين تجربتك في الموقع، مثل حفظ مفضلتك وسجل قراءتك وإعدادات الإشعارات.</p>
            </section>
            <section>
              <h2 className="font-kufi text-xl font-bold text-primary mb-3">حماية البيانات</h2>
              <p>نتخذ إجراءات أمنية مناسبة لحماية بياناتك من الوصول غير المصرح به، باستخدام تشفير SSL ونسخ احتياطي يومي.</p>
            </section>
            <section>
              <h2 className="font-kufi text-xl font-bold text-primary mb-3">حقوقك</h2>
              <p>يمكنك في أي وقت تعديل أو حذف بياناتك الشخصية من خلال صفحة الحساب، أو التواصل معنا لطلب حذف حسابك بالكامل.</p>
            </section>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
