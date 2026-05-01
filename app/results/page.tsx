export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { getQuizEntries } from '@/lib/quizTrampolines';
import ResultsClient from './ResultsClient';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ResultsPage() {
  const entries = getQuizEntries();
  return <ResultsClient entries={entries} />;
}
