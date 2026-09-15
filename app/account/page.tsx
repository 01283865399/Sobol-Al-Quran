import { Hero } from '@/components/sections/hero';
// @ts-ignore
import { PrayerTimesSection } from '@/components/sections/prayer-times-section';
// @ts-ignore
import { QuranSection } from '@/components/sections/quran-section';
// @ts-ignore
import { DailyContent } from '@/components/sections/daily-content';
// @ts-ignore
import { HadithSection } from '@/components/sections/hadith-section';
// @ts-ignore
import { AzkarSection } from '@/components/sections/azkar-section';
// @ts-ignore
import { Features } from '@/components/sections/features';
// @ts-ignore
import { InteractiveFeatures } from '@/components/sections/interactive-features';

export default function Home() {
  return (
    <main className="min-h-screen relative">
      <Hero />
      <div className="relative z-10 flex flex-col gap-12 sm:gap-16 pb-20">
        <PrayerTimesSection />
        <DailyContent />
        <QuranSection />
        <HadithSection />
        <AzkarSection />
        <InteractiveFeatures />
        <Features />
      </div>
    </main>
  );
}