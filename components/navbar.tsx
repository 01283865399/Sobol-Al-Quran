'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Moon, Sun, Menu, X, BookOpen, ScrollText, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/quran', label: 'استمع', icon: BookOpen },
  { href: '/chat', label: 'المساعد', icon: MessageCircle },
  { href: '/radio', label: 'الإذاعة', icon: ScrollText },
  { href: '/hadith', label: 'الحديث', icon: ScrollText },
];

function Logo() {
  return (
    <div className="inline-flex items-center gap-2.5">
      <svg viewBox="-12 -12 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7" aria-hidden="true">
        <rect x="-7" y="-7" width="14" height="14" />
        <rect x="-7" y="-7" width="14" height="14" transform="rotate(45)" />
      </svg>
      <span className="font-kufi text-xl font-black text-gold-gradient leading-none">نور</span>
    </div>
  );
}

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <header className={cn('bar', scrolled ? 'shadow-sacred' : '')}>
      <div className="wrap">
        <Link href="/" className="logo" aria-label="الصفحة الرئيسية">
          <Logo />
        </Link>

        <nav aria-label="التنقل الرئيسي">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} aria-current={isActive(link.href) ? 'page' : undefined}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {mounted && (
            <button type="button" onClick={toggleTheme} className="ibtn" aria-label="تبديل الوضع">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <button type="button" className="ibtn lg:hidden" aria-label="فتح القائمة">
                <Menu className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0 bg-background border-l border-border">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-5 border-b border-border">
                  <Logo />
                  <SheetClose asChild>
                    <button type="button" className="ibtn" aria-label="إغلاق القائمة"><X className="h-4 w-4" /></button>
                  </SheetClose>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <SheetClose key={link.href} asChild>
                        <Link
                          href={link.href}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                            isActive(link.href) ? 'bg-accent/10 text-primary' : 'text-foreground/70 hover:text-primary hover:bg-accent/5'
                          )}
                        >
                          <Icon className="h-4 w-4 text-gold" />
                          {link.label}
                        </Link>
                      </SheetClose>
                    );
                  })}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
