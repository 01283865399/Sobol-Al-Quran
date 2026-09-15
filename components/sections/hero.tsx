'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { rotatingVerses, asmaUlHusna } from '@/lib/islamic-data';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StarSeparator } from './star-separator';

export function Hero() {
  const [verseIndex, setVerseIndex] = React.useState(0);
  const [nameIndex, setNameIndex] = React.useState(0);

  React.useEffect(() => {
    const verseTimer = setInterval(() => {
      setVerseIndex((prev) => (prev + 1) % rotatingVerses.length);
    }, 7000);

    const nameTimer = setInterval(() => {
      setNameIndex((prev) => (prev + 1) % asmaUlHusna.length);
    }, 4000);

    return () => {
      clearInterval(verseTimer);
      clearInterval(nameTimer);
    };
  }, []);

  const currentVerse = rotatingVerses[verseIndex];
  const currentName = asmaUlHusna[nameIndex];

  const goNextVerse = () => setVerseIndex((prev) => (prev + 1) % rotatingVerses.length);
  const goPrevVerse = () => setVerseIndex((prev) => (prev - 1 + rotatingVerses.length) % rotatingVerses.length);

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 w-full h-full z-0">
        <Image
          src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=2600&q=85"
          alt="الكعبة المشرفة وصحن المطاف في المسجد الحرام"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-black/75" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10 pt-24 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <p className="font-amiri text-2xl lg:text-3xl text-gold-bright mb-2">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative inline-block mb-2"
          >
            <h1 className="font-kufi text-5xl lg:text-7xl font-black text-white drop-shadow-2xl">
              سُبُل
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base lg:text-xl text-white/90 mb-1.5 font-cairo drop-shadow"
          >
            طرق المؤدية إلى الله
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-xs lg:text-sm text-white/70 mb-8 font-tajawal drop-shadow"
          >
            موقع إسلامي شامل لكل ما يحتاجه المسلم
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative max-w-xl mx-auto mb-8"
            key={verseIndex}
          >
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-7 lg:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-3 right-3 w-8 h-8 border-t border-r border-[#C5A059]/40 rounded-tr-xl" />
              <div className="absolute top-3 left-3 w-8 h-8 border-t border-l border-[#C5A059]/40 rounded-tl-xl" />
              <div className="absolute bottom-3 right-3 w-8 h-8 border-b border-r border-[#C5A059]/40 rounded-br-xl" />
              <div className="absolute bottom-3 left-3 w-8 h-8 border-b border-l border-[#C5A059]/40 rounded-bl-xl" />

              <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-[#C5A059]/50 to-transparent" />

              <AnimatePresence mode="wait">
                <motion.p
                  key={verseIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="font-quran text-xl lg:text-3xl leading-loose text-white mb-4 text-center drop-shadow-md"
                >
                  {currentVerse.text}
                </motion.p>
              </AnimatePresence>

              <StarSeparator className="mb-1" />
              <p className="text-xs text-[#E5C378] font-cairo mt-3 text-center">
                {currentVerse.surah} — الآية {currentVerse.ayahNumber}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 mt-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={goPrevVerse}
                className="w-9 h-9 rounded-full bg-black/40 backdrop-blur border border-white/15 flex items-center justify-center hover:bg-black/60 transition-all duration-300"
                aria-label="الآية السابقة"
              >
                <ChevronRight className="w-4 h-4 text-[#E5C378]" />
              </motion.button>
              <div className="flex gap-1.5">
                {rotatingVerses.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300',
                      i === verseIndex ? 'w-7 bg-[#C5A059]' : 'w-1.5 bg-white/30'
                    )}
                  />
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={goNextVerse}
                className="w-9 h-9 rounded-full bg-black/40 backdrop-blur border border-white/15 flex items-center justify-center hover:bg-black/60 transition-all duration-300"
                aria-label="الآية التالية"
              >
                <ChevronLeft className="w-4 h-4 text-[#E5C378]" />
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="inline-flex items-center gap-2.5 bg-black/40 backdrop-blur-md rounded-full px-5 py-2.5 border border-white/10"
          >
            <span className="text-[11px] text-[#E5C378] font-cairo">اسم الله الحسنى:</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={nameIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="font-amiri text-lg text-white"
              >
                {currentName.name}
              </motion.span>
            </AnimatePresence>
            <span className="text-[11px] text-white/30">—</span>
            <span className="text-[11px] text-white/70 font-tajawal">{currentName.meaning}</span>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1440 80" className="w-full h-auto" preserveAspectRatio="none">
          <path
            d="M0,40 C320,70 480,10 720,40 C960,70 1120,10 1440,40 L1440,80 L0,80 Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
}

export default Hero;