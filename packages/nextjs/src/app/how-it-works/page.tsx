'use client';

import Link from 'next/link';
import { EncryptedText } from '../../components/EncryptedText';
import {
  SketchScale,
  SketchShield,
  SketchSearch,
  SketchCreate,
  SketchGrid,
  SketchTrophy,
  SketchSparkles,
  SketchBook,
  SketchMath,
  SketchChart,
  SketchBulb,
  SketchDice,
  SketchMoneyBag
} from '../../components/SketchIcons';

export default function HowItWorksPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Title */}
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold text-ink mb-4 transform -rotate-1">
          <EncryptedText text="How It Works" hoverOnly={false} animateOnView={true} />
        </h1>
        <p className="text-xl text-gray-600 font-medium">
          Transparent Linear-Capped Lottery AMM
        </p>
        <div className="h-2 w-32 bg-marker-yellow mx-auto mt-4 rounded-full transform rotate-1"></div>
      </div>

      {/* Concept Section - 3 Cards */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-ink mb-8 text-center transform -rotate-1 flex items-center justify-center gap-3">
          <SketchSparkles className="w-8 h-8 text-ink" />
          <EncryptedText text="The Concept" hoverOnly={false} animateOnView={true} />
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Dynamic Odds */}
          <div className="card-sketch bg-white text-center hover:shadow-sketch-hover transition-all duration-300 group">
            <div className="relative w-32 h-32 mx-auto mb-4 flex items-center justify-center">
              <SketchScale className="w-24 h-24 text-ink group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="text-xl font-bold text-ink mb-2">
              <EncryptedText text="Dynamic Odds" hoverOnly={false} animateOnView={true} />
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Odds decrease as more people bet on the same number, just like an AMM!
            </p>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-marker-yellow rounded-full transform rotate-12 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>

          {/* Card 2: 100% Solvent */}
          <div className="card-sketch bg-white text-center hover:shadow-sketch-hover transition-all duration-300 group">
            <div className="relative w-32 h-32 mx-auto mb-4 flex items-center justify-center">
              <SketchShield className="w-24 h-24 text-ink group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="text-xl font-bold text-ink mb-2">
              <EncryptedText text="100% Solvent" hoverOnly={false} animateOnView={true} />
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              The system never accepts a bet it can't pay out. Guaranteed!
            </p>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-200 rounded-full transform rotate-12 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>

          {/* Card 3: Transparent */}
          <div className="card-sketch bg-white text-center hover:shadow-sketch-hover transition-all duration-300 group">
            <div className="relative w-32 h-32 mx-auto mb-4 flex items-center justify-center">
              <SketchSearch className="w-24 h-24 text-ink group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="text-xl font-bold text-ink mb-2">
              <EncryptedText text="Transparent" hoverOnly={false} animateOnView={true} />
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              All math and funds are on-chain. Random numbers secured by FHE!
            </p>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-200 rounded-full transform rotate-12 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>
      </section>

      {/* Game Flow - Comic Strip Style */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-ink mb-8 text-center transform rotate-1 flex items-center justify-center gap-3">
          <SketchBook className="w-8 h-8 text-ink" />
          <EncryptedText text="Game Flow" hoverOnly={false} animateOnView={true} />
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="relative">
            <div className="card-sketch bg-white relative group hover:shadow-sketch-hover transition-all duration-300">
              {/* Step Number Badge */}
              <div className="absolute -top-3 -left-3 w-12 h-12 bg-marker-yellow border-2 border-ink rounded-full flex items-center justify-center text-ink font-bold text-xl shadow-sketch z-10 transform -rotate-12 group-hover:rotate-0 transition-transform">
                1
              </div>

              {/* Illustration */}
              <div className="relative w-full h-48 mb-4 flex items-center justify-center bg-paper-dark/30 overflow-hidden">
                <SketchCreate className="w-32 h-32 text-ink group-hover:scale-110 transition-transform duration-300" />
              </div>

              {/* Content */}
              <div className="p-6 pt-0">
                <h3 className="text-xl font-bold text-ink mb-2">
                  <EncryptedText text="Create Round" hoverOnly={false} animateOnView={true} />
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Creator deposits collateral and sets parameters (digits, initial odds)
                </p>
              </div>

              {/* Decorative arrow */}
              <div className="hidden md:block absolute -right-8 top-1/2 transform -translate-y-1/2 text-gray-300 text-4xl">
                →
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div className="card-sketch bg-white relative group hover:shadow-sketch-hover transition-all duration-300">
              {/* Step Number Badge */}
              <div className="absolute -top-3 -left-3 w-12 h-12 bg-marker-yellow border-2 border-ink rounded-full flex items-center justify-center text-ink font-bold text-xl shadow-sketch z-10 transform -rotate-12 group-hover:rotate-0 transition-transform">
                2
              </div>

              {/* Illustration */}
              <div className="relative w-full h-48 mb-4 flex items-center justify-center bg-paper-dark/30 overflow-hidden">
                <SketchGrid className="w-32 h-32 text-ink group-hover:scale-110 transition-transform duration-300" />
              </div>

              {/* Content */}
              <div className="p-6 pt-0">
                <h3 className="text-xl font-bold text-ink mb-2">
                  <EncryptedText text="Place Bets" hoverOnly={false} animateOnView={true} />
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Players pick numbers. Odds are locked at the moment of betting
                </p>
              </div>

              {/* Decorative arrow */}
              <div className="hidden md:block absolute -right-8 top-1/2 transform -translate-y-1/2 text-gray-300 text-4xl">
                →
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative">
            <div className="card-sketch bg-white relative group hover:shadow-sketch-hover transition-all duration-300">
              {/* Step Number Badge */}
              <div className="absolute -top-3 -left-3 w-12 h-12 bg-marker-yellow border-2 border-ink rounded-full flex items-center justify-center text-ink font-bold text-xl shadow-sketch z-10 transform -rotate-12 group-hover:rotate-0 transition-transform">
                3
              </div>

              {/* Illustration */}
              <div className="relative w-full h-48 mb-4 flex items-center justify-center bg-paper-dark/30 overflow-hidden">
                <SketchTrophy className="w-32 h-32 text-ink group-hover:scale-110 transition-transform duration-300" />
              </div>

              {/* Content */}
              <div className="p-6 pt-0">
                <h3 className="text-xl font-bold text-ink mb-2">
                  <EncryptedText text="Draw & Claim" hoverOnly={false} animateOnView={true} />
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Winning number is drawn. Winners claim payouts anytime!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Math Section - Sticky Note Style */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-ink mb-8 text-center transform -rotate-1 flex items-center justify-center gap-3">
          <SketchMath className="w-8 h-8 text-ink" />
          <EncryptedText text="The Math" hoverOnly={false} animateOnView={true} />
        </h2>

        <div className="card-sketch bg-yellow-50 border-2 border-yellow-200 relative">
          {/* Decorative tape */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-yellow-100/80 border border-yellow-200/50 shadow-sm"></div>

          <div className="p-8">
            {/* Formula */}
            <div className="bg-white p-6 rounded-sketch-sm border-2 border-ink/10 font-mono text-sm md:text-base mb-6 overflow-x-auto">
              <p className="text-gray-500 mb-2">
                // Odds Formula
              </p>
              <p className="text-ink font-bold text-lg">
                Odds = Max(MinOdds, InitialOdds × (1 - Exposure ÷ Limit))
              </p>
            </div>

            {/* Definitions */}
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <SketchMoneyBag className="w-8 h-8 text-ink flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-ink mb-1">
                    <EncryptedText text="Limit (L)" hoverOnly={false} animateOnView={true} />
                  </h4>
                  <p className="text-gray-600 text-sm">
                    The maximum payout the pool can afford = Collateral × (1 - Fee)
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <SketchChart className="w-8 h-8 text-ink flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-ink mb-1">
                    <EncryptedText text="Exposure (E)" hoverOnly={false} animateOnView={true} />
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Total amount the pool must pay if a specific number wins
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <SketchBulb className="w-8 h-8 text-ink flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-ink mb-1">
                    <EncryptedText text="Result" hoverOnly={false} animateOnView={true} />
                  </h4>
                  <p className="text-gray-600 text-sm">
                    More bets on "77" → Higher Exposure → Lower Odds → Pool stays solvent!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="text-center">
        <Link
          href="/markets"
          className="btn-sketch-primary inline-flex items-center gap-3 text-xl px-8 py-4 transform hover:-rotate-1 hover:scale-105 transition-all duration-300"
        >
          <SketchDice className="w-8 h-8" />
          Browse Markets
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </main>
  );
}
