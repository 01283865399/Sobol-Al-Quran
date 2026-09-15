import { Navbar } from '@/components/navbar';
import { Hero } from '@/components/sections/hero';
import { PrayerTimes } from '@/components/sections/prayer-times';
import { QuickAccess } from '@/components/sections/quick-access';
import { DailyContent } from '@/components/sections/daily-content';
import { Stats } from '@/components/sections/stats';
import { Footer } from '@/components/sections/footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <PrayerTimes />
        <QuickAccess />
        <DailyContent />
        <Stats />
      </main>
      <Footer />
    </>
  );
}
