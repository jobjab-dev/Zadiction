'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Link from 'next/link';
import { useFactory, MarketInfo } from '@/hooks/useFactory';

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
    return Number(m.commitDeadline) > now && m.isActive;
  });

  const closedMarkets = marketsInfo.filter(m => {
    const now = Math.floor(Date.now() / 1000);
    return Number(m.commitDeadline) <= now;
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
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <header className="border-b border-zama-yellow/20 bg-zama-black-light">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-zama rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-zama-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-xl font-bold text-zama-yellow">All Markets</span>
            </div>
            <div className="flex items-center gap-4">
              {isOwnerUser && (
                <Link href="/admin/create" className="btn-zama">
                  + Create Market
                </Link>
              )}
              {userAddress ? (
                <div className="status-encrypted text-xs">
                  {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                </div>
              ) : (
                <button className="btn-zama-outline" onClick={connectWallet}>
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="stat-box">
            <div className="stat-value">{marketsInfo.length}</div>
            <div className="stat-label">Total Markets</div>
          </div>
          <div className="stat-box">
            <div className="stat-value text-green-400">{activeMarkets.length}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-box">
            <div className="stat-value text-gray-400">{closedMarkets.length}</div>
            <div className="stat-label">Closed</div>
          </div>
        </div>

        {/* Active Markets */}
        {activeMarkets.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-zama-yellow mb-6">
              🟢 Active Markets
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {activeMarkets.map((market) => (
                <MarketCard key={market.marketAddress} market={market} timeRemaining={getTimeRemaining(market.commitDeadline)} />
              ))}
            </div>
          </section>
        )}

        {/* Closed Markets */}
        {closedMarkets.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-400 mb-6">
              ⏸️ Closed Markets
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {closedMarkets.map((market) => (
                <MarketCard key={market.marketAddress} market={market} timeRemaining="Closed" />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {marketsInfo.length === 0 && (
          <div className="card-zama text-center py-12">
            <div className="text-6xl mb-6">📭</div>
            <h3 className="text-2xl font-bold text-white mb-4">
              No Markets Yet
            </h3>
            <p className="text-gray-400 mb-6">
              {isOwnerUser 
                ? 'Create your first prediction market to get started!'
                : 'No prediction markets available yet. Check back soon!'}
            </p>
            {isOwnerUser && (
              <Link href="/admin/create" className="btn-zama">
                Create First Market
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function MarketCard({ market, timeRemaining }: { market: MarketInfo; timeRemaining: string }) {
  const isClosed = timeRemaining === 'Closed';

  return (
    <Link href={`/market/${market.marketAddress}`}>
      <div className="card-zama hover:border-zama-yellow/60 transition-all cursor-pointer group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {isClosed ? (
                <span className="phase-badge bg-gray-500/10 border-gray-500 text-gray-400 text-xs">
                  Closed
                </span>
              ) : (
                <span className="phase-badge phase-commit text-xs">
                  Active
                </span>
              )}
              <span className="text-xs text-gray-500">
                {timeRemaining}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-zama-yellow transition-colors">
              {market.question}
            </h3>
          </div>
          <svg className="w-6 h-6 text-gray-600 group-hover:text-zama-yellow transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Stake</p>
            <p className="text-zama-yellow font-bold">
              {ethers.formatEther(market.stakeAmount)} ETH
            </p>
          </div>
          <div>
            <p className="text-gray-500">Resolver</p>
            <p className="text-white font-mono text-xs">
              {market.resolver.slice(0, 6)}...
            </p>
          </div>
          <div>
            <p className="text-gray-500">Created</p>
            <p className="text-white text-xs">
              {new Date(Number(market.createdAt) * 1000).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

