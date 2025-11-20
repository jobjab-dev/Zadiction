import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How It Works | Zadiction',
  description: 'Learn how confidential prediction markets work with FHEVM - flow, formulas, and examples',
};

export default function HowItWorksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

