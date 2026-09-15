'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, ScrollText, Heart, CircleDot, Bird,
  Calculator, Sparkles, BookMarked, Menu, Moon, Sun, X, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/quran', label: 'القرآن', icon: BookOpen },
  { href: '/hadith', label: 'الحديث', icon: ScrollText },
  { href: '/azkar', label: 'الأذكار', icon: Heart },
  { href: '/tasbih', label: 'السبحة', icon: CircleDot },
  { href: '/sadaqah', label: 'الصدقة', icon: Bird },
  { href: '/names', label: 'الأسماء الحسنى', icon: Sparkles },
  { href: '/seerah', label: 'السيرة', icon: BookMarked },
  { href: '/tools', label: 'الأدوات', icon: Calculator },
];

function Logo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-9 h-9' : 'w-11 h-11';
  return (
    <div className={cn('relative flex items-center justify-center transition-transform group-hover:scale-105 duration-300', dim)}>
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id="logoTeal" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#7FD9CE" />
            <stop offset="50%" stopColor="#2A9D8F" />
            <stop offset="100%" stopColor="#1A6B62" />
          </linearGradient>
          <linearGradient id="logoBg" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#0A2E2A" />
            <stop offset="100%" stopColor="#0D4540" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="22" fill="url(#logoBg)" />
        <rect x="4" y="4" width="92" height="92" rx="19" fill="none" stroke="url(#logoTeal)" strokeWidth="0.5" opacity="0.3" />
        <path d="M50 15 C39 15 32 25 32 35 L32 50 L68 50 L68 35 C68 25 61 15 50 15Z" fill="url(#logoTeal)" opacity="0.95"/>
        <rect x="35" y="50" width="30" height="25" rx="4" fill="url(#logoTeal)" opacity="0.8"/>
        <path d="M42 75 L42 60 C42 54 46 50 50 50 C54 50 58 54 58 60 L58 75 Z" fill="#0A2E2A"/>
        <path d="M50 30 L50 18 M45 23 L50 18 L55 23" stroke="#FAF6EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>
        <rect x="30" y="75" width="40" height="3" rx="1.5" fill="url(#logoTeal)"/>
      </svg>
    </div>
  );
}

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [moreOpen, setMoreOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'glass shadow-soft border-b border-accent/10'
          : 'bg-transparent'
      )}
    >
      {scrolled && (
        <div className="absolute top-0 left-0 right-0 h-px gold-gradient opacity-60" />
      )}

      <nav className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <Logo />
            <div className="flex flex-col">
              <span className="font-kufi text-lg lg:text-xl font-black text-teal-gradient leading-none">
                سُبُل
              </span>
              <span className="text-[10px] lg:text-[11px] text-muted-foreground mt-0.5 font-tajawal tracking-wide">
                طرق المؤدية إلى الله
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.slice(0, 5).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative px-3.5 py-2 text-sm font-medium transition-colors duration-300 rounded-lg',
                  isActive(link.href)
                    ? 'text-primary'
                    : 'text-foreground/70 hover:text-primary'
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 gold-gradient rounded-full"
                  />
                )}
              </Link>
            ))}
            <div
              className="relative"
              onMouseEnter={() => setMoreOpen(true)}
              onMouseLeave={() => setMoreOpen(false)}
            >
              <button className={cn(
                'px-3.5 py-2 text-sm font-medium transition-colors duration-300 flex items-center gap-1 rounded-lg',
                isActive('/names') || isActive('/seerah') || isActive('/tools')
                  ? 'text-primary'
                  : 'text-foreground/70 hover:text-primary'
              )}>
                المزيد
                <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-300', moreOpen && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-52"
                  >
                    <div className="glass rounded-2xl border border-accent/10 shadow-card p-1.5">
                      {navLinks.slice(5).map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={cn(
                            'flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-xl transition-colors',
                            isActive(link.href)
                              ? 'bg-accent/8 text-primary'
                              : 'text-foreground/70 hover:text-primary hover:bg-accent/6'
                          )}
                        >
                          <link.icon className="w-4 h-4 text-gold" />
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            {mounted && (
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full hover:bg-accent/8 transition-colors w-9 h-9">
                {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-gold" /> : <Moon className="w-4.5 h-4.5 text-gold" />}
              </Button>
            )}
            <Button variant="default" size="sm" className="hidden lg:flex bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5 h-9 text-sm font-medium" asChild>
              <Link href="/account">حسابي</Link>
            </Button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden rounded-full w-9 h-9">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-5 border-b border-accent/10">
                    <div className="flex items-center gap-2.5">
                      <Logo size="sm" />
                      <span className="font-kufi text-lg font-black text-teal-gradient">سُبُل</span>
                    </div>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon" className="rounded-full w-9 h-9">
                        <X className="w-5 h-5" />
                      </Button>
                    </SheetClose>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors',
                          isActive(link.href)
                            ? 'bg-accent/8 text-primary'
                            : 'text-foreground/70 hover:text-primary hover:bg-accent/6'
                        )}
                      >
                        <link.icon className="w-4.5 h-4.5 text-gold" />
                        {link.label}
                      </Link>
                    ))}
                  </div>
                  <div className="p-3 border-t border-accent/10">
                    <Button className="w-full bg-primary hover:bg-primary/90 rounded-xl h-11" asChild>
                      <Link href="/account">تسجيل الدخول</Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
