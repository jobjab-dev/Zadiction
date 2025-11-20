'use client';

import Link from 'next/link';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <header className="border-b border-zama-yellow/20 bg-zama-black-light">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-zama rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-zama-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-zama-yellow">Zadiction</span>
            </Link>
            <Link href="/" className="btn-zama-outline">
              Back to Market
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-zama-yellow mb-4">
            How It Works
          </h1>
          <p className="text-xl text-gray-400">
            Simple, fair, and completely confidential
          </p>
        </div>

        {/* Flow Diagram */}
        <section className="card-zama-glow mb-12">
          <h2 className="text-2xl font-bold text-zama-yellow mb-6">📊 Market Flow</h2>
          
          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex items-start gap-4 p-4 bg-zama-black-lighter rounded-lg border border-zama-yellow/30">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-zama rounded-full flex items-center justify-center text-zama-black font-bold text-xl">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">Creator Creates Market</h3>
                <p className="text-gray-400 text-sm">
                  Set question, stake amount (e.g. 0.01 ETH), deadline, and resolver
                </p>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <svg className="w-6 h-6 text-zama-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4 p-4 bg-zama-black-lighter rounded-lg border border-blue-500/30">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">Players Make Predictions</h3>
                <p className="text-gray-400 text-sm mb-2">
                  Each player pays <span className="text-zama-yellow font-bold">same stake</span> + choose <span className="text-green-400">YES</span> or <span className="text-red-400">NO</span>
                </p>
                <div className="text-encrypted text-xs">
                  🔐 All predictions encrypted - nobody can see them!
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <svg className="w-6 h-6 text-zama-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4 p-4 bg-zama-black-lighter rounded-lg border border-orange-500/30">
              <div className="flex-shrink-0 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">Market Locks & Resolves</h3>
                <p className="text-gray-400 text-sm">
                  Deadline passes → Resolver declares outcome (true/false)
                </p>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <svg className="w-6 h-6 text-zama-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-4 p-4 bg-zama-black-lighter rounded-lg border border-green-500/30">
              <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">Compute Winners (FHE Magic)</h3>
                <p className="text-gray-400 text-sm mb-2">
                  Smart contract uses FHE to determine winners WITHOUT decrypting predictions
                </p>
                <code className="text-xs text-zama-yellow bg-zama-black px-2 py-1 rounded">
                  isWinner = outcome ? prediction : NOT(prediction)
                </code>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <svg className="w-6 h-6 text-zama-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>

            {/* Step 5 */}
            <div className="flex items-start gap-4 p-4 bg-zama-black-lighter rounded-lg border border-zama-yellow/50">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-zama rounded-full flex items-center justify-center text-zama-black font-bold text-xl">
                5
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">Winners Withdraw</h3>
                <p className="text-gray-400 text-sm">
                  Winners split the prize pool equally 💰
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Money Flow */}
        <section className="card-zama mb-12">
          <h2 className="text-2xl font-bold text-zama-yellow mb-6">💰 Money Calculation</h2>

          {/* Formula */}
          <div className="bg-zama-black-lighter p-6 rounded-lg border border-zama-yellow/30 mb-6">
            <h3 className="text-lg font-bold text-white mb-4">📐 Formulas</h3>
            <div className="space-y-3 font-mono text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-gray-400">1. Total Pool:</span>
                <span className="text-zama-yellow">totalPool = participants × stakeAmount</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-400">2. Creator Fee:</span>
                <span className="text-zama-yellow">creatorFee = totalPool × (feePercent / 100)</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-400">3. Prize Pool:</span>
                <span className="text-zama-yellow">prizePool = totalPool - creatorFee</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-400">4. Per Winner:</span>
                <span className="text-zama-yellow">payout = prizePool / winnerCount</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-400">5. Profit:</span>
                <span className="text-green-400">profit = payout - stakeAmount</span>
              </div>
            </div>
          </div>

          {/* Example */}
          <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 p-6 rounded-lg border border-zama-yellow/20">
            <h3 className="text-lg font-bold text-white mb-4">📊 Example</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h4 className="text-sm font-bold text-gray-400 mb-2">Setup</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Stake: <span className="text-zama-yellow">0.01 ETH</span></li>
                  <li>• Fee: <span className="text-zama-yellow">2%</span></li>
                  <li>• Total: <span className="text-white font-bold">10 players</span></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-400 mb-2">Predictions</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• <span className="text-green-400">6 chose YES</span></li>
                  <li>• <span className="text-red-400">4 chose NO</span></li>
                  <li>• Outcome: <span className="text-green-400 font-bold">YES wins!</span></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-zama-yellow/20 pt-4">
              <h4 className="text-sm font-bold text-white mb-3">Calculation:</h4>
              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Pool:</span>
                  <span className="text-white">10 × 0.01 = <span className="text-zama-yellow">0.1 ETH</span></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Creator Fee:</span>
                  <span className="text-white">0.1 × 2% = <span className="text-zama-yellow">0.002 ETH</span></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Prize Pool:</span>
                  <span className="text-white">0.1 - 0.002 = <span className="text-zama-yellow">0.098 ETH</span></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Per Winner:</span>
                  <span className="text-white">0.098 ÷ 6 = <span className="text-green-400 font-bold">0.0163 ETH</span></span>
                </div>
              </div>
            </div>

            <div className="border-t border-zama-yellow/20 pt-4 mt-4">
              <h4 className="text-sm font-bold text-white mb-3">Results:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✅</span>
                  <span className="text-gray-300">6 winners get <span className="text-green-400 font-bold">0.0163 ETH</span> each</span>
                  <span className="text-green-400 text-xs">(+63% profit)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-400">❌</span>
                  <span className="text-gray-300">4 losers lose <span className="text-red-400 font-bold">0.01 ETH</span></span>
                  <span className="text-red-400 text-xs">(-100%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zama-yellow">💰</span>
                  <span className="text-gray-300">Creator gets <span className="text-zama-yellow font-bold">0.002 ETH</span> fee</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Points */}
        <section className="card-zama mb-12">
          <h2 className="text-2xl font-bold text-zama-yellow mb-6">🎯 Key Points</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <h3 className="text-lg font-bold text-green-400 mb-2">✅ If You Win</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Get back your stake</li>
                <li>• Plus share of losers' money</li>
                <li>• More losers = more profit</li>
                <li>• Fewer winners = bigger payout</li>
              </ul>
            </div>

            <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
              <h3 className="text-lg font-bold text-red-400 mb-2">❌ If You Lose</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Lose entire stake</li>
                <li>• Your money goes to winners</li>
                <li>• Cannot withdraw</li>
                <li>• Try again next market!</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 p-4 bg-zama-yellow/10 rounded-lg border border-zama-yellow/30">
            <h3 className="text-lg font-bold text-zama-yellow mb-2">💡 Important</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• <span className="font-bold text-white">Fixed Stake:</span> Everyone pays the same amount</li>
              <li>• <span className="font-bold text-white">Winner-Takes-All:</span> Winners split the entire pool</li>
              <li>• <span className="font-bold text-white">Encrypted:</span> Nobody sees predictions until resolution</li>
              <li>• <span className="font-bold text-white">Fair:</span> No front-running or manipulation</li>
            </ul>
          </div>
        </section>

        {/* FAQ */}
        <section className="card-zama mb-12">
          <h2 className="text-2xl font-bold text-zama-yellow mb-6">❓ Quick FAQ</h2>
          
          <div className="space-y-4">
            <details className="group">
              <summary className="cursor-pointer p-4 bg-zama-black-lighter rounded-lg border border-zama-yellow/20 font-bold text-white hover:border-zama-yellow/40 transition-colors">
                What if everyone picks the same side?
              </summary>
              <div className="mt-2 p-4 text-gray-400 text-sm">
                If everyone picks YES and YES wins, everyone gets their money back (minus small fee). Profit is minimal but you don't lose!
              </div>
            </details>

            <details className="group">
              <summary className="cursor-pointer p-4 bg-zama-black-lighter rounded-lg border border-zama-yellow/20 font-bold text-white hover:border-zama-yellow/40 transition-colors">
                What if nobody wins?
              </summary>
              <div className="mt-2 p-4 text-gray-400 text-sm">
                Rare case! Pool stays in contract. There's an emergency refund function for such situations.
              </div>
            </details>

            <details className="group">
              <summary className="cursor-pointer p-4 bg-zama-black-lighter rounded-lg border border-zama-yellow/20 font-bold text-white hover:border-zama-yellow/40 transition-colors">
                Can I see others' predictions?
              </summary>
              <div className="mt-2 p-4 text-gray-400 text-sm">
                <span className="text-zama-yellow font-bold">NO!</span> That's the magic of FHE. All predictions are encrypted. Even on blockchain explorer, you only see ciphertext. 🔐
              </div>
            </details>

            <details className="group">
              <summary className="cursor-pointer p-4 bg-zama-black-lighter rounded-lg border border-zama-yellow/20 font-bold text-white hover:border-zama-yellow/40 transition-colors">
                Who is the Creator?
              </summary>
              <div className="mt-2 p-4 text-gray-400 text-sm">
                The person who deploys the market. They set the question, stake amount, and deadline. They earn a small fee (default 2%) but don't participate in predictions.
              </div>
            </details>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link href="/" className="btn-zama inline-flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Market
          </Link>
          <p className="text-gray-500 text-sm mt-4">
            Ready to make your encrypted prediction?
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zama-yellow/20 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            Built with <span className="text-zama-yellow">❤️</span> using Zama FHEVM
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Fully Homomorphic Encryption for True Privacy
          </p>
        </div>
      </footer>
    </div>
  );
}

