import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { AudioPlaybackProvider } from '@/components/audio-playback-provider';

export const metadata: Metadata = {
  metadataBase: new URL('https://subul.app'),
  title: {
    default: 'سُبُل | موقع إسلامي شامل',
    template: '%s | سُبُل',
  },
  description:
    'سُبُل - موقع إسلامي يجمع الاستماع إلى القرآن الكريم، الحديث الشريف، والإذاعة القرآنية في مكان واحد',
  keywords: [
    'إسلام', 'قرآن', 'قرآن كريم', 'قراء', 'حديث', 'إذاعة القرآن', 'سُبُل',
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
    description: 'موقع إسلامي يجمع الاستماع إلى القرآن الكريم، الحديث الشريف، والإذاعة القرآنية',
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
      <body className="font-tajawal">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AudioPlaybackProvider>{children}</AudioPlaybackProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
