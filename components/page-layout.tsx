import * as React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Navbar } from '@/components/navbar';

interface PageLayoutProps {
  children: React.ReactNode;
  showHomeLink?: boolean;
}

export function PageLayout({ children, showHomeLink = true }: PageLayoutProps) {
  return (
    <>
      <Navbar />
      <main className={`min-h-screen${showHomeLink ? ' pt-2' : ''}`}>
        {showHomeLink && (
          <div className="w-full px-4 pt-4 lg:px-8">
            <Link
              to="/"
              className="glass-control inline-flex min-h-10 items-center gap-2 rounded-full border border-border/70 bg-card/60 px-4 text-sm text-muted-foreground transition-colors hover:border-accent/50 hover:text-primary"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              العودة للرئيسية
            </Link>
          </div>
        )}
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
    <section className="page-header relative overflow-hidden py-12 lg:py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(221,183,104,0.12),transparent_62%)]" />
      <div className="relative z-10 w-full px-4 lg:px-8">
        <div className="mx-auto text-center">
          {icon && (
            <div className="page-header__icon mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-[26px] border border-gold/30 bg-card text-gold">
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
