'use client';

import * as React from 'react';
import { PageLayout, PageHeader } from '@/components/page-layout';
import { BookMarked, MapPin, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const seerahEvents = [
  { year: 'عام الفيل', event: 'مولد النبي ﷺ', detail: 'وُلد النبي محمد ﷺ في مكة المكرمة في عام الفيل، يوم الإثنين 12 ربيع الأول' },
  { year: '4 سنوات', event: 'وفاة أمه', detail: 'توفيت أمه آمنة بنت وهب في الأبواء وهو مكان بين مكة والمدينة' },
  { year: '6 سنوات', event: 'وفاة جده', detail: 'توفى جده عبد المطلب، فكفله عمه أبو طالب' },
  { year: '25 سنة', event: 'الزواج من خديجة', detail: 'تزوج النبي ﷺ من خديجة بنت خويلد رضي الله عنها' },
  { year: '40 سنة', event: 'بدء الوحي', detail: 'نزل الوحي على النبي ﷺ في غار حراء، وكان أول ما نزل: اقرأ باسم ربك الذي خلق' },
  { year: '13 سنة من البعثة', event: 'الهجرة إلى المدينة', detail: 'هاجر النبي ﷺ من مكة إلى المدينة، وكانت نقطة تحول في تاريخ الإسلام' },
  { year: '2 هـ', event: 'غزوة بدر', detail: 'أول غزوة كبرى انتصر فيها المسلمون على قريش' },
  { year: '3 هـ', event: 'غزوة أحد', detail: 'وقعت غزوة أحد واستشهد فيها حمزة عم النبي ﷺ' },
  { year: '5 هـ', event: 'غزوة الخندق', detail: 'حاصر المشركون المدينة، فحفر المسلمون الخندق' },
  { year: '6 هـ', event: 'صلح الحديبية', detail: 'عقد النبي ﷺ صلح الحديبية مع قريش' },
  { year: '8 هـ', event: 'فتح مكة', detail: 'فتح الله على المسلمين مكة المكرمة ودخل الناس في دين الله أفواجاً' },
  { year: '10 هـ', event: 'حجة الوداع', detail: 'حج النبي ﷺ حجة الوداع وألقى خطبته الشهيرة' },
  { year: '11 هـ', event: 'وفاة النبي ﷺ', detail: 'انتقل النبي ﷺ إلى الرفيق الأعلى في المدينة المنورة يوم الإثنين 12 ربيع الأول' },
];

const prophets = [
  { name: 'آدم عليه السلام', title: 'أبو البشر', detail: 'أول البشر وأول الأنبياء' },
  { name: 'نوح عليه السلام', title: 'شيخ المرسلين', detail: 'دعا قومه 950 سنة وصنع السفينة' },
  { name: 'إبراهيم عليه السلام', title: 'خليل الله', detail: 'إمام الحنفاء وأبو الأنبياء' },
  { name: 'إسماعيل عليه السلام', title: 'الذبيح', detail: 'ابن إبراهيم وباني الكعبة مع أبيه' },
  { name: 'إسحاق عليه السلام', title: 'النبي الصالح', detail: 'ابن إبراهيم ووالد يعقوب' },
  { name: 'يعقوب عليه السلام', title: 'إسرائيل', detail: 'والد الأسباط وابن إسحاق' },
  { name: 'يوسف عليه السلام', title: 'صديق الله', detail: 'قصة استقرت في القرآن بسورة كاملة' },
  { name: 'موسى عليه السلام', title: 'كليم الله', detail: 'أنزل الله عليه التوراة وأرسله إلى فرعون' },
  { name: 'هارون عليه السلام', title: 'وزير موسى', detail: 'أخو موسى ووزيره في رسالته' },
  { name: 'داود عليه السلام', title: 'نبي وملك', detail: 'صاحب الزبور وصنع الدرع' },
  { name: 'سليمان عليه السلام', title: 'نبي وملك', detail: 'ابن داود وملك عظيم يسخر له الريح والجن' },
  { name: 'يونس عليه السلام', title: 'صاحب الحوت', detail: 'ابتلعه الحوت فنادى في الظلمات' },
  { name: 'عيسى عليه السلام', title: 'روح الله', detail: 'ولد من غير أب وأنزل الله عليه الإنجيل' },
  { name: 'محمد ﷺ', title: 'خاتم الأنبياء', detail: 'خاتم الأنبياء والمرسلين، بعثه الله رحمة للعالمين' },
];

export default function SeerahPage() {
  return (
    <PageLayout>
      <PageHeader
        title="السيرة النبوية"
        subtitle="حياة النبي محمد ﷺ وقصص الأنبياء عليهم السلام"
        icon={<BookMarked className="w-8 h-8 text-accent" />}
      />

      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <Tabs defaultValue="prophet" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-card border border-border/50">
              <TabsTrigger value="prophet" className="font-cairo">سيرة النبي ﷺ</TabsTrigger>
              <TabsTrigger value="prophets" className="font-cairo">قصص الأنبياء</TabsTrigger>
            </TabsList>
          </div>

          {/* Prophet Seerah timeline */}
          <TabsContent value="prophet">
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute right-6 top-0 bottom-0 w-px bg-accent/20" />

                {seerahEvents.map((event, index) => (
                  <div
                    key={index}
                    className="relative pr-16 pb-8 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Dot */}
                    <div className="absolute right-3 top-2 w-6 h-6 rounded-full bg-primary border-4 border-background z-10 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                    </div>
                    {/* Content */}
                    <div className="bg-card rounded-2xl p-5 border border-border/50 hover:border-accent/30 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-accent" />
                        <span className="text-xs font-cairo text-accent font-medium">{event.year}</span>
                      </div>
                      <h3 className="font-kufi text-lg font-bold text-primary mb-2">{event.event}</h3>
                      <p className="text-sm text-muted-foreground font-cairo leading-relaxed">{event.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Prophets stories */}
          <TabsContent value="prophets">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {prophets.map((prophet, index) => (
                <div
                  key={index}
                  className="bg-card rounded-2xl p-6 border border-border/50 hover:border-accent/40 hover:shadow-teal transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.04}s` }}
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/5 mb-3">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-kufi text-lg font-bold text-primary mb-1">{prophet.name}</h3>
                  <p className="text-xs text-accent font-cairo mb-2">{prophet.title}</p>
                  <p className="text-sm text-muted-foreground font-cairo leading-relaxed">{prophet.detail}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
