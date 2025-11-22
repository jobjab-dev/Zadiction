'use client';

import Link from 'next/link';
import { useState } from 'react';
import SketchCanvas from '@/components/SketchCanvas';
export default function HomePage() {
  const [showContent, setShowContent] = useState(false);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col items-center justify-center p-4 fixed inset-0">
      <div className="max-w-4xl w-full text-center flex flex-col items-center">

        {/* Sketch Animation Area */}
        <div className="mb-4">
          <SketchCanvas onComplete={() => setShowContent(true)} />
        </div>

        {/* Content that fades in after sketch */}
        <div className={`transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-6xl md:text-8xl font-bold text-ink mb-2 tracking-tight" style={{ fontFamily: 'Marker Felt, Comic Sans MS, sans-serif' }}>
            Zadiction
          </h1>

          {/* Hand-drawn underline */}
          <div className="h-2 w-64 bg-marker-yellow mx-auto mb-12 rounded-full transform -rotate-1"></div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            <Link href="/markets" className="btn-sketch-primary text-2xl px-10 py-5 transform hover:-rotate-2">
              Start Predicting
            </Link>

            <Link href="/how-it-works" className="btn-sketch text-2xl px-10 py-5 transform hover:rotate-2">
              How It Works
            </Link>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-10 left-10 opacity-20 pointer-events-none hidden md:block">
            <svg width="150" height="150" viewBox="0 0 100 100">
              <path d="M10 10 Q 50 50 90 10" stroke="black" fill="none" strokeWidth="2" />
              <path d="M10 30 Q 50 70 90 30" stroke="black" fill="none" strokeWidth="2" />
            </svg>
          </div>

          <div className="absolute bottom-10 right-10 opacity-20 pointer-events-none hidden md:block transform rotate-180">
            <svg width="150" height="150" viewBox="0 0 100 100">
              <path d="M10 10 Q 50 50 90 10" stroke="black" fill="none" strokeWidth="2" />
              <path d="M10 30 Q 50 70 90 30" stroke="black" fill="none" strokeWidth="2" />
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
}
