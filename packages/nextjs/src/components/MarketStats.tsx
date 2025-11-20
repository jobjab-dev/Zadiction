'use client';

import { ethers } from 'ethers';
import { MarketInfo } from '../hooks/usePredictionMarket';

interface MarketStatsProps {
  marketInfo: MarketInfo | null;
}

export function MarketStats({ marketInfo }: MarketStatsProps) {
  if (!marketInfo) {
    return null;
  }

  const potentialWinPerParticipant = marketInfo.winnerCount > 0n
    ? marketInfo.totalStaked / marketInfo.winnerCount
    : marketInfo.totalStaked;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Total Pool */}
      <div className="stat-box">
        <div className="stat-value">
          {ethers.formatEther(marketInfo.totalStaked)}
        </div>
        <div className="stat-label">ETH</div>
        <div className="text-xs text-gray-500 mt-1">Total Pool</div>
      </div>

      {/* Participants */}
      <div className="stat-box">
        <div className="stat-value">
          {marketInfo.participantCount.toString()}
        </div>
        <div className="stat-label">Participants</div>
        <div className="text-xs text-gray-500 mt-1">
          {marketInfo.phase === 2 && marketInfo.isResolved
            ? `${marketInfo.winnerCount.toString()} Winners`
            : 'Encrypted Predictions'}
        </div>
      </div>

      {/* Stake Amount */}
      <div className="stat-box">
        <div className="stat-value">
          {ethers.formatEther(marketInfo.stakeAmount)}
        </div>
        <div className="stat-label">ETH</div>
        <div className="text-xs text-gray-500 mt-1">Per Prediction</div>
      </div>

      {/* Potential Win */}
      <div className="stat-box">
        <div className="stat-value text-green-400">
          {ethers.formatEther(potentialWinPerParticipant)}
        </div>
        <div className="stat-label">ETH</div>
        <div className="text-xs text-gray-500 mt-1">
          {marketInfo.isResolved ? 'Winner Payout' : 'Est. Win'}
        </div>
      </div>
    </div>
  );
}

