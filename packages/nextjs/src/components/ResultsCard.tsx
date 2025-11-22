'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { MarketInfo, ParticipantInfo } from '../hooks/usePredictionMarket';

interface ResultsCardProps {
  marketInfo: MarketInfo | null;
  participantInfo: ParticipantInfo | null;
  onComputeWinner: () => Promise<void>;
  onWithdraw: () => Promise<void>;
  loading: boolean;
}

export function ResultsCard({
  marketInfo,
  participantInfo,
  onComputeWinner,
  onWithdraw,
  loading,
}: ResultsCardProps) {
  const [computing, setComputing] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  if (!marketInfo || !marketInfo.isResolved) {
    return null;
  }

  const handleComputeWinner = async () => {
    setComputing(true);
    try {
      await onComputeWinner();
    } catch (error) {
      console.error('Error computing winner:', error);
    } finally {
      setComputing(false);
    }
  };

  const handleWithdraw = async () => {
    setWithdrawing(true);
    try {
      await onWithdraw();
    } catch (error) {
      console.error('Error withdrawing:', error);
    } finally {
      setWithdrawing(false);
    }
  };

  const outcome = marketInfo.outcome ? 'YES' : 'NO';
  const outcomeColor = marketInfo.outcome ? 'text-green-400' : 'text-red-400';
  const potentialPayout = marketInfo.winnerCount > 0n
    ? marketInfo.totalStaked / marketInfo.winnerCount
    : 0n;

  return (
    <div className="card-zama-glow">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-zama-yellow mb-2">Market Results</h2>
        <div className="divider-glow"></div>
      </div>

      {/* Outcome */}
      <div className="mb-6 p-6 bg-zama-black-lighter rounded-lg border-2 border-zama-yellow/50 text-center">
        <p className="text-gray-400 mb-2">Resolved Outcome:</p>
        <p className={`text-4xl font-bold ${outcomeColor}`}>{outcome}</p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="status-decrypted">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
            <span>Public Result</span>
          </div>
        </div>
      </div>

      {/* Winner Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="stat-box">
          <div className="stat-value text-green-400">
            {marketInfo.winnerCount.toString()}
          </div>
          <div className="stat-label">Winners</div>
        </div>
        <div className="stat-box">
          <div className="stat-value text-zama-yellow">
            {ethers.formatEther(potentialPayout)}
          </div>
          <div className="stat-label">ETH per Winner</div>
        </div>
      </div>

      {/* User Status */}
      {participantInfo?.hasPredicted && (
        <div className="mb-6">
          {!participantInfo.canWithdraw && participantInfo.hasWithdrawn === false ? (
            /* Need to compute winner */
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-start gap-3 mb-4">
                <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-blue-400 font-medium mb-1">Check Your Result</p>
                  <p className="text-sm text-gray-400">
                    The market has been resolved. Click below to check if you won using FHE computation.
                    Your original prediction remains encrypted - only the winner status will be revealed.
                  </p>
                </div>
              </div>
              <button
                className="btn-zama-outline w-full"
                onClick={handleComputeWinner}
                disabled={computing || loading}
              >
                {computing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="spinner-zama"></div>
                    Computing via FHE...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Compute My Result
                  </span>
                )}
              </button>
            </div>
          ) : participantInfo.canWithdraw && !participantInfo.hasWithdrawn ? (
            /* Winner - can withdraw */
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-start gap-3 mb-4">
                <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-green-400 font-bold text-lg mb-1">🎉 Congratulations!</p>
                  <p className="text-sm text-gray-400 mb-2">
                    You predicted correctly! Withdraw your winnings below.
                  </p>
                  <p className="text-zama-yellow font-bold text-xl">
                    {ethers.formatEther(potentialPayout)} ETH
                  </p>
                </div>
              </div>
              <button
                className="btn-zama w-full"
                onClick={handleWithdraw}
                disabled={withdrawing || loading}
              >
                {withdrawing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="spinner-zama"></div>
                    Processing Withdrawal...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Withdraw Winnings
                  </span>
                )}
              </button>
            </div>
          ) : participantInfo.hasWithdrawn ? (
            /* Already withdrawn */
            <div className="p-4 bg-zama-yellow/10 border border-zama-yellow/30 rounded-lg text-center">
              <svg className="w-12 h-12 text-zama-yellow mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-zama-yellow font-medium">Winnings Withdrawn</p>
              <p className="text-sm text-gray-400 mt-1">
                You have successfully withdrawn your {ethers.formatEther(potentialPayout)} ETH
              </p>
            </div>
          ) : (
            /* Not a winner */
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
              <svg className="w-12 h-12 text-red-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p className="text-red-400 font-medium">Not a Winner</p>
              <p className="text-sm text-gray-400 mt-1">
                Your prediction didn&apos;t match the outcome. Better luck next time!
              </p>
            </div>
          )}
        </div>
      )}

      {/* FHE Info */}
      <div className="text-center text-sm text-gray-500">
        <p className="text-encrypted">
          🔐 All predictions remained encrypted until resolution
        </p>
        <p className="mt-2">
          Powered by Zama FHEVM - Fully Homomorphic Encryption
        </p>
      </div>
    </div>
  );
}

