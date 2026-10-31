import * as React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Navbar } from '@/components/navbar';

interface PageLayoutProps {
  children: React.ReactNode;
  showHomeLink?: boolean;
  hideNavbar?: boolean;
  mainClassName?: string;
}

export function PageLayout({
  children,
  showHomeLink = true,
  hideNavbar = false,
  mainClassName,
}: PageLayoutProps) {
  return (
    <>
      {!hideNavbar && <Navbar />}
      <main className={`min-h-screen${showHomeLink ? ' pt-2' : ''}${mainClassName ? ` ${mainClassName}` : ''}`}>
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
  compact?: boolean;
}

export function PageHeader({ title, subtitle, icon, compact = false }: PageHeaderProps) {
  return (
    <section className={`page-header${compact ? ' page-header--compact' : ''}`}>
      <div className="page-header__content">
        {icon && <div className="page-header__icon" aria-hidden="true">{icon}</div>}
        <div className="page-header__copy">
          <h1 className="font-kufi font-black text-gold-gradient">{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
    </section>
  );
}
