'use client';

import * as React from 'react';
import { PageLayout, PageHeader } from '@/components/page-layout';
import { CircleDot, RotateCcw, Vibrate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const presetAdhkar = [
  { id: 'subhanallah', text: 'سُبْحَانَ اللَّهِ', target: 33 },
  { id: 'alhamdulillah', text: 'الْحَمْدُ لِلَّهِ', target: 33 },
  { id: 'allahuakbar', text: 'اللَّهُ أَكْبَرُ', target: 34 },
  { id: 'istighfar', text: 'أَسْتَغْفِرُ اللَّهَ', target: 100 },
  { id: 'shahada', text: 'لَا إِلَهَ إِلَّا اللَّهُ', target: 100 },
  { id: 'salawat', text: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', target: 100 },
];

export default function TasbihPage() {
  const [count, setCount] = React.useState(0);
  const [total, setTotal] = React.useState(0);
  const [selectedDhikr, setSelectedDhikr] = React.useState(presetAdhkar[0].id);
  const [vibrate, setVibrate] = React.useState(true);

  const currentDhikr = presetAdhkar.find((d) => d.id === selectedDhikr)!;
  const target = currentDhikr.target;
  const rounds = Math.floor(count / target);

  const handleTap = () => {
    setCount((c) => c + 1);
    setTotal((t) => t + 1);
    if (vibrate && 'vibrate' in navigator) {
      navigator.vibrate(30);
    }
  };

  const handleReset = () => {
    setCount(0);
  };

  const progress = (count % target) / target;

  return (
    <PageLayout>
      <PageHeader
        title="السبحة الإلكترونية"
        subtitle="سبحة تفاعلية بتصميم فاخر مع عداد يومي وأذكار مبرمجة"
        icon={<CircleDot className="w-8 h-8 text-accent" />}
      />

      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Dhikr selector */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center justify-center">
            <Select value={selectedDhikr} onValueChange={setSelectedDhikr}>
              <SelectTrigger className="w-full sm:w-64 font-cairo">
                <SelectValue placeholder="اختر الذكر" />
              </SelectTrigger>
              <SelectContent>
                {presetAdhkar.map((d) => (
                  <SelectItem key={d.id} value={d.id} className="font-cairo">
                    {d.text} ({d.target})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={vibrate ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVibrate(!vibrate)}
              className="font-cairo"
            >
              <Vibrate className="w-4 h-4 ml-2" />
              {vibrate ? 'الاهتزاز مفعّل' : 'الاهتزاز معطّل'}
            </Button>
          </div>

          {/* Counter circle */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              {/* Progress ring */}
              <svg className="w-72 h-72 lg:w-80 lg:h-80 -rotate-90" viewBox="0 0 320 320">
                <circle
                  cx="160" cy="160" r="150"
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="6"
                />
                <circle
                  cx="160" cy="160" r="150"
                  fill="none"
                  stroke="hsl(var(--accent))"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 942} 942`}
                  className="transition-all duration-300"
                />
              </svg>
              {/* Tap button */}
              <button
                onClick={handleTap}
                className="absolute inset-8 lg:inset-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex flex-col items-center justify-center shadow-deep hover:shadow-teal transition-all duration-300 active:scale-95"
              >
                <p className="font-amiri text-2xl lg:text-3xl text-accent mb-2">
                  {currentDhikr.text}
                </p>
                <span className="font-kufi text-6xl lg:text-7xl font-bold text-accent">
                  {count % target}
                </span>
                <span className="text-sm text-cream/50 font-cairo mt-2">
                  من {target}
                </span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-card rounded-2xl p-4 text-center border border-border/50">
              <p className="text-xs text-muted-foreground font-cairo mb-1">الجولة الحالية</p>
              <p className="font-kufi text-2xl font-bold text-primary">{rounds + (count % target > 0 ? 1 : 0)}</p>
            </div>
            <div className="bg-card rounded-2xl p-4 text-center border border-border/50">
              <p className="text-xs text-muted-foreground font-cairo mb-1">إجمالي الجولات</p>
              <p className="font-kufi text-2xl font-bold text-primary">{Math.floor(count / target)}</p>
            </div>
            <div className="bg-card rounded-2xl p-4 text-center border border-border/50">
              <p className="text-xs text-muted-foreground font-cairo mb-1">إجمالي التسبيح</p>
              <p className="font-kufi text-2xl font-bold text-accent">{total}</p>
            </div>
          </div>

          {/* Reset */}
          <div className="flex justify-center">
            <Button variant="outline" onClick={handleReset} className="font-cairo">
              <RotateCcw className="w-4 h-4 ml-2" />
              إعادة التعداد
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
