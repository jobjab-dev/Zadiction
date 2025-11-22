'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useFactory } from '@/hooks/useFactory';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { EncryptedText } from '@/components/EncryptedText';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useToast } from '@/components/Toast';

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
  const { address: userAddress, isConnected } = useAccount();
  const signer = useEthersSigner();
  const { showToast } = useToast();
  const [isOwnerUser, setIsOwnerUser] = useState(false);

  // We pass the signer directly to useFactory
  const { createMarket, isOwner, loading, owner } = useFactory(FACTORY_ADDRESS, signer);

  // Form state
  const [digits, setDigits] = useState(2);
  const [collateral, setCollateral] = useState('0.1');
  const [initialOdds, setInitialOdds] = useState(100);
  const [minOdds, setMinOdds] = useState(2);
  const [commitPeriodDays, setCommitPeriodDays] = useState(7);
  const [creatorFeePercent, setCreatorFeePercent] = useState(3);

  const [success, setSuccess] = useState(false);
  const [createdMarketAddress, setCreatedMarketAddress] = useState('');

  // Check if user is owner
  useEffect(() => {
    if (userAddress) {
      isOwner(userAddress).then(setIsOwnerUser);
    }
  }, [userAddress, isOwner]);

  // Calculate minimum fair odds
  const minFairOdds = digits === 2 ? 100 : 1000;

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (Number(collateral) <= 0) {
      showToast('Collateral must be greater than 0', 'warning');
      return;
    }

    // Validate fair odds
    if (initialOdds < minFairOdds) {
      showToast(`Initial odds must be at least ${minFairOdds}x for ${digits} digits (fair odds)`, 'warning');
      return;
    }

    try {
      setSuccess(false);
      const result = await createMarket({
        digits,
        betPeriodDays: commitPeriodDays,
        initialOdds,
        minOdds,
        creatorFeePercent,
        collateral,
      });

      setSuccess(true);
      setCreatedMarketAddress(result.marketAddress);

      // Reset form defaults
      setCollateral('0.1');
      setInitialOdds(minFairOdds);
      setCommitPeriodDays(7);
    } catch (error) {
      console.error('Failed to create market:', error);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-ink mb-4 transform -rotate-1">
            <EncryptedText text="Create Lottery Round" hoverOnly={false} animateOnView={true} />
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            Launch a new Linear-Capped AMM Pool
          </p>
          <div className="h-2 w-32 bg-marker-yellow mx-auto mt-4 rounded-full transform rotate-1"></div>
        </div>

        {!isConnected ? (
          /* Not Connected */
          <div className="card-sketch text-center py-12 bg-white">
            <div className="text-6xl mb-6">🔐</div>
            <h2 className="text-3xl font-bold text-ink mb-4">
              <EncryptedText text="Connect Wallet" hoverOnly={false} animateOnView={true} />
            </h2>
            <p className="text-gray-600 mb-6">
              Connect your wallet to create a lottery pool
            </p>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </div>
        ) : success ? (
          /* Success */
          <div className="card-sketch text-center py-12 bg-white border-green-200">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-ink mb-4">
              <EncryptedText text="Round Created!" hoverOnly={false} animateOnView={true} />
            </h2>
            <p className="text-gray-600 mb-6">
              Your lottery pool has been deployed successfully.
            </p>
            <div className="bg-paper-dark p-4 rounded-sketch-sm mb-6 border-2 border-ink/10">
              <p className="text-sm text-gray-500 mb-1 font-bold">Contract Address:</p>
              <p className="text-ink font-mono text-sm break-all bg-marker-yellow/20 p-2 rounded">
                {createdMarketAddress}
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                className="btn-sketch-primary"
                onClick={() => {
                  setSuccess(false);
                  setCreatedMarketAddress('');
                }}
              >
                Create Another
              </button>
              <Link href={`/market/${createdMarketAddress}`} className="btn-sketch">
                View Pool
              </Link>
            </div>
          </div>
        ) : (
          /* Create Form */
          <div className="card-sketch bg-white relative">
            {/* Decorative tape */}
            <div className="absolute -top-3 right-10 w-24 h-8 bg-blue-100/80 rotate-2 shadow-sm border border-blue-200/50"></div>

            <h2 className="text-2xl font-bold text-ink mb-6 flex items-center gap-2">
              <EncryptedText text="Pool Configuration" hoverOnly={false} animateOnView={true} />
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Digits Selection */}
              <div>
                <label className="block text-ink font-bold mb-2">
                  <EncryptedText text="Lottery Type" hoverOnly={false} animateOnView={true} />
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setDigits(2);
                      setInitialOdds(100);
                    }}
                    className={`flex-1 py-3 border-2 rounded-sketch-sm font-bold transition-all ${digits === 2
                      ? 'bg-marker-yellow border-ink shadow-sketch-sm transform -translate-y-1'
                      : 'bg-white border-gray-200 text-gray-400 hover:border-ink/50'
                      }`}
                  >
                    2 Digits (00-99)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDigits(3);
                      setInitialOdds(1000);
                    }}
                    className={`flex-1 py-3 border-2 rounded-sketch-sm font-bold transition-all ${digits === 3
                      ? 'bg-marker-yellow border-ink shadow-sketch-sm transform -translate-y-1'
                      : 'bg-white border-gray-200 text-gray-400 hover:border-ink/50'
                      }`}
                  >
                    3 Digits (000-999)
                  </button>
                </div>
              </div>

              {/* Collateral */}
              <div>
                <label className="block text-ink font-bold mb-2">
                  <EncryptedText text="Collateral Amount (ETH) *" hoverOnly={false} animateOnView={true} />
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    className="input-sketch pl-12"
                    placeholder="0.1"
                    value={collateral}
                    onChange={(e) => setCollateral(e.target.value)}
                    required
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 font-bold text-gray-400">
                    ETH
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1 font-bold">
                  This determines the Liability Limit (L)
                </p>
              </div>

              {/* Odds Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-ink font-bold mb-2">
                    <EncryptedText text="Initial Odds (o0) *" hoverOnly={false} animateOnView={true} />
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={minFairOdds}
                      className="input-sketch pr-8"
                      placeholder={minFairOdds.toString()}
                      value={initialOdds}
                      onChange={(e) => setInitialOdds(Number(e.target.value))}
                      required
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 font-bold text-gray-400">
                      x
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 font-bold">
                    Must be ≥ {minFairOdds}x (fair odds)
                  </p>
                </div>

                <div>
                  <label className="block text-ink font-bold mb-2">
                    <EncryptedText text="Minimum Odds (omin) *" hoverOnly={false} animateOnView={true} />
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      className="input-sketch pr-8"
                      placeholder="2"
                      value={minOdds}
                      onChange={(e) => setMinOdds(Number(e.target.value))}
                      required
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 font-bold text-gray-400">
                      x
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 font-bold">
                    Floor for dynamic odds
                  </p>
                </div>
              </div>

              {/* Betting Period */}
              <div>
                <label className="block text-ink font-bold mb-2">
                  <EncryptedText text="Betting Window (days) *" hoverOnly={false} animateOnView={true} />
                </label>
                <input
                  type="number"
                  min="1"
                  className="input-sketch"
                  placeholder="7"
                  value={commitPeriodDays}
                  onChange={(e) => setCommitPeriodDays(Number(e.target.value))}
                  required
                />
                <p className="text-xs text-gray-500 mt-1 font-bold">
                  Duration for placing bets
                </p>
              </div>

              {/* Creator Fee */}
              <div>
                <label className="block text-ink font-bold mb-2">
                  <EncryptedText text="Creator Fee (%) *" hoverOnly={false} animateOnView={true} />
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    className="input-sketch pr-12"
                    placeholder="2"
                    value={creatorFeePercent}
                    onChange={(e) => setCreatorFeePercent(Number(e.target.value))}
                    required
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 font-bold text-gray-400">
                    %
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1 font-bold">
                  Protocol fee: 0.25%
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-sketch-primary w-full flex items-center justify-center gap-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner-sketch w-6 h-6"></div>
                    <span>Creating Pool...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Create Pool</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
