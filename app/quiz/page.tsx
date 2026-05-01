import type { Metadata } from 'next';
import QuizClient from './QuizClient';

export const metadata: Metadata = {
  title: 'Trampoline Quiz — Find the Right Match | Bounce Arena',
  description:
    'Answer a few quick questions to find the best trampoline for your family based on budget, safety priorities, spring type, and backyard size.',
};

export default function QuizPage() {
  return <QuizClient />;
}
