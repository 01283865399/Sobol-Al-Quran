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
              <h2 className="font-kufi text-xl font-bold text-primary mb-3">البث الإذاعي</h2>
              <p>
                تعرض صفحة إذاعة القرآن الكريم قائمة محطات من MP3Quran، وعند تشغيل محطة يتصل متصفحك مباشرةً بخادم البث الخارجي. قد يسجل المزوّد عنوان IP وبيانات الاتصال وفقًا لسياساته؛ ولا يخزن موقع سُبُل التسجيلات الصوتية.
              </p>
            </section>
            <section>
              <h2 className="font-kufi text-xl font-bold text-primary mb-3">حماية البيانات</h2>
              <p>نتخذ إجراءات أمنية مناسبة لحماية بياناتك من الوصول غير المصرح به، باستخدام تشفير SSL ونسخ احتياطي يومي.</p>
            </section>
            <section>
              <h2 className="font-kufi text-xl font-bold text-primary mb-3">المساعد الذكي</h2>
              <p>
                عند استخدام المساعد الإسلامي، تُرسل الرسائل وسياق المحادثة المحدود إلى Google Gemini لتوليد الرد. لا يحفظ موقع سُبُل المحادثة على الخادم أو في التخزين المحلي للمتصفح، ويطلب من واجهة Gemini عدم تخزين التفاعل؛ وتظل معالجة Google للبيانات خاضعة لشروطها وسياسة حساب المطور، وقد تختلف بحسب فئة الاستخدام. لا تُدخل بيانات شخصية أو حساسة.
              </p>
              <p className="mt-2">
                عند السؤال عن آية، قد يُرسل مصطلح بحث محدود إلى AlQuran.cloud لاسترجاع النص والمرجع. وعند طلب توثيق حديث بمرجع محدد، قد يُرسل اسم المجموعة ورقم الحديث إلى Sunnah.com إذا أُعد مفتاح الخدمة الاختياري على الخادم. لا تُرسل مفاتيح API إلى المتصفح.
              </p>
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
