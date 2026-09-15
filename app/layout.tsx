import './globals.css';
import type { Metadata } from 'next';
import { Cairo, Reem_Kufi, Scheherazade_New } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
});

const reemKufi = Reem_Kufi({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-kufi',
});

const scheherazade = Scheherazade_New({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  variable: '--font-quran',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://subul.app'),
  title: {
    default: 'سُبُل | موقع إسلامي شامل',
    template: '%s | سُبُل',
  },
  description:
    'سُبُل - موقع إسلامي شامل يجمع القرآن الكريم بترتيل ياسر الدوسري، الحديث الشريف، الأذكار، مواقيت الصلاة، السبحة الإلكترونية، والصدقة الجارية في مكان واحد',
  keywords: [
    'إسلام', 'قرآن', 'قرآن كريم', 'ياسر الدوسري', 'حديث', 'أذكار',
    'مواقيت الصلاة', 'سبحة', 'صدقة جارية', 'سُبُل',
    'أسماء الله الحسنى', 'السيرة النبوية',
  ],
  authors: [{ name: 'سُبُل' }],
  creator: 'سُبُل',
  publisher: 'سُبُل',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'سُبُل | موقع إسلامي شامل',
    description: 'موقع إسلامي شامل يجمع القرآن الكريم، الحديث الشريف، الأذكار، مواقيت الصلاة، والسبحة الإلكترونية في مكان واحد',
    type: 'website',
    locale: 'ar_SA',
    siteName: 'سُبُل',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'سُبُل - موقع إسلامي شامل',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'سُبُل | موقع إسلامي شامل',
    description: 'موقع إسلامي شامل لكل ما يحتاجه المسلم',
    images: ['/og-image.svg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const themeColor = '#0F5132';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0F5132" />
      </head>
      <body
        className={`${cairo.variable} ${reemKufi.variable} ${scheherazade.variable} font-tajawal`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
