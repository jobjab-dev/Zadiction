'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Link from 'next/link';
import { FhevmProvider } from 'jobjab-fhevm-sdk/adapters/react';
import { PredictionCard } from '@/components/PredictionCard';
import { MarketStats } from '@/components/MarketStats';
import { ResultsCard } from '@/components/ResultsCard';
import { usePredictionMarket } from '@/hooks/usePredictionMarket';

const NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'sepolia';

function MarketDetailApp({ marketAddress }: { marketAddress: string }) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [userAddress, setUserAddress] = useState<string>();

  const {
    marketInfo,
    participantInfo,
    loading,
    error,
    submitPrediction,
    computeWinner,
    withdraw,
  } = usePredictionMarket(marketAddress, userAddress, provider);

  // Connect wallet
  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask');
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setProvider(provider);
      setUserAddress(address);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  // Auto-connect
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
        if (accounts.length > 0) {
          connectWallet();
        }
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <header className="border-b border-zama-yellow/20 bg-zama-black-light">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/markets" className="flex items-center gap-3">
              <svg className="w-6 h-6 text-zama-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-lg text-gray-400 hover:text-zama-yellow transition-colors">
                Back to Markets
              </span>
            </Link>

            <div className="flex items-center gap-4">
              {userAddress ? (
                <div className="status-encrypted">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="font-mono text-xs">
                    {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                  </span>
                </div>
              ) : (
                <button className="btn-zama" onClick={connectWallet}>
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!userAddress ? (
          /* Not Connected */
          <div className="max-w-2xl mx-auto">
            <div className="card-zama-glow text-center py-12">
              <div className="text-6xl mb-6">🔐</div>
              <h2 className="text-3xl font-bold text-zama-yellow mb-4">
                Connect Wallet
              </h2>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Connect your wallet to make predictions and participate in this market
              </p>
              <button className="btn-zama" onClick={connectWallet}>
                Connect Wallet to Start
              </button>
            </div>
          </div>
        ) : (
          /* Connected - Show Market */
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Contract Info */}
            <div className="card-zama bg-zama-black-lighter/50">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Contract:</span>
                <code className="text-zama-yellow font-mono text-xs">
                  {marketAddress}
                </code>
                <a
                  href={`https://sepolia.etherscan.io/address/${marketAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zama-yellow hover:underline ml-2"
                >
                  View on Etherscan →
                </a>
              </div>
            </div>

            {/* Market Question Header */}
            <div className="card-zama">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-zama rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">❓</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-2">
                    {marketInfo?.question || 'Loading...'}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    This is a confidential prediction market where all predictions are encrypted using FHEVM.
                    Nobody can see individual predictions until after resolution.
                  </p>
                </div>
              </div>
            </div>

            {/* Market Stats */}
            <MarketStats marketInfo={marketInfo} />

            {/* Error Display */}
            {error && (
              <div className="toast toast-error">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Prediction Card */}
              <div>
                <PredictionCard
                  marketInfo={marketInfo}
                  participantInfo={participantInfo}
                  onSubmitPrediction={submitPrediction}
                  loading={loading}
                />
              </div>

              {/* Results Card */}
              <div>
                <ResultsCard
                  marketInfo={marketInfo}
                  participantInfo={participantInfo}
                  onComputeWinner={computeWinner}
                  onWithdraw={withdraw}
                  loading={loading}
                />
              </div>
            </div>

            {/* How It Works */}
            <div className="card-zama">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-zama-yellow">
                  🔐 How Confidential Predictions Work
                </h3>
                <Link 
                  href="/how-it-works"
                  className="text-sm text-zama-yellow hover:underline flex items-center gap-1"
                >
                  Learn More
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4">
                  <div className="text-3xl mb-2">1️⃣</div>
                  <div className="font-bold text-white mb-1">Encrypt</div>
                  <div className="text-sm text-gray-400">
                    Your YES/NO choice is encrypted client-side
                  </div>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl mb-2">2️⃣</div>
                  <div className="font-bold text-white mb-1">Submit</div>
                  <div className="text-sm text-gray-400">
                    Encrypted prediction stored on-chain
                  </div>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl mb-2">3️⃣</div>
                  <div className="font-bold text-white mb-1">Resolve</div>
                  <div className="text-sm text-gray-400">
                    Trusted resolver declares outcome
                  </div>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl mb-2">4️⃣</div>
                  <div className="font-bold text-white mb-1">Compute</div>
                  <div className="text-sm text-gray-400">
                    FHE determines winners
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function MarketPage({ params }: { params: { address: string } }) {
  return (
    <FhevmProvider config={{ network: NETWORK }}>
      <MarketDetailApp marketAddress={params.address} />
    </FhevmProvider>
  );
}

