'use client';

import * as React from 'react';
import { PageLayout, PageHeader } from '@/components/page-layout';
import { Bird, Heart, TreePine, Share2, Plus, Droplets, Home, BookOpen, Baby, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const sadaqahTypes = [
  { id: 'water', label: 'حفر بئر ماء', icon: Droplets, color: 'text-blue-600' },
  { id: 'masjid', label: 'بناء مسجد', icon: Home, color: 'text-emerald-600' },
  { id: 'mushaf', label: 'طباعة مصحف', icon: BookOpen, color: 'text-amber-600' },
  { id: 'orphan', label: 'كفالة يتيم', icon: Baby, color: 'text-rose-600' },
  { id: 'iftar', label: 'إفطار صائم', icon: Utensils, color: 'text-orange-600' },
  { id: 'general', label: 'صدقة عامة', icon: Heart, color: 'text-primary' },
];

const treeLeaves = [
  { id: 1, donor: 'أحمد محمد', type: 'حفر بئر', date: 'قبل يومين' },
  { id: 2, donor: 'فاطمة علي', type: 'كفالة يتيم', date: 'قبل 3 أيام' },
  { id: 3, donor: 'مجهول', type: 'صدقة عامة', date: 'قبل أسبوع' },
  { id: 4, donor: 'خالد العبدالله', type: 'إفطار صائم', date: 'قبل أسبوع' },
  { id: 5, donor: 'سارة أحمد', type: 'طباعة مصحف', date: 'قبل أسبوعين' },
];

export default function SadaqahPage() {
  const [showForm, setShowForm] = React.useState(false);
  const [selectedType, setSelectedType] = React.useState('general');

  return (
    <PageLayout>
      <PageHeader
        title="الصدقة الجارية"
        subtitle="أنشئ صفحة صدقة جارية باسم المتوفى، وشاركها مع الأهل والأصدقاء"
        icon={<Bird className="w-8 h-8 text-accent" />}
      />

      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        {/* Create memorial CTA */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-card rounded-2xl p-8 border border-border/50 shadow-deep text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/5 mb-4">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-kufi text-2xl font-bold text-primary mb-2">
              أنشئ صفحة صدقة جارية
            </h2>
            <p className="text-muted-foreground font-cairo mb-6">
              أنشئ صفحة باسم المتوفى مع صورة ودعاء، وشاركها مع الأهل والأصدقاء للتصدق باسمه
            </p>
            <Button
              className="font-cairo bg-primary hover:bg-primary/90"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'إلغاء' : 'إنشاء صفحة'}
            </Button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="max-w-2xl mx-auto mb-12 animate-fade-in-up">
            <div className="bg-card rounded-2xl p-8 border border-border/50">
              <h3 className="font-kufi text-xl font-bold text-primary mb-6">بيانات المتوفى</h3>
              <div className="space-y-4">
                <div>
                  <Label className="font-cairo mb-2 block">اسم المتوفى</Label>
                  <Input placeholder="اكتب اسم المتوفى" className="font-cairo" />
                </div>
                <div>
                  <Label className="font-cairo mb-2 block">دعاء للمتوفى</Label>
                  <Textarea placeholder="اكتب دعاءً للمتوفى..." className="font-cairo" rows={3} />
                </div>
                <div>
                  <Label className="font-cairo mb-3 block">نوع الصدقة</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {sadaqahTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.id}
                          onClick={() => setSelectedType(type.id)}
                          className={cn(
                            'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200',
                            selectedType === type.id
                              ? 'border-accent bg-accent/5'
                              : 'border-border/50 hover:border-accent/30'
                          )}
                        >
                          <Icon className={cn('w-6 h-6', type.color)} />
                          <span className="text-xs font-cairo text-center">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <Button className="w-full font-cairo bg-primary hover:bg-primary/90 mt-4">
                  نشر صفحة الصدقة الجارية
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Sadaqah types grid */}
        <div className="mb-12">
          <h2 className="font-kufi text-2xl font-bold text-primary text-center mb-8">
            أنواع الصدقات الجارية
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {sadaqahTypes.map((type, index) => {
              const Icon = type.icon;
              return (
                <div
                  key={type.id}
                  className="bg-card rounded-2xl p-5 border border-border/50 hover:border-accent/40 hover:shadow-teal transition-all duration-300 text-center animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/5 mb-3">
                    <Icon className={cn('w-7 h-7', type.color)} />
                  </div>
                  <p className="font-cairo text-sm font-medium text-foreground">{type.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tree of Sadaqah */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/5 mb-3">
              <TreePine className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-kufi text-2xl font-bold text-primary mb-2">شجرة الصدقات</h2>
            <p className="text-muted-foreground font-cairo">
              كل من يتصدق باسم المتوفى تُضاف ورقة للشجرة
            </p>
          </div>
          <div className="bg-card rounded-2xl p-6 border border-border/50 space-y-3">
            {treeLeaves.map((leaf, index) => (
              <div
                key={leaf.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-background/50 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="font-cairo text-sm font-medium text-foreground">
                    <span className="text-primary">{leaf.donor}</span> — {leaf.type}
                  </p>
                  <p className="text-xs text-muted-foreground font-cairo">{leaf.date}</p>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Share2 className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
