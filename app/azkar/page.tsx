'use client';

import * as React from 'react';
import { PageLayout, PageHeader } from '@/components/page-layout';
import { Heart, Sunrise, Sunset, Moon, Repeat, Copy } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DhikrItem {
  id: number;
  text: string;
  count: number;
  note?: string;
}

const azkarCategories = {
  morning: {
    title: 'أذكار الصباح',
    icon: Sunrise,
    items: [
      { id: 1, text: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ، اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ، لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ', count: 1 },
      { id: 2, text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', count: 1 },
      { id: 3, text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', count: 100 },
      { id: 4, text: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', count: 10 },
      { id: 5, text: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ', count: 3 },
      { id: 6, text: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا', count: 3 },
    ] as DhikrItem[],
  },
  evening: {
    title: 'أذكار المساء',
    icon: Sunset,
    items: [
      { id: 1, text: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', count: 1 },
      { id: 2, text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', count: 100 },
      { id: 3, text: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', count: 3 },
      { id: 4, text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ', count: 1 },
      { id: 5, text: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ', count: 3 },
    ] as DhikrItem[],
  },
  sleep: {
    title: 'أذكار النوم',
    icon: Moon,
    items: [
      { id: 1, text: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', count: 1 },
      { id: 2, text: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ', count: 3 },
      { id: 3, text: 'سُبْحَانَ اللَّهِ (33) وَالْحَمْدُ لِلَّهِ (33) وَاللَّهُ أَكْبَرُ (34)', count: 1 },
    ] as DhikrItem[],
  },
  prayer: {
    title: 'أذكار الصلاة',
    icon: Heart,
    items: [
      { id: 1, text: 'أَسْتَغْفِرُ اللَّهَ (ثلاثًا)، اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ', count: 1 },
      { id: 2, text: 'سُبْحَانَ اللَّهِ (33) وَالْحَمْدُ لِلَّهِ (33) وَاللَّهُ أَكْبَرُ (34)', count: 1 },
      { id: 3, text: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', count: 1 },
    ] as DhikrItem[],
  },
};

function DhikrCounter({ item }: { item: DhikrItem }) {
  const [count, setCount] = React.useState(0);
  const done = count >= item.count;

  return (
    <div className={cn(
      'bg-card rounded-2xl p-6 border transition-all duration-300',
      done ? 'border-accent/40 shadow-teal' : 'border-border/50'
    )}>
      <div className="flex items-start justify-between mb-4">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/5 text-primary font-kufi text-sm font-bold">
          {item.id}
        </span>
        <span className="text-xs text-muted-foreground font-cairo">
          التكرار: {item.count}
        </span>
      </div>
      <p className="font-amiri text-lg lg:text-xl leading-loose text-foreground mb-4">
        {item.text}
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCount((c) => Math.min(item.count, c + 1))}
          className={cn(
            'flex-1 h-12 rounded-xl font-cairo font-medium transition-all duration-200 active:scale-95',
            done
              ? 'bg-accent/15 text-accent'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          )}
        >
          {done ? 'تم بحمد الله' : `اضغط للتسبيح (${count}/${item.count})`}
        </button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCount(0)}
          className="shrink-0"
        >
          <Repeat className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function AzkarPage() {
  return (
    <PageLayout>
      <PageHeader
        title="الأذكار والأدعية"
        subtitle="أذكار الصباح والمساء والنوم والصلاة مع عداد تلقائي لكل ذكر"
        icon={<Heart className="w-8 h-8 text-accent" />}
      />

      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <Tabs defaultValue="morning" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-card border border-border/50 flex flex-wrap">
              {Object.entries(azkarCategories).map(([key, cat]) => {
                const Icon = cat.icon;
                return (
                  <TabsTrigger key={key} value={key} className="font-cairo gap-2">
                    <Icon className="w-4 h-4" />
                    {cat.title}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {Object.entries(azkarCategories).map(([key, cat]) => {
            const Icon = cat.icon;
            return (
              <TabsContent key={key} value={key}>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/5 mb-3">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="font-kufi text-2xl font-bold text-primary mb-2">{cat.title}</h2>
                  <p className="text-sm text-muted-foreground font-cairo">{cat.items.length} أذكار</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl mx-auto">
                  {cat.items.map((item, index) => (
                    <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.06}s` }}>
                      <DhikrCounter item={item} />
                    </div>
                  ))}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </PageLayout>
  );
}
