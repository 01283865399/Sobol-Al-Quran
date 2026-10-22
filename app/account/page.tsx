'use client';

import * as React from 'react';
import { PageHeader, PageLayout } from '@/components/page-layout';
import { Button } from '@/components/ui/button';
import { UserCircle2, ShieldCheck, Bookmark, History, Sparkles } from 'lucide-react';

export default function AccountPage() {
  const [guestName, setGuestName] = React.useState('زائر');

  return (
    <PageLayout>
      <PageHeader
        title="حسابي"
        subtitle="لوحة شخصية للزائر مع حفظ محلي للمفضلات ومراجعة آخر النشاط"
        icon={<UserCircle2 className="h-8 w-8 text-accent" />}
      />

      <div className="container mx-auto px-4 py-10 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                <UserCircle2 className="h-10 w-10" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">مرحبًا</p>
                <h3 className="font-kufi text-3xl text-primary">{guestName}</h3>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="mb-2 flex items-center gap-2 text-primary"><Bookmark className="h-4 w-4" /> المفضلات</div>
                <p className="text-sm text-muted-foreground">تم حفظ السور والمواضيع المميزة محليًا داخل المتصفح.</p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="mb-2 flex items-center gap-2 text-primary"><History className="h-4 w-4" /> آخر النشاط</div>
                <p className="text-sm text-muted-foreground">سيتم عرضه هنا عند استخدام المتصفح للمحتوى المفضل.</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2 text-primary"><ShieldCheck className="h-5 w-5" /> الخصوصية</div>
            <p className="text-sm leading-7 text-muted-foreground">
              لا توجد مصادقة حقيقية مفعلة في المشروع حاليًا. هذه الصفحة هي تجربة ضيف موثوقة وتوضح ما يمكن حفظه محليًا دون ادعاء وجود حسابات مستخدمين أو خوادم آمنة.
            </p>
            <div className="mt-6 flex items-center gap-2 rounded-2xl border border-gold/30 bg-gold/5 p-3 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-gold" />
              تجربة ضيف آمنة وشفافة
            </div>
            <Button className="mt-6" onClick={() => setGuestName('زائر جديد')}>تحديث الاسم</Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
