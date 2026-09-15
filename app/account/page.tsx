import { Hero } from '@/components/sections/hero';
import PrayerTimesSection from '@/components/sections/prayer-times-section';
import QuranSection from '@/components/sections/quran-section';
import DailyContent from '@/components/sections/daily-content';
import HadithSection from '@/components/sections/hadith-section';
import AzkarSection from '@/components/sections/azkar-section';
import Features from '@/components/sections/features';
import InteractiveFeatures from '@/components/sections/interactive-features';

export default function Home() {
  return (
    <main className="min-h-screen relative">
      {/* 1. قسم الهيرو الرئيسي */}
      <Hero />

      {/* 2. باقي الأقسام */}
      <div className="relative z-10 flex flex-col gap-12 sm:gap-16 pb-20">
        {PrayerTimesSection && <PrayerTimesSection />}
        {DailyContent && <DailyContent />}
        {QuranSection && <QuranSection />}
        {HadithSection && <HadithSection />}
        {AzkarSection && <AzkarSection />}
        {InteractiveFeatures && <InteractiveFeatures />}
        {Features && <Features />}
      </div>
    </main>
  );
}