'use client';

import * as React from 'react';
import { PageLayout, PageHeader } from '@/components/page-layout';
import { Calculator, Coins, Scale, Compass, Calendar, Sparkles, BookOpen, FileQuestion } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const tools = [
  { id: 'zakat', title: 'حاسبة الزكاة', description: 'زكاة المال والذهب والفضة والأسهم والزروع', icon: Coins, href: '/tools/zakat', color: 'text-amber-600' },
  { id: 'inheritance', title: 'حاسبة الميراث', description: 'حساب التركة حسب الشرع الإسلامي', icon: Scale, href: '/tools/inheritance', color: 'text-blue-600' },
  { id: 'qibla', title: 'اتجاه القبلة', description: 'بوصلة GPS لتحديد اتجاه الكعبة', icon: Compass, href: '/tools/qibla', color: 'text-emerald-600' },
  { id: 'prayer-times', title: 'مواقيت الصلاة', description: 'مواقيت الصلاة لكل المدن', icon: Calendar, href: '/tools/prayer-times', color: 'text-rose-600' },
  { id: 'hijri-calendar', title: 'التقويم الهجري', description: 'تحويل التاريخ الميلادي إلى هجري', icon: Calendar, href: '/tools/hijri-calendar', color: 'text-purple-600' },
  { id: 'names', title: 'أسماء الله الحسنى', description: '99 اسم بالشرح والمعنى', icon: Sparkles, href: '/names', color: 'text-accent' },
  { id: 'seerah', title: 'السيرة النبوية', description: 'حياة النبي ﷺ وسيرته العطرة', icon: BookOpen, href: '/seerah', color: 'text-primary' },
  { id: 'fatwa', title: 'الفتاوى', description: 'أسئلة وأجوبة بالتعاون مع جهات موثوقة', icon: FileQuestion, href: '/fatwa', color: 'text-orange-600' },
];

export default function ToolsPage() {
  return (
    <PageLayout>
      <PageHeader
        title="أدوات إسلامية"
        subtitle="حاسبة الزكاة والميراث، اتجاه القبلة، التقويم الهجري، والمزيد"
        icon={<Calculator className="w-8 h-8 text-accent" />}
      />

      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.id}
                href={tool.href}
                className="group bg-card rounded-2xl p-6 border border-border/50 hover:border-accent/40 hover:shadow-teal transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/5 group-hover:bg-primary group-hover:text-primary-foreground text-primary transition-all duration-300 mb-4">
                  <Icon className={cn('w-7 h-7', tool.color)} />
                </div>
                <h3 className="font-kufi text-lg font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors">
                  {tool.title}
                </h3>
                <p className="text-sm text-muted-foreground font-cairo leading-relaxed">
                  {tool.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
}
