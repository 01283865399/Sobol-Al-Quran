'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen, ScrollText, Heart, CircleDot, Bird,
  Calculator, Sparkles, BookMarked, ArrowLeft,
} from 'lucide-react';
import { quickAccessSections } from '@/lib/islamic-data';
import { StarSeparator } from './star-separator';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen, ScrollText, Heart, CircleDot, Bird, Calculator, Sparkles, BookMarked,
};

export function QuickAccess() {
  return (
    <section className="py-14 lg:py-20 bg-background relative overflow-hidden">
      <div className="absolute inset-0 arabesque-3d opacity-25" />
      <div className="absolute inset-0 mosaic-pattern opacity-20" />
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <StarSeparator label="أقسام الموقع" className="mb-3" />
          <h2 className="font-kufi text-2xl lg:text-4xl font-black text-deep-gradient mb-2">
            كل ما تحتاجه في مكان واحد
          </h2>
          <p className="text-sm text-muted-foreground font-tajawal max-w-xl mx-auto">
            تصفح الأقسام الإسلامية الشاملة بتصميم عصري وسهل الاستخدام
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickAccessSections.map((section, index) => {
            const Icon = iconMap[section.icon] || BookOpen;
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
              >
                <Link
                  href={section.href}
                  className="group relative bg-card rounded-2xl p-5 border border-accent/8 hover:border-gold/30 transition-all duration-300 hover:shadow-card hover:-translate-y-1 overflow-hidden block"
                >
                  {/* Hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/4 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Gold corner accent */}
                  <div className="absolute top-0 right-0 w-12 h-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-gold/40 rounded-tr-lg" />
                  </div>

                  {/* Icon */}
                  <div className="relative inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/6 group-hover:teal-gradient group-hover:text-white text-accent transition-all duration-300 mb-3">
                    <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                  </div>

                  {/* Content */}
                  <h3 className="font-kufi text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-tajawal leading-relaxed mb-2.5">
                    {section.description}
                  </p>

                  {/* Arrow */}
                  <div className="flex items-center gap-1 text-[11px] font-medium text-gold opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:gap-1.5">
                    <span>تصفح القسم</span>
                    <ArrowLeft className="w-3 h-3" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
