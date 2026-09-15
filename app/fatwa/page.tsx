'use client';

import * as React from 'react';
import { PageLayout, PageHeader } from '@/components/page-layout';
import { FileQuestion, Search, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const fatwaCategories = [
  { id: 'worship', label: 'العبادات', count: 245 },
  { id: 'family', label: 'الأسرة', count: 132 },
  { id: 'finance', label: 'المعاملات المالية', count: 89 },
  { id: 'social', label: 'المعاملات الاجتماعية', count: 67 },
  { id: 'modern', label: 'قضايا معاصرة', count: 54 },
];

const sampleFatwas = [
  {
    id: '1',
    question: 'ما حكم قراءة القرآن الكريم على الميت؟',
    answer: 'قراءة القرآن على الميت من الأمور المشروعة، وقد ثبت عن النبي ﷺ أنه قال: "اقرأوا يس على موتاكم". والمراد بها عند الموت، وقد ذهب بعض العلماء إلى جواز قراءة القرآن وإهداء ثوابها للميت، وهو قول جمهور العلماء.',
    category: 'العبادات',
    scholar: 'الشيخ ابن باز رحمه الله',
  },
  {
    id: '2',
    question: 'هل يجوز صلاة الفريضة بالنافلة؟',
    answer: 'لا يجوز أن يقتدي المصلي المفروض بالمتنفل، لأن النافلة ليست كالفريضة في الأحكام. وأما العكس وهو ائتمام المتنفل بالمفروض فجائز باتفاق العلماء.',
    category: 'العبادات',
    scholar: 'الشيخ ابن عثيمين رحمه الله',
  },
  {
    id: '3',
    question: 'ما حكم زكاة الأموال المودعة في البنوك؟',
    answer: 'الأموال المودعة في البنوك إذا كانت نقداً وحال عليها الحول وبلغت النصاب، فتجب فيها الزكاة. وإن كانت في بنوك إسلامية لا تعطي فوائد ربوية، فتزكى كأي مال آخر.',
    category: 'المعاملات المالية',
    scholar: 'الشيخ ابن جبرين رحمه الله',
  },
  {
    id: '4',
    question: 'ما حكم صلة الأم التي تعادي الدين؟',
    answer: 'صلة الوالدين واجبة ولو كانا غير مسلمين أو عاصيين، لكن لا يجوز طاعتهما في معصية الله. ويجب الإحسان إليهما والدعاء لهما بالهداية.',
    category: 'الأسرة',
    scholar: 'الشيخ عبد الله بن منيع',
  },
  {
    id: '5',
    question: 'ما حكم العمل في شركة تتعامل بالربا؟',
    answer: 'لا يجوز العمل في شركة تتعامل بالربا إذا كان العمل مباشراً في كتابة الربا أو الإشهاد عليه أو حسابه، لقول النبي ﷺ: "لعن الله آكل الربا ومؤكله وكاتبه وشاهديه".',
    category: 'المعاملات المالية',
    scholar: 'الشيخ ابن باز رحمه الله',
  },
];

export default function FatwaPage() {
  const [search, setSearch] = React.useState('');

  const filtered = sampleFatwas.filter(
    (f) => f.question.includes(search) || f.answer.includes(search) || f.category.includes(search)
  );

  return (
    <PageLayout>
      <PageHeader
        title="الفتاوى"
        subtitle="أسئلة وأجوبة شرعية بالتعاون مع جهات موثوقة"
        icon={<FileQuestion className="w-8 h-8 text-accent" />}
      />

      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
          {fatwaCategories.map((cat, index) => (
            <div
              key={cat.id}
              className="bg-card rounded-2xl p-4 border border-border/50 hover:border-accent/40 transition-all duration-300 text-center cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <p className="font-kufi text-sm font-bold text-primary mb-1">{cat.label}</p>
              <p className="text-xs text-muted-foreground font-cairo">{cat.count} فتوى</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-xl mx-auto mb-8">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="ابحث في الفتاوى..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10 font-cairo"
          />
        </div>

        {/* Fatwas */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {filtered.map((fatwa, index) => (
              <AccordionItem
                key={fatwa.id}
                value={fatwa.id}
                className="bg-card rounded-2xl border border-border/50 px-6 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <AccordionTrigger className="font-cairo text-right hover:no-underline">
                  <div className="flex items-start gap-3 text-right">
                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="font-kufi text-xs font-bold text-accent">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-kufi text-base font-bold text-primary mb-1">{fatwa.question}</p>
                      <p className="text-xs text-muted-foreground font-cairo">{fatwa.category}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="font-cairo">
                  <div className="pt-4 border-t border-border/30">
                    <p className="text-foreground leading-relaxed mb-3">{fatwa.answer}</p>
                    <p className="text-xs text-accent font-cairo">— {fatwa.scholar}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </PageLayout>
  );
}
