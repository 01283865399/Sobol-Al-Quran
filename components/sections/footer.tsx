import Link from 'next/link';

const footerLinks = {
  'القرآن والحديث': [
    { label: 'القرآن الكريم', href: '/quran' },
    { label: 'الحديث الشريف', href: '/hadith' },
    { label: 'المساعد الإسلامي', href: '/chat' },
    { label: 'إذاعة القرآن', href: '/radio' },
  ],
  'العبادات': [
    { label: 'السبحة', href: '/tasbih' },
  ],
  'المزيد': [
    { label: 'سياسة الخصوصية', href: '/privacy' },
    { label: 'اتصل بنا', href: 'mailto:hello@sobol.app' },
  ],
};

export function Footer() {
  return (
    <footer className="site-footer mt-8 border-t border-border bg-card/90">
      <div className="w-full px-4 py-10 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link href="/" className="logo" aria-label="الصفحة الرئيسية">
              <span className="font-kufi text-2xl font-black text-gold-gradient">نور</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-7 text-muted-foreground">
              موقع إسلامي عربي يجمع بين التلاوة، الحديث، والإذاعة في تجربة هادئة وداعمة.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-4 text-lg font-black text-gold-gradient">{title}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={`${title}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border pt-5 text-sm text-muted-foreground md:flex-row">
          <p>© 2025 نور — جميع الحقوق محفوظة</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-gold">سياسة الخصوصية</Link>
            <Link href="/terms" className="hover:text-gold">الشروط</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
