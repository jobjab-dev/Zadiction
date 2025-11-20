'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-4">
        {/* Logo */}
        <div className="w-24 h-24 bg-gradient-zama rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
          <svg className="w-16 h-16 text-zama-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold text-zama-yellow mb-4">
          Zadiction
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Confidential Prediction Markets with FHEVM
        </p>

        {/* Description */}
        <div className="card-zama mb-8">
          <p className="text-gray-300 mb-4">
            Make predictions with complete privacy using Fully Homomorphic Encryption.
            Your choices remain encrypted until the market resolves.
          </p>
          <div className="text-encrypted text-sm">
            🔐 Powered by Zama FHEVM
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/markets" className="btn-zama">
            View Markets
          </Link>
          <Link href="/how-it-works" className="btn-zama-outline">
            How It Works
          </Link>
        </div>
      </div>
    </div>
  );
}
