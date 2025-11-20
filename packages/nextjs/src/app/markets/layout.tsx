import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Markets | Zadiction',
  description: 'Browse all confidential prediction markets',
};

export default function MarketsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

