import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/sections/footer';

interface PageLayoutProps {
  children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <>
      <Navbar />
      <main className="pt-16 lg:pt-18 min-h-screen">{children}</main>
      <Footer />
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
    <section className="relative teal-gradient-deep overflow-hidden py-14 lg:py-20">
      <div className="absolute inset-0 star-pattern opacity-20" />
      <div className="absolute inset-0 arabesque-3d opacity-15" />
      <div className="absolute inset-0 mosaic-pattern opacity-12" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/55 to-primary" />

      {/* Ornamental geometric star */}
      <div className="absolute top-1/4 -right-40 w-[450px] h-[450px] opacity-[0.04] animate-spin-slow">
        <svg viewBox="0 0 400 400" className="w-full h-full" fill="none">
          <g stroke="#7FD9CE" strokeWidth="0.5">
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30 * Math.PI) / 180;
              return <line key={i} x1={200} y1={200} x2={200 + 180 * Math.cos(angle)} y2={200 + 180 * Math.sin(angle)} />;
            })}
            <circle cx="200" cy="200" r="180" />
            <circle cx="200" cy="200" r="140" />
            <circle cx="200" cy="200" r="100" />
          </g>
        </svg>
      </div>
      <div className="absolute top-1/4 -left-32 w-64 h-64 opacity-[0.05] animate-spin-slow" style={{ animationDirection: 'reverse' }}>
        <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
          <g stroke="#C4A35A" strokeWidth="0.8">
            <path d="M100 10L120 80L190 100L120 120L100 190L80 120L10 100L80 80Z" />
            <path d="M100 30L115 85L170 100L115 115L100 170L85 115L30 100L85 85Z" transform="rotate(45 100 100)" />
          </g>
        </svg>
      </div>

      {/* Top gold line */}
      <div className="absolute top-0 left-0 right-0 h-px gold-gradient opacity-40" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
        {icon && (
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl glass-dark border border-gold/20 mb-5 animate-fade-in-up">
            {icon}
          </div>
        )}
        <h1 className="font-kufi text-3xl lg:text-5xl font-black text-teal-gradient mb-2 animate-fade-in-up" style={{ animationDelay: '0.08s' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-base text-cream/60 font-tajawal max-w-xl mx-auto animate-fade-in-up text-pretty" style={{ animationDelay: '0.16s' }}>
            {subtitle}
          </p>
        )}
        {/* Star separator */}
        <div className="flex items-center justify-center gap-2.5 mt-5 animate-fade-in-up" style={{ animationDelay: '0.24s' }}>
          <div className="h-px w-12 bg-gradient-to-l from-gold/40 to-transparent" />
          <div className="relative w-3.5 h-3.5">
            <svg viewBox="0 0 24 24" className="w-full h-full" fill="none">
              <path d="M12 0 L15 9 L24 12 L15 15 L12 24 L9 15 L0 12 L9 9 Z" fill="#C4A35A" opacity="0.5" />
            </svg>
          </div>
          <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
          <div className="relative w-3.5 h-3.5">
            <svg viewBox="0 0 24 24" className="w-full h-full" fill="none">
              <path d="M12 0 L15 9 L24 12 L15 15 L12 24 L9 15 L0 12 L9 9 Z" fill="#C4A35A" opacity="0.5" />
            </svg>
          </div>
          <div className="h-px w-12 bg-gradient-to-r from-gold/40 to-transparent" />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" className="w-full h-auto" preserveAspectRatio="none">
          <path d="M0,40 C360,65 720,15 1440,40 L1440,80 L0,80 Z" fill="hsl(var(--background))" className="transition-colors duration-300" />
        </svg>
      </div>
    </section>
  );
}
