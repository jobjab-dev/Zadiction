'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { MarketInfo, ParticipantInfo } from '../hooks/usePredictionMarket';
import { useCountdown } from '../hooks/useCountdown';

interface PredictionCardProps {
  marketInfo: MarketInfo | null;
  participantInfo: ParticipantInfo | null;
  onSubmitPrediction: (prediction: boolean) => Promise<void>;
  loading: boolean;
}

export function PredictionCard({
  marketInfo,
  participantInfo,
  onSubmitPrediction,
  loading,
}: PredictionCardProps) {
  const [selectedChoice, setSelectedChoice] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const countdown = useCountdown(marketInfo?.commitDeadline);

  const handleSubmit = async () => {
    if (selectedChoice === null) return;

    setSubmitting(true);
    try {
      await onSubmitPrediction(selectedChoice);
      // Reset selection after successful submission
      setSelectedChoice(null);
    } catch (error) {
      console.error('Error submitting:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!marketInfo) {
    return (
      <div className="card-sketch">
        <div className="flex items-center justify-center p-8">
          <div className="spinner-sketch"></div>
          <span className="ml-3 text-gray-500 font-bold">Sketching market data...</span>
        </div>
      </div>
    );
  }

  const isCommitPhase = marketInfo.phase === 0;
  const canPredict = isCommitPhase && !participantInfo?.hasPredicted;
  const hasDeadlinePassed = countdown?.total === 0;

  return (
    <div className="card-sketch-hover relative bg-white">
      {/* Tape effect (decorative) */}
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-yellow-100/80 rotate-1 shadow-sm z-10"></div>

      {/* Header */}
      <div className="mb-6 mt-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-ink">Make Your Prediction</h2>
          <span className={`badge-sketch ${['badge-active', 'badge-locked', 'badge-closed'][marketInfo.phase] || 'badge-closed'}`}>
            {['Commit', 'Locked', 'Resolved'][marketInfo.phase]}
          </span>
        </div>
        <div className="h-0.5 w-full bg-ink rounded-full opacity-20 my-4"></div>
      </div>

      {/* Question */}
      <div className="mb-6 p-4 bg-paper-dark rounded-sketch-sm border-2 border-ink/10">
        <p className="text-lg text-ink font-medium">{marketInfo.question}</p>
      </div>

      {/* Countdown */}
      {isCommitPhase && countdown && countdown.total > 0 && (
        <div className="mb-6 text-center">
          <p className="text-gray-500 text-sm mb-1 font-bold">Time remaining:</p>
          <div className="font-mono text-xl font-bold text-ink bg-marker-yellow inline-block px-2 transform -rotate-1">
            {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
          </div>
        </div>
      )}

      {/* Prediction Status */}
      {participantInfo?.hasPredicted ? (
        <div className="text-center py-8 bg-paper rounded-sketch border-2 border-dashed border-ink/20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-white rounded-full mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="font-bold text-sm">Encrypted</span>
          </div>
          <p className="text-gray-600 text-sm px-4">
            Your prediction is sealed in an envelope.<br />
            It will be revealed only after the market resolves.
          </p>
        </div>
      ) : canPredict ? (
        <>
          {/* Choice Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              className={`flex-1 py-6 px-4 rounded-sketch border-2 transition-all duration-200 font-bold text-xl
                ${selectedChoice === true
                  ? 'bg-green-100 border-ink shadow-sketch transform -translate-y-1'
                  : 'bg-white border-ink hover:bg-gray-50'}`}
              onClick={() => setSelectedChoice(true)}
              disabled={submitting}
            >
              <div className="flex flex-col items-center gap-2">
                <span>YES</span>
                {selectedChoice === true && (
                  <div className="w-full h-2 bg-green-400/50 rounded-full transform -rotate-1"></div>
                )}
              </div>
            </button>

            <button
              className={`flex-1 py-6 px-4 rounded-sketch border-2 transition-all duration-200 font-bold text-xl
                ${selectedChoice === false
                  ? 'bg-red-100 border-ink shadow-sketch transform -translate-y-1'
                  : 'bg-white border-ink hover:bg-gray-50'}`}
              onClick={() => setSelectedChoice(false)}
              disabled={submitting}
            >
              <div className="flex flex-col items-center gap-2">
                <span>NO</span>
                {selectedChoice === false && (
                  <div className="w-full h-2 bg-red-400/50 rounded-full transform -rotate-1"></div>
                )}
              </div>
            </button>
          </div>

          {/* Stake Info */}
          <div className="mb-6 text-center">
            <span className="text-gray-500 text-sm font-bold mr-2">Stake Required:</span>
            <span className="text-ink font-bold text-lg highlight-marker">
              {ethers.formatEther(marketInfo.stakeAmount)} ETH
            </span>
          </div>

          {/* Submit Button */}
          <button
            className="btn-sketch-primary w-full py-4 text-lg flex items-center justify-center gap-2"
            onClick={handleSubmit}
            disabled={selectedChoice === null || submitting || loading}
          >
            {submitting ? (
              <>
                <div className="spinner-sketch w-5 h-5"></div>
                <span>Encrypting...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span>Submit Prediction</span>
              </>
            )}
          </button>
        </>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-sketch bg-gray-50">
          <div className="text-4xl mb-2 opacity-50">🔒</div>
          <p className="text-gray-500 font-bold">
            {hasDeadlinePassed
              ? 'Predictions Closed'
              : 'Market Not Active'}
          </p>
        </div>
      )}
    </div>
  );
}


