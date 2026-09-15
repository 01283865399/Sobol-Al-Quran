'use client';

import Link from 'next/link';
import { Mail } from 'lucide-react';
import { StarSeparator } from './star-separator';

const footerLinks = [
  {
    title: 'القرآن والحديث',
    links: [
      { label: 'القرآن الكريم', href: '/quran' },
      { label: 'الحديث الشريف', href: '/hadith' },
      { label: 'تفسير القرآن', href: '/quran/tafsir' },
      { label: 'أسماء الله الحسنى', href: '/names' },
    ],
  },
  {
    title: 'العبادات',
    links: [
      { label: 'الأذكار والأدعية', href: '/azkar' },
      { label: 'السبحة الإلكترونية', href: '/tasbih' },
      { label: 'مواقيت الصلاة', href: '/tools/prayer-times' },
      { label: 'اتجاه القبلة', href: '/tools/qibla' },
    ],
  },
  {
    title: 'الصدقات والأدوات',
    links: [
      { label: 'الصدقة الجارية', href: '/sadaqah' },
      { label: 'حاسبة الزكاة', href: '/tools/zakat' },
      { label: 'حاسبة الميراث', href: '/tools/inheritance' },
      { label: 'التقويم الهجري', href: '/tools/hijri-calendar' },
    ],
  },
  {
    title: 'المزيد',
    links: [
      { label: 'السيرة النبوية', href: '/seerah' },
      { label: 'قصص الأنبياء', href: '/seerah/prophets' },
      { label: 'فتاوى', href: '/fatwa' },
      { label: 'حسابي', href: '/account' },
    ],
  },
];

function FooterLogo() {
  return (
    <div className="w-10 h-10 flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id="footerTeal" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#7FD9CE" />
            <stop offset="50%" stopColor="#2A9D8F" />
            <stop offset="100%" stopColor="#1A6B62" />
          </linearGradient>
          <linearGradient id="footerBg" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#0A2E2A" />
            <stop offset="100%" stopColor="#0D4540" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="22" fill="url(#footerBg)" />
        <path d="M50 15 C39 15 32 25 32 35 L32 50 L68 50 L68 35 C68 25 61 15 50 15Z" fill="url(#footerTeal)" opacity="0.95"/>
        <rect x="35" y="50" width="30" height="25" rx="4" fill="url(#footerTeal)" opacity="0.8"/>
        <path d="M42 75 L42 60 C42 54 46 50 50 50 C54 50 58 54 58 60 L58 75 Z" fill="#0A2E2A"/>
        <path d="M50 30 L50 18 M45 23 L50 18 L55 23" stroke="#FAF6EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>
        <rect x="30" y="75" width="40" height="3" rx="1.5" fill="url(#footerTeal)"/>
      </svg>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-card border-t border-accent/10 relative overflow-hidden">
      <div className="h-0.5 gold-gradient opacity-60" />
      <div className="absolute inset-0 arabesque-3d opacity-12" />
      <div className="absolute inset-0 mosaic-pattern opacity-15" />

      <div className="container mx-auto px-4 lg:px-8 py-10 lg:py-14 relative z-10">
        {/* Top section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-2.5 mb-3">
              <FooterLogo />
              <div>
                <span className="font-kufi text-lg font-black text-teal-gradient block">سُبُل</span>
                <span className="text-[11px] text-muted-foreground font-tajawal">طرق المؤدية إلى الله</span>
              </div>
            </Link>
            <p className="text-xs text-muted-foreground font-tajawal leading-relaxed mb-3 max-w-sm">
              موقع إسلامي شامل يجمع كل ما يحتاجه المسلم في مكان واحد، بتصميم إسلامي أصيل ومحتوى موثوق من المصادر المعتمدة.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="w-3.5 h-3.5 text-gold" />
              <span>contact@sobol.com</span>
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-5">
            {footerLinks.map((group) => (
              <div key={group.title}>
                <h4 className="font-kufi text-xs font-bold text-primary mb-3 relative pb-1.5">
                  {group.title}
                  <span className="absolute bottom-0 right-0 w-6 h-0.5 gold-gradient rounded-full" />
                </h4>
                <ul className="space-y-1.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-xs text-muted-foreground hover:text-gold transition-colors font-tajawal"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-accent/10 pt-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground font-tajawal text-center">
              © 2025 سُبُل — جميع الحقوق محفوظة | صُنع بحب لخدمة الأمة الإسلامية
            </p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="text-xs text-muted-foreground hover:text-gold transition-colors">سياسة الخصوصية</Link>
              <Link href="/terms" className="text-xs text-muted-foreground hover:text-gold transition-colors">الشروط والأحكام</Link>
            </div>
          </div>
        </div>

        {/* Bottom dua */}
        <div className="mt-6 text-center">
          <StarSeparator className="mb-2.5" />
          <p className="font-amiri text-sm text-gold/60">
            اللَّهُمَّ اجْعَلْ هَذَا العَمَلَ خَالِصًا لِوَجْهِكَ الكَرِيمِ
          </p>
        </div>
      </div>
    </footer>
  );
}
