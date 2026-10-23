import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { PageLayout, PageHeader } from '@/components/page-layout';
import { FileQuestion } from 'lucide-react';

const ChatPage = lazy(() => import('@/app/chat/page'));
const HadithPage = lazy(() => import('@/app/hadith/page'));
const HomePage = lazy(() => import('@/app/page'));
const PrivacyPage = lazy(() => import('@/app/privacy/page'));
const QuranListeningHomePage = lazy(() => import('@/app/quran/page'));
const QuranPage = lazy(() => import('@/app/quran/read/page'));
const ReciterPage = lazy(() => import('@/app/quran/reciters/[reciterId]/page'));
const RadioPage = lazy(() => import('@/app/radio/page'));
const TasbihPage = lazy(() => import('@/app/tasbih/page'));
const TermsPage = lazy(() => import('@/app/terms/page'));

function NotFoundPage() {
  return (
    <PageLayout>
      <PageHeader title="الصفحة غير موجودة" icon={<FileQuestion className="h-8 w-8 text-accent" />} />
      <p className="px-4 py-12 text-center text-muted-foreground">
        تعذر العثور على الصفحة المطلوبة.
      </p>
    </PageLayout>
  );
}

export function App() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-muted-foreground" role="status">
          جاري تحميل الصفحة...
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quran" element={<QuranListeningHomePage />} />
        <Route path="/quran/read" element={<QuranPage />} />
        <Route path="/quran/reciters/:reciterId" element={<ReciterPage />} />
        <Route path="/radio" element={<RadioPage />} />
        <Route path="/hadith" element={<HadithPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/tasbih" element={<TasbihPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
