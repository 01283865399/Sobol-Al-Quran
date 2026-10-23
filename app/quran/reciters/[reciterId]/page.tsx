import { Navigate, useParams } from 'react-router-dom';
import { QuranReciterListenPage } from '@/components/quran-reciter-listen-page';
import { QURAN_RECITERS } from '@/lib/quran-api';

export default function ReciterPage() {
  const { reciterId } = useParams<{ reciterId: string }>();
  const reciter = QURAN_RECITERS.find((item) => item.id === reciterId);
  if (!reciter) return <Navigate to="/quran" replace />;

  return <QuranReciterListenPage reciter={reciter} />;
}
