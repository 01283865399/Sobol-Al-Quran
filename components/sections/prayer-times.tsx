'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Sunrise, Sun, Sunset, Moon, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StarSeparator } from './star-separator';

interface PrayerTime {
  name: string;
  time: string;
  icon: 'sunrise' | 'sun' | 'sunset' | 'moon';
}

const defaultPrayers: PrayerTime[] = [
  { name: 'الفجر', time: '04:32', icon: 'sunrise' },
  { name: 'الشروق', time: '06:05', icon: 'sun' },
  { name: 'الظهر', time: '12:18', icon: 'sun' },
  { name: 'العصر', time: '15:42', icon: 'sun' },
  { name: 'المغرب', time: '18:31', icon: 'sunset' },
  { name: 'العشاء', time: '20:01', icon: 'moon' },
];

const iconMap = { sunrise: Sunrise, sun: Sun, sunset: Sunset, moon: Moon };

function getHijriDate(): string {
  const today = new Date();
  try {
    return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
      day: 'numeric', month: 'long', year: 'numeric',
    }).format(today);
  } catch {
    const months = ['محرم','صفر','ربيع الأول','ربيع الثاني','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'];
    return `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear() - 579} هـ`;
  }
}

function getGregorianDate(): string {
  const today = new Date();
  const days = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  return `${days[today.getDay()]}، ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
}

export function PrayerTimes() {
  const [hijriDate] = React.useState(getHijriDate);
  const [gregorianDate] = React.useState(getGregorianDate);
  const [nextPrayer, setNextPrayer] = React.useState(0);
  const [countdown, setCountdown] = React.useState('');

  React.useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      let next = 0;
      for (let i = 0; i < defaultPrayers.length; i++) {
        const [h, m] = defaultPrayers[i].time.split(':').map(Number);
        if (h * 60 + m > currentMinutes) { next = i; break; }
        next = 0;
      }
      setNextPrayer(next);

      const [nh, nm] = defaultPrayers[next].time.split(':').map(Number);
      let diff = nh * 60 + nm - currentMinutes;
      if (diff < 0) diff += 24 * 60;

      setCountdown(
        `${String(Math.floor(diff / 60)).padStart(2, '0')}:${String(diff % 60).padStart(2, '0')}:${String(59 - now.getSeconds()).padStart(2, '0')}`
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-14 lg:py-20 bg-background relative overflow-hidden">
      <div className="absolute inset-0 arabesque-3d opacity-30" />
      <div className="absolute inset-0 dot-pattern opacity-40" />
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Date Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <StarSeparator label="التاريخ اليوم" className="mb-3" />
          <p className="font-kufi text-xl lg:text-2xl font-bold text-deep-gradient">{hijriDate}</p>
          <p className="text-sm text-muted-foreground font-tajawal mt-1">{gregorianDate}</p>
        </motion.div>

        {/* Prayer Times Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="glass rounded-2xl border border-accent/10 shadow-card overflow-hidden">
            {/* Header */}
            <div className="teal-gradient-deep text-primary-foreground px-5 py-4 flex items-center justify-between flex-wrap gap-3 relative overflow-hidden">
              <div className="absolute inset-0 star-pattern opacity-15" />
              <div className="absolute inset-0 mosaic-pattern opacity-20" />
              <div className="flex items-center gap-2.5 relative z-10">
                <div className="w-9 h-9 rounded-lg glass-teal border border-gold/20 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-gold-bright" />
                </div>
                <div>
                  <p className="font-kufi text-sm font-bold">مكة المكرمة</p>
                  <p className="text-[11px] text-primary-foreground/55">المملكة العربية السعودية</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 relative z-10">
                <Clock className="w-3.5 h-3.5 text-gold/70" />
                <span className="text-[11px] text-primary-foreground/60">التوقيت المحلي</span>
              </div>
            </div>

            {/* Next Prayer Countdown */}
            <div className="px-5 py-6 text-center bg-gradient-to-b from-accent/6 to-transparent border-b border-accent/10">
              <p className="text-xs text-muted-foreground font-tajawal mb-1.5">الصلاة القادمة</p>
              <p className="font-kufi text-2xl lg:text-3xl font-bold text-deep-gradient mb-2.5">
                {defaultPrayers[nextPrayer].name}
              </p>
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 teal-gradient text-primary-foreground rounded-full shadow-teal">
                <Clock className="w-4 h-4 text-gold-bright animate-pulse" />
                <span className="font-mono text-xl font-bold tracking-wider">{countdown || '--:--:--'}</span>
              </div>
            </div>

            {/* Prayer Times Grid */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-px bg-accent/8">
              {defaultPrayers.map((prayer, index) => {
                const Icon = iconMap[prayer.icon];
                const isNext = index === nextPrayer;
                return (
                  <motion.div
                    key={prayer.name}
                    whileHover={{ scale: 1.03 }}
                    className={cn(
                      'p-4 text-center transition-all duration-300 cursor-pointer',
                      isNext ? 'bg-accent/10' : 'bg-card hover:bg-accent/4'
                    )}
                  >
                    <div className={cn(
                      'inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 transition-all duration-300',
                      isNext
                        ? 'bg-accent text-white shadow-teal'
                        : 'bg-accent/8 text-accent hover:bg-accent/15'
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className="font-kufi text-xs font-bold text-foreground mb-0.5">{prayer.name}</p>
                    <p className="font-mono text-sm text-muted-foreground">{prayer.time}</p>
                    {isNext && (
                      <span className="inline-block mt-1.5 px-2 py-0.5 text-[9px] font-bold bg-gold text-white rounded-full">القادمة</span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
