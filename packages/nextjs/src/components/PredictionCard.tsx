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
      <div className="card-zama">
        <div className="flex items-center justify-center p-8">
          <div className="spinner-zama"></div>
          <span className="ml-3 text-gray-400">Loading market data...</span>
        </div>
      </div>
    );
  }

  const isCommitPhase = marketInfo.phase === 0;
  const canPredict = isCommitPhase && !participantInfo?.hasPredicted;
  const hasDeadlinePassed = countdown?.total === 0;

  return (
    <div className="card-zama-glow">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-zama-yellow">Make Your Prediction</h2>
          <span className={`phase-badge phase-${['commit', 'locked', 'resolved'][marketInfo.phase]}`}>
            {['Commit', 'Locked', 'Resolved'][marketInfo.phase]}
          </span>
        </div>
        <div className="divider-glow"></div>
      </div>

      {/* Question */}
      <div className="mb-6 p-4 bg-zama-black-lighter rounded-lg border border-zama-yellow/30">
        <p className="text-lg text-white">{marketInfo.question}</p>
      </div>

      {/* Countdown */}
      {isCommitPhase && countdown && countdown.total > 0 && (
        <div className="mb-6 text-center">
          <p className="text-gray-400 mb-2">Time remaining to predict:</p>
          <div className="countdown">
            {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
          </div>
        </div>
      )}

      {/* Prediction Status */}
      {participantInfo?.hasPredicted ? (
        <div className="text-center py-8">
          <div className="status-encrypted mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Prediction Encrypted</span>
          </div>
          <p className="text-gray-400">
            Your prediction has been encrypted and stored on-chain.<br />
            Nobody can see your choice until the market resolves.
          </p>
          <div className="mt-4 text-encrypted text-sm">
            🔐 Protected by FHEVM
          </div>
        </div>
      ) : canPredict ? (
        <>
          {/* Choice Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              className={`choice-btn choice-yes ${selectedChoice === true ? 'choice-selected' : ''}`}
              onClick={() => setSelectedChoice(true)}
              disabled={submitting}
            >
              <div className="flex flex-col items-center gap-2">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>YES</span>
              </div>
            </button>
            
            <button
              className={`choice-btn choice-no ${selectedChoice === false ? 'choice-selected' : ''}`}
              onClick={() => setSelectedChoice(false)}
              disabled={submitting}
            >
              <div className="flex flex-col items-center gap-2">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>NO</span>
              </div>
            </button>
          </div>

          {/* Stake Info */}
          <div className="mb-6 p-4 bg-zama-black-lighter/50 rounded-lg border border-zama-yellow/20">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Stake Required:</span>
              <span className="text-zama-yellow font-bold text-lg">
                {ethers.formatEther(marketInfo.stakeAmount)} ETH
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            className="btn-zama w-full py-4 text-lg"
            onClick={handleSubmit}
            disabled={selectedChoice === null || submitting || loading}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="spinner-zama"></div>
                Encrypting & Submitting...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Submit Encrypted Prediction
              </span>
            )}
          </button>

          {/* Info Text */}
          <p className="text-center text-sm text-gray-500 mt-4">
            Your prediction will be encrypted using FHEVM before submission.
            Nobody can see your choice, not even the market creator.
          </p>
        </>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">⏰</div>
          <p className="text-gray-400">
            {hasDeadlinePassed 
              ? 'The commit period has ended. No more predictions can be submitted.'
              : 'Market is not accepting predictions at this time.'}
          </p>
        </div>
      )}
    </div>
  );
}

