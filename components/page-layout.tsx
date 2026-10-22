import * as React from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';
import { Navbar } from '@/components/navbar';

interface PageLayoutProps {
  children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-2">
        <div className="container mx-auto px-4 pt-4 lg:px-8">
          <Link
            href="/"
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border/70 bg-card/60 px-4 text-sm text-muted-foreground transition-colors hover:border-accent/50 hover:text-primary"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            العودة للرئيسية
          </Link>
        </div>
        {children}
      </main>
    </>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function PageHeader({ title, subtitle, icon }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden border-b border-border/80 py-12 lg:py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(221,183,104,0.12),transparent_62%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,23,48,0.12),transparent_70%)]" />
      <div className="container relative z-10 mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {icon && (
            <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-[26px] border border-gold/30 bg-card text-gold">
              {icon}
            </div>
          )}
          <h1 className="font-kufi text-3xl lg:text-5xl font-black text-gold-gradient">{title}</h1>
          {subtitle && <p className="mt-3 text-base text-muted-foreground">{subtitle}</p>}
          <div className="mt-5 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-gradient-to-l from-gold/40 to-transparent" />
            <div className="h-3 w-3 rotate-45 bg-gold/60" />
            <div className="h-1.5 w-1.5 rotate-45 bg-gold/60" />
            <div className="h-3 w-3 rotate-45 bg-gold/60" />
            <div className="h-px w-12 bg-gradient-to-r from-gold/40 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
