'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ScrollText, Heart, Copy, Share2, Check } from 'lucide-react';
import { verseOfTheDay, hadithOfTheDay, dhikrOfTheDay } from '@/lib/islamic-data';
import { cn } from '@/lib/utils';
import { StarSeparator } from './star-separator';

type Tab = 'verse' | 'hadith' | 'dhikr';

export function DailyContent() {
  const [activeTab, setActiveTab] = React.useState<Tab>('verse');
  const [copied, setCopied] = React.useState(false);

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'verse', label: 'آية اليوم', icon: BookOpen },
    { id: 'hadith', label: 'حديث اليوم', icon: ScrollText },
    { id: 'dhikr', label: 'ذكر اليوم', icon: Heart },
  ];

  const content = {
    verse: {
      text: verseOfTheDay.text,
      meta: `${verseOfTheDay.surah} — الآية ${verseOfTheDay.ayahNumber}`,
      extra: null as string | null,
    },
    hadith: {
      text: hadithOfTheDay.text,
      meta: hadithOfTheDay.source,
      extra: `الراوي: ${hadithOfTheDay.narrator} | الدرجة: ${hadithOfTheDay.grade}`,
    },
    dhikr: {
      text: dhikrOfTheDay.text,
      meta: `العدد: ${dhikrOfTheDay.count}`,
      extra: `الفضل: ${dhikrOfTheDay.virtue}`,
    },
  }[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(content.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ text: content.text }); } catch {}
    } else { handleCopy(); }
  };

  return (
    <section className="py-14 lg:py-20 bg-gradient-to-b from-background to-secondary/20 relative overflow-hidden">
      <div className="absolute inset-0 arabesque-3d opacity-20" />
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <StarSeparator label="من فوائد اليوم" className="mb-3" />
          <h2 className="font-kufi text-2xl lg:text-4xl font-black text-deep-gradient">نصيبك من اليوم</h2>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {/* Tabs */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                  activeTab === tab.id
                    ? 'teal-gradient text-white shadow-teal'
                    : 'bg-card text-foreground/60 hover:bg-accent/8 border border-accent/10'
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </motion.button>
            ))}
          </div>

          {/* Content card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.96, rotateX: 3 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4 }}
              className="bg-card rounded-2xl border border-accent/10 shadow-card p-7 lg:p-10 relative overflow-hidden perspective-1000"
            >
              {/* Gold corner ornaments */}
              <div className="absolute top-3 right-3 w-8 h-8 border-t border-r border-gold/20 rounded-tr-xl" />
              <div className="absolute top-3 left-3 w-8 h-8 border-t border-l border-gold/20 rounded-tl-xl" />
              <div className="absolute bottom-3 right-3 w-8 h-8 border-b border-r border-gold/20 rounded-br-xl" />
              <div className="absolute bottom-3 left-3 w-8 h-8 border-b border-l border-gold/20 rounded-bl-xl" />

              <StarSeparator className="mb-5" />

              <p
                className={cn(
                  'text-center leading-loose text-foreground mb-5',
                  activeTab === 'verse' ? 'font-quran text-2xl lg:text-3xl' : 'font-amiri text-lg lg:text-xl'
                )}
              >
                {content.text}
              </p>

              <div className="text-center mb-3">
                <p className="text-sm text-gold font-cairo font-medium">{content.meta}</p>
              </div>

              {content.extra && (
                <div className="text-center mb-5">
                  <p className="text-xs text-muted-foreground font-tajawal">{content.extra}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-center gap-3 pt-4 border-t border-accent/10">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm text-foreground/60 hover:text-primary hover:bg-accent/8 rounded-lg transition-colors"
                >
                  {copied ? (
                    <><Check className="w-4 h-4 text-green-600" /><span>تم النسخ</span></>
                  ) : (
                    <><Copy className="w-4 h-4" /><span>نسخ</span></>
                  )}
                </button>
                <div className="w-px h-5 bg-accent/12" />
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm text-foreground/60 hover:text-primary hover:bg-accent/8 rounded-lg transition-colors"
                >
                  <Share2 className="w-4 h-4" /><span>مشاركة</span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
