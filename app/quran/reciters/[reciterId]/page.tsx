import { notFound } from 'next/navigation';
import { QuranReciterListenPage } from '@/components/quran-reciter-listen-page';
import { QURAN_RECITERS } from '@/lib/quran-api';

export default function ReciterPage({ params }: { params: { reciterId: string } }) {
  const reciter = QURAN_RECITERS.find((item) => item.id === params.reciterId);
  if (!reciter) notFound();

  return <QuranReciterListenPage reciter={reciter} />;
}
