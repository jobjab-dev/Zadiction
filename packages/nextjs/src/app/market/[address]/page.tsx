'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { useEthersProvider } from '@/hooks/useEthersProvider';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { useLottery } from '@/hooks/useLottery';
import { EncryptedText } from '@/components/EncryptedText';
import { SketchDice, SketchHourglass, SketchMoneyBag } from '@/components/SketchIcons';
import { useToast } from '@/components/Toast';

export default function MarketPage() {
  const params = useParams();
  const address = params.address as string;
  const { address: userAddress } = useAccount();
  const provider = useEthersProvider();
  const signer = useEthersSigner();
  const { showToast } = useToast();

  const { state, userBets, loading, error, getOdds, getMaxBet, placeBet, drawResult, claimWinnings } = useLottery(address, provider, userAddress, signer);

  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [betAmount, setBetAmount] = useState<string>('0.01');
  const [currentOdds, setCurrentOdds] = useState<string>('0');
  const [maxBet, setMaxBet] = useState<string>('0');
  const [estimating, setEstimating] = useState(false);

  // Estimate Odds and Max Bet when selection changes
  useEffect(() => {
    if (selectedNumber === null || !state) return;

    const estimate = async () => {
      setEstimating(true);
      try {
        const amountWei = ethers.parseEther(betAmount || '0');
        const odds = await getOdds(selectedNumber, amountWei);
        const max = await getMaxBet(selectedNumber);

        setCurrentOdds((Number(odds) / 100).toFixed(2));
        setMaxBet(ethers.formatEther(max));
      } catch (err) {
        console.error(err);
      } finally {
        setEstimating(false);
      }
    };

    estimate();
  }, [selectedNumber, betAmount, state, getOdds, getMaxBet]);

  const handlePlaceBet = async () => {
    if (selectedNumber === null) return;
    try {
      await placeBet(selectedNumber, ethers.parseEther(betAmount));
      showToast('Bet Placed Successfully! 🎲', 'success');
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  const handleDraw = async () => {
    try {
      await drawResult();
      showToast('Draw Requested! Waiting for randomness... 🎰', 'info');
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  const handleClaim = async () => {
    try {
      await claimWinnings();
      showToast('Winnings Claimed! 💰', 'success');
    } catch (err: any) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  if (!state) return <div className="text-center py-20">Loading Market...</div>;

  const isBettingOpen = !state.isResolved && Date.now() / 1000 < Number(state.betDeadline);
  const isDrawPending = !state.isResolved && Date.now() / 1000 >= Number(state.betDeadline);
  const isWaitingForRNG = state.drawRequestedAt > 0 && !state.isResolved;

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-ink mb-2">
            <EncryptedText text={`Round #${state.roundId}`} hoverOnly={false} animateOnView={true} />
          </h1>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>Digits: {state.digits}</span>
            <span>Collateral: {ethers.formatEther(state.collateral)} ETH</span>
            <span>Limit: {ethers.formatEther(state.liabilityLimit)} ETH</span>
            <span>Fee: {(Number(state.feePercent) / 100).toFixed(2)}%</span>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-xl font-bold ${state.isResolved ? 'text-green-600' : 'text-blue-600'}`}>
            {state.isResolved ? `Winner: ${state.winningNumber}` : (isBettingOpen ? 'OPEN' : 'CLOSED')}
          </div>
          {isBettingOpen && (
            <div className="text-sm text-gray-500">
              Closes in: {Math.max(0, Number(state.betDeadline) - Math.floor(Date.now() / 1000))}s
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Betting Board */}
        <div className="lg:col-span-2 card-sketch bg-white">
          <h2 className="text-xl font-bold text-ink mb-4">
            <EncryptedText text="Select Number" hoverOnly={false} animateOnView={true} />
          </h2>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-h-[500px] overflow-y-auto p-2">
            {Array.from({ length: Number(state.maxNumber) + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedNumber(i)}
                disabled={!isBettingOpen}
                className={`p-2 rounded border-2 text-center transition-all ${selectedNumber === i
                  ? 'bg-marker-yellow border-ink transform -translate-y-1 shadow-sketch'
                  : 'bg-paper border-ink/10 hover:border-ink/30'
                  } ${!isBettingOpen ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="font-bold text-ink">{i.toString().padStart(state.digits, '0')}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          {/* Bet Slip */}
          <div className="card-sketch bg-white">
            <h2 className="text-xl font-bold text-ink mb-4">
              <EncryptedText text="Place Bet" hoverOnly={false} animateOnView={true} />
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  <EncryptedText text="Selected Number" hoverOnly={false} animateOnView={true} />
                </label>
                <div className="text-2xl font-mono font-bold text-ink bg-gray-100 p-2 rounded border border-gray-200 text-center">
                  {selectedNumber !== null ? selectedNumber.toString().padStart(state.digits, '0') : '-'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  <EncryptedText text="Amount (ETH)" hoverOnly={false} animateOnView={true} />
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  disabled={!isBettingOpen}
                  className="w-full p-2 border-2 border-gray-300 rounded focus:border-ink focus:outline-none"
                />
              </div>

              <div className="bg-blue-50 p-3 rounded border border-blue-100 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Current Odds:</span>
                  <span className="font-bold">{estimating ? '...' : `${currentOdds}x`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Est. Payout:</span>
                  <span className="font-bold text-green-600">
                    {estimating ? '...' : `${(Number(betAmount) * Number(currentOdds)).toFixed(4)} ETH`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500 text-xs pt-2 border-t border-blue-200">
                  <span>Max Bet:</span>
                  <span>{estimating ? '...' : `${maxBet} ETH`}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceBet}
                disabled={!isBettingOpen || selectedNumber === null || loading}
                className="w-full btn-sketch-primary py-3 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Place Bet'}
              </button>
            </div>
          </div>

          {/* Game Actions */}
          <div className="card-sketch bg-white">
            <h2 className="text-xl font-bold text-ink mb-4">
              <EncryptedText text="Game Actions" hoverOnly={false} animateOnView={true} />
            </h2>

            {isDrawPending && !isWaitingForRNG && (
              <button
                onClick={handleDraw}
                disabled={loading}
                className="w-full btn-sketch-secondary py-3 mb-2 font-bold flex items-center justify-center gap-2"
              >
                <SketchDice className="w-5 h-5" /> Draw Result
              </button>
            )}

            {isWaitingForRNG && (
              <div className="text-center p-4 bg-yellow-50 border-2 border-yellow-200 rounded animate-pulse flex items-center justify-center gap-2">
                <SketchHourglass className="w-6 h-6 text-marker-yellow" /> Waiting for Randomness...
              </div>
            )}

            {state.isResolved && (
              <div className="text-center p-4 bg-green-50 border-2 border-green-200 rounded mb-2">
                <div className="text-sm text-gray-600">Winning Number</div>
                <div className="text-3xl font-bold text-green-700">{state.winningNumber}</div>
              </div>
            )}

            {state.isResolved && (
              <button
                onClick={handleClaim}
                disabled={loading}
                className="w-full btn-sketch-primary py-3 font-bold flex items-center justify-center gap-2"
              >
                <SketchMoneyBag className="w-5 h-5" /> Claim Winnings
              </button>
            )}
          </div>
        </div>
      </div>

      {/* User Bets */}
      <div className="mt-8 card-sketch bg-white">
        <h2 className="text-xl font-bold text-ink mb-4">
          <EncryptedText text="Your Bets" hoverOnly={false} animateOnView={true} />
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-gray-100">
                <th className="p-3">Number</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Locked Odds</th>
                <th className="p-3">Payout</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {userBets.map((bet, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-3 font-bold">{bet.number.toString().padStart(state.digits, '0')}</td>
                  <td className="p-3">{ethers.formatEther(bet.amount)} ETH</td>
                  <td className="p-3">{(Number(bet.lockedOdds) / 100).toFixed(2)}x</td>
                  <td className="p-3 text-green-600 font-bold">{ethers.formatEther(bet.potentialPayout)} ETH</td>
                  <td className="p-3">
                    {state.isResolved ? (
                      bet.number === state.winningNumber ? (
                        bet.claimed ? <span className="text-gray-500">Claimed</span> : <span className="text-green-600 font-bold">WINNER</span>
                      ) : (
                        <span className="text-red-400">Lost</span>
                      )
                    ) : (
                      <span className="text-blue-500">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
              {userBets.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">No bets placed yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main >
  );
}
