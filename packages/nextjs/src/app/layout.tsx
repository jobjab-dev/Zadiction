import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Confidential Prediction Market | Zama FHEVM',
  description: 'A fully encrypted prediction market built with Zama FHEVM - where your predictions remain private until resolution',
  keywords: ['FHEVM', 'Zama', 'Prediction Market', 'Confidential', 'Encryption', 'Web3'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

