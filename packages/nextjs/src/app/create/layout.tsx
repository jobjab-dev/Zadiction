import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Market | Zadiction',
  description: 'Create a new confidential prediction market - Owner only',
};

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

