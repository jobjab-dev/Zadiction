'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Link from 'next/link';
import { useFactory, MarketInfo } from '@/hooks/useFactory';
import { SketchCreate } from '@/components/SketchIcons';
import { EncryptedText } from '@/components/EncryptedText';

// Try to load from deployed contracts or env
let FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || '';

// Try to load from deployment file
if (!FACTORY_ADDRESS) {
  try {
    const deployedContracts = require('@/contracts/deployedContracts.json');
    FACTORY_ADDRESS = deployedContracts.factoryAddress;
  } catch (e) {
    // No deployed contracts yet
  }
}

export default function MarketsPage() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [userAddress, setUserAddress] = useState<string>();
  const [isOwnerUser, setIsOwnerUser] = useState(false);

  const { marketsInfo, isOwner, refreshMarkets } = useFactory(FACTORY_ADDRESS, provider);

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

  // Check if user is owner
  useEffect(() => {
    if (userAddress) {
      isOwner(userAddress).then(setIsOwnerUser);
    }
  }, [userAddress, isOwner]);

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

  // Filter markets
  const activeMarkets = marketsInfo.filter(m => {
    const now = Math.floor(Date.now() / 1000);
    return Number(m.betDeadline) > now && m.isActive;
  });

  const closedMarkets = marketsInfo.filter(m => {
    const now = Math.floor(Date.now() / 1000);
    return Number(m.betDeadline) <= now;
  });

  const getTimeRemaining = (deadline: bigint) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = Number(deadline) - now;

    if (diff <= 0) return 'Closed';

    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);

    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header Section */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-ink mb-2 break-words" style={{ fontFamily: 'Marker Felt, Comic Sans MS, sans-serif' }}>
              <EncryptedText text="Prediction Markets" hoverOnly={false} animateOnView={true} />
            </h1>
            <div className="h-2 w-32 bg-marker-yellow rounded-full transform -rotate-1"></div>
          </div>

          <Link href="/create" className="btn-sketch-primary text-center text-sm md:text-base py-3 px-4 md:px-6 w-full md:w-auto">
            + Create Lottery Round
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card-sketch bg-white transform rotate-1">
            <div className="text-4xl font-bold text-ink mb-1">{marketsInfo.length}</div>
            <div className="text-gray-500 font-bold">Total Rounds</div>
          </div>
          <div className="card-sketch bg-white transform -rotate-1">
            <div className="text-4xl font-bold text-green-600 mb-1">{activeMarkets.length}</div>
            <div className="text-gray-500 font-bold">Active</div>
          </div>
          <div className="card-sketch bg-white transform rotate-1">
            <div className="text-4xl font-bold text-gray-400 mb-1">{closedMarkets.length}</div>
            <div className="text-gray-500 font-bold">Closed</div>
          </div>
        </div>

        {/* Active Markets */}
        {activeMarkets.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-ink">
                <EncryptedText text="Open Rounds" hoverOnly={false} animateOnView={true} />
              </h2>
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeMarkets.map((market, i) => (
                <MarketCard
                  key={market.marketAddress}
                  market={market}
                  timeRemaining={getTimeRemaining(market.betDeadline)}
                  rotate={i % 2 === 0 ? 1 : -1}
                />
              ))}
            </div>
          </section>
        )}

        {/* Closed Markets */}
        {closedMarkets.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-500 mb-6">
              <EncryptedText text="Past Rounds" hoverOnly={false} animateOnView={true} />
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80">
              {closedMarkets.map((market, i) => (
                <MarketCard
                  key={market.marketAddress}
                  market={market}
                  timeRemaining="Closed"
                  rotate={i % 2 === 0 ? -1 : 1}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {marketsInfo.length === 0 && (
          <div className="card-sketch text-center py-20">
            <div className="flex justify-center mb-6 opacity-50">
              <SketchCreate className="w-24 h-24 text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-ink mb-4">
              <EncryptedText text="No Rounds Yet" hoverOnly={false} animateOnView={true} />
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              The paper is blank! Wait for new rounds to be created or create one yourself.
            </p>
            <Link href="/create" className="btn-sketch-primary">
              Create First Round
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function MarketCard({ market, timeRemaining, rotate }: { market: MarketInfo; timeRemaining: string; rotate: number }) {
  const isClosed = timeRemaining === 'Closed';

  return (
    <Link href={`/market/${market.marketAddress}`}>
      <div
        className="card-sketch-hover h-full flex flex-col justify-between group"
        style={{ transform: `rotate(${rotate}deg)` }}
      >
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className={`badge-sketch ${isClosed ? 'badge-closed' : 'badge-active'}`}>
              {isClosed ? 'Closed' : 'Active'}
            </span>
            <span className="text-xs font-bold text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
              {timeRemaining}
            </span>
          </div>

          <h3 className="text-xl font-bold text-ink mb-2 group-hover:text-ink-light transition-colors">
            <EncryptedText text={`Round #${market.roundId.toString()}`} hoverOnly={false} animateOnView={true} />
          </h3>

          <div className="flex gap-2 mb-4">
            <span className="badge-sketch bg-blue-100 text-blue-800 text-xs">
              {market.digits.toString()} Digits
            </span>
            <span className="badge-sketch bg-purple-100 text-purple-800 text-xs">
              Fee: {(Number(market.feePercent) / 100).toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="border-t-2 border-dashed border-ink/10 pt-4 mt-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Collateral</p>
              <p className="text-ink font-bold highlight-marker">
                {ethers.formatEther(market.collateral)} ETH
              </p>
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-ink flex items-center justify-center group-hover:bg-marker-yellow transition-colors">
              <svg className="w-4 h-4 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
