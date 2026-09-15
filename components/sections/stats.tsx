'use client';

import { motion } from 'framer-motion';
import { BookOpen, ScrollText, Heart, Users } from 'lucide-react';
import { siteStats } from '@/lib/islamic-data';
import { StarSeparator } from './star-separator';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen, ScrollText, Heart, Users,
};

export function Stats() {
  return (
    <section className="py-14 lg:py-18 teal-gradient-deep relative overflow-hidden">
      <div className="absolute inset-0 star-pattern opacity-20" />
      <div className="absolute inset-0 mosaic-pattern opacity-15" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/25 to-primary" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <StarSeparator label="بأرقام" className="mb-3" />
          <h2 className="font-kufi text-2xl lg:text-3xl font-black text-gold-gradient">ثروة الموقع</h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 max-w-4xl mx-auto">
          {siteStats.map((stat, index) => {
            const Icon = iconMap[stat.icon] || BookOpen;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold/8 border border-gold/20 mb-3 hover:scale-110 hover:bg-gold/12 transition-all duration-300">
                  <Icon className="w-6 h-6 text-gold-bright" />
                </div>
                <p className="font-kufi text-2xl lg:text-4xl font-black text-gold-gradient mb-0.5">{stat.value}</p>
                <p className="text-xs text-primary-foreground/50 font-tajawal">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
