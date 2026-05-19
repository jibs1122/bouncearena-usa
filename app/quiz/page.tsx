import type { Metadata } from 'next';
import QuizClient from './QuizClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.bouncearenareviews.com';

export const metadata: Metadata = {
  title: 'Trampoline Quiz — Find the Right Match',
  description:
    'Answer a few quick questions to find the best trampoline for your family based on budget, safety priorities, spring type, and backyard size.',
  alternates: { canonical: `${SITE_URL}/quiz/` },
};

export default function QuizPage() {
  return <QuizClient />;
}
