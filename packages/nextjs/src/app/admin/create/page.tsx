'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Link from 'next/link';
import { useFactory } from '@/hooks/useFactory';

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

export default function CreateMarketPage() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [userAddress, setUserAddress] = useState<string>();
  const [isOwnerUser, setIsOwnerUser] = useState(false);

  const { createMarket, isOwner, loading, owner } = useFactory(FACTORY_ADDRESS, provider);

  // Form state
  const [question, setQuestion] = useState('');
  const [stakeAmount, setStakeAmount] = useState('0.01');
  const [commitPeriodDays, setCommitPeriodDays] = useState(7);
  const [resolvePeriodDays, setResolvePeriodDays] = useState(3);
  const [resolverAddress, setResolverAddress] = useState('');
  const [creatorFeePercent, setCreatorFeePercent] = useState(2);

  const [success, setSuccess] = useState(false);
  const [createdMarketAddress, setCreatedMarketAddress] = useState('');

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
      setResolverAddress(address); // Default to user address
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

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim()) {
      alert('Please enter a question');
      return;
    }

    if (!resolverAddress || !ethers.isAddress(resolverAddress)) {
      alert('Please enter a valid resolver address');
      return;
    }

    try {
      setSuccess(false);
      const result = await createMarket({
        question,
        stakeAmount,
        commitPeriodDays,
        resolvePeriodDays,
        resolverAddress,
        creatorFeePercent,
      });

      setSuccess(true);
      setCreatedMarketAddress(result.marketAddress);

      // Reset form
      setQuestion('');
      setStakeAmount('0.01');
      setCommitPeriodDays(7);
      setResolvePeriodDays(3);
      setCreatorFeePercent(2);
    } catch (error) {
      console.error('Failed to create market:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <header className="border-b border-zama-yellow/20 bg-zama-black-light">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/markets" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-zama rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-zama-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-xl font-bold text-zama-yellow">Create Market</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/markets" className="btn-zama-outline">
                View Markets
              </Link>
              {userAddress && (
                <div className="status-encrypted text-xs">
                  {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        {!userAddress ? (
          /* Not Connected */
          <div className="card-zama-glow text-center py-12">
            <div className="text-6xl mb-6">🔐</div>
            <h2 className="text-3xl font-bold text-zama-yellow mb-4">
              Connect Wallet
            </h2>
            <p className="text-gray-400 mb-6">
              Connect your wallet to create prediction markets
            </p>
            <button className="btn-zama" onClick={connectWallet}>
              Connect Wallet
            </button>
          </div>
        ) : !isOwnerUser ? (
          /* Not Owner */
          <div className="card-zama text-center py-12">
            <div className="text-6xl mb-6">🚫</div>
            <h2 className="text-2xl font-bold text-red-400 mb-4">
              Unauthorized
            </h2>
            <p className="text-gray-400 mb-6">
              Only the factory owner can create markets
            </p>
            <div className="text-sm text-gray-500">
              <p>Your address: {userAddress}</p>
              <p>Owner: {owner}</p>
            </div>
            <Link href="/markets" className="btn-zama-outline mt-6 inline-block">
              View Markets
            </Link>
          </div>
        ) : success ? (
          /* Success */
          <div className="card-zama-glow text-center py-12">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-zama-yellow mb-4">
              Market Created!
            </h2>
            <p className="text-gray-400 mb-6">
              Your prediction market has been deployed successfully
            </p>
            <div className="bg-zama-black-lighter p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-400 mb-1">Contract Address:</p>
              <p className="text-zama-yellow font-mono text-sm break-all">
                {createdMarketAddress}
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                className="btn-zama"
                onClick={() => {
                  setSuccess(false);
                  setCreatedMarketAddress('');
                }}
              >
                Create Another
              </button>
              <Link href={`/market/${createdMarketAddress}`} className="btn-zama-outline">
                View Market
              </Link>
            </div>
          </div>
        ) : (
          /* Create Form */
          <div className="card-zama-glow">
            <h2 className="text-2xl font-bold text-zama-yellow mb-6">
              📝 Create New Market
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Question */}
              <div>
                <label className="block text-white font-bold mb-2">
                  Prediction Question *
                </label>
                <textarea
                  className="input-zama h-24 resize-none"
                  placeholder="e.g., Will Bitcoin reach $100,000 by end of 2024?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Make it clear and verifiable
                </p>
              </div>

              {/* Stake Amount */}
              <div>
                <label className="block text-white font-bold mb-2">
                  Stake Amount (ETH) *
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  className="input-zama"
                  placeholder="0.01"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Amount each participant must stake
                </p>
              </div>

              {/* Periods */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-bold mb-2">
                    Commit Period (days) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="input-zama"
                    placeholder="7"
                    value={commitPeriodDays}
                    onChange={(e) => setCommitPeriodDays(Number(e.target.value))}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    How long to accept predictions
                  </p>
                </div>

                <div>
                  <label className="block text-white font-bold mb-2">
                    Resolve Period (days) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="input-zama"
                    placeholder="3"
                    value={resolvePeriodDays}
                    onChange={(e) => setResolvePeriodDays(Number(e.target.value))}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Time to resolve outcome
                  </p>
                </div>
              </div>

              {/* Resolver */}
              <div>
                <label className="block text-white font-bold mb-2">
                  Resolver Address *
                </label>
                <input
                  type="text"
                  className="input-zama font-mono text-sm"
                  placeholder="0x..."
                  value={resolverAddress}
                  onChange={(e) => setResolverAddress(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Address that can resolve the outcome (defaults to you)
                </p>
              </div>

              {/* Creator Fee */}
              <div>
                <label className="block text-white font-bold mb-2">
                  Creator Fee (%) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  className="input-zama"
                  placeholder="2"
                  value={creatorFeePercent}
                  onChange={(e) => setCreatorFeePercent(Number(e.target.value))}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your fee from the total pool (max 5%)
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn-zama w-full py-4 text-lg"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="spinner-zama"></div>
                    Creating Market...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Market
                  </span>
                )}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

