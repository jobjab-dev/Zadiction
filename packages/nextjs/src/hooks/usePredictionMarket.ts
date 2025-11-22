import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useFhevmClient } from 'jobjab-fhevm-sdk/adapters/react';
import { MARKET_ABI } from '@/contracts/factoryABI';

/**
 * Custom hook for Confidential Prediction Market interactions
 * Uses jobjab-fhevm-sdk for encryption/decryption
 */

export interface MarketInfo {
  question: string;
  stakeAmount: bigint;
  commitDeadline: bigint;
  resolveDeadline: bigint;
  phase: number; // 0: Commit, 1: Locked, 2: Resolved
  totalStaked: bigint;
  participantCount: bigint;
  isResolved: boolean;
  outcome: boolean;
  winnerCount: bigint;
}

export interface ParticipantInfo {
  hasPredicted: boolean;
  canWithdraw: boolean;
  hasWithdrawn: boolean;
}

export function usePredictionMarket(
  contractAddress: string | undefined,
  userAddress: string | undefined,
  provider: ethers.BrowserProvider | null
) {
  const fhevmClient = useFhevmClient();
  const [marketInfo, setMarketInfo] = useState<MarketInfo | null>(null);
  const [participantInfo, setParticipantInfo] = useState<ParticipantInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const CONTRACT_ABI = MARKET_ABI;

  // Fetch market info
  const fetchMarketInfo = useCallback(async () => {
    if (!contractAddress || !provider) return;

    try {
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
      const info = await contract.getMarketInfo();

      setMarketInfo({
        question: info[0],
        stakeAmount: info[1],
        commitDeadline: info[2],
        resolveDeadline: info[3],
        phase: info[4],
        totalStaked: info[5],
        participantCount: info[6],
        isResolved: info[7],
        outcome: info[8],
        winnerCount: info[9],
      });
    } catch (err: any) {
      console.error('Error fetching market info:', err);
      setError(err.message);
    }
  }, [contractAddress, provider]);

  // Fetch participant info
  const fetchParticipantInfo = useCallback(async () => {
    if (!contractAddress || !provider || !userAddress) return;

    try {
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
      const info = await contract.getParticipantInfo(userAddress);

      setParticipantInfo({
        hasPredicted: info[0],
        canWithdraw: info[1],
        hasWithdrawn: info[2],
      });
    } catch (err: any) {
      console.error('Error fetching participant info:', err);
      setError(err.message);
    }
  }, [contractAddress, provider, userAddress]);

  // Submit encrypted prediction
  const submitPrediction = useCallback(async (predictionValue: boolean) => {
    if (!contractAddress || !userAddress || !provider || !fhevmClient) {
      throw new Error('Missing required parameters');
    }

    setLoading(true);
    setError(null);

    try {
      // Initialize FHEVM client
      await fhevmClient.init();

      // Encrypt the prediction using FHEVM SDK
      console.log('🔒 Encrypting prediction:', predictionValue ? 'YES' : 'NO');
      const encryptedInput = await fhevmClient.encrypt(
        contractAddress as `0x${string}`,
        userAddress as `0x${string}`,
        { type: 'ebool', value: predictionValue }
      );

      console.log('✅ Encrypted successfully');

      // Get contract with signer
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);

      // Get stake amount
      const stakeAmount = await contract.stakeAmount();

      // Submit the encrypted prediction
      console.log('📤 Submitting to contract...');
      const tx = await contract.submitPrediction(
        encryptedInput.handles[0],
        encryptedInput.inputProof,
        { value: stakeAmount }
      );

      console.log('⏳ Waiting for confirmation...');
      await tx.wait();

      console.log('🎉 Prediction submitted!');

      // Refresh data
      await fetchMarketInfo();
      await fetchParticipantInfo();

      return tx;
    } catch (err: any) {
      console.error('Error submitting prediction:', err);
      setError(err.message || 'Failed to submit prediction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contractAddress, userAddress, provider, fhevmClient, fetchMarketInfo, fetchParticipantInfo]);

  // Compute winner (new pattern for FHEVM v0.7)
  const computeWinner = useCallback(async () => {
    if (!contractAddress || !provider || !userAddress || !fhevmClient) {
      throw new Error('Missing required parameters');
    }

    setLoading(true);
    setError(null);

    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);

      console.log('🎯 Step 1: Computing encrypted winner flag...');

      // Get encrypted winner flag from contract
      const winnerFlagHandle = await contract.computeWinnerFlag(userAddress);

      console.log('🔐 Step 2: Decrypting result via SDK...');

      // Initialize FHEVM client
      await fhevmClient.init();

      // Generate keypair for decryption
      const keypair = fhevmClient.generateKeypair();

      // Create EIP-712 signature
      const eip712 = fhevmClient.createEIP712(
        keypair.publicKey,
        [contractAddress as `0x${string}`],
        Math.floor(Date.now() / 1000),
        365
      );

      const signatureString = await signer.signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message
      );

      // Decrypt the winner flag
      const decrypted = await fhevmClient.decrypt(
        [{ handle: winnerFlagHandle, contractAddress: contractAddress as `0x${string}` }],
        {
          publicKey: keypair.publicKey,
          privateKey: keypair.privateKey,
          signature: signatureString.replace('0x', ''),
          startTimestamp: Math.floor(Date.now() / 1000),
          durationDays: 365,
          userAddress: userAddress as `0x${string}`,
          contractAddresses: [contractAddress as `0x${string}`],
        }
      );

      const isWinner = Boolean(decrypted[winnerFlagHandle]);

      console.log('🎲 Result:', isWinner ? 'WINNER! 🎉' : 'Not a winner');

      // Claim winner status on-chain
      console.log('📤 Step 3: Claiming winner status on-chain...');
      const tx = await contract.claimWinnerStatus(isWinner);
      await tx.wait();

      console.log('✅ Winner status claimed!');

      // Refresh data
      await fetchParticipantInfo();

      return { isWinner, tx };
    } catch (err: any) {
      console.error('Error computing winner:', err);
      setError(err.message || 'Failed to compute winner');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contractAddress, provider, userAddress, fhevmClient, fetchParticipantInfo]);

  // Withdraw winnings
  const withdraw = useCallback(async () => {
    if (!contractAddress || !provider) {
      throw new Error('Missing required parameters');
    }

    setLoading(true);
    setError(null);

    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);

      console.log('💰 Withdrawing winnings...');
      const tx = await contract.withdraw();
      await tx.wait();

      console.log('✅ Withdrawal successful!');

      // Refresh data
      await fetchParticipantInfo();

      return tx;
    } catch (err: any) {
      console.error('Error withdrawing:', err);
      setError(err.message || 'Failed to withdraw');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contractAddress, provider, fetchParticipantInfo]);

  // Request refund
  const refund = useCallback(async () => {
    if (!contractAddress || !provider) {
      throw new Error('Missing required parameters');
    }

    setLoading(true);
    setError(null);

    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);

      console.log('🔄 Requesting refund...');
      const tx = await contract.refund();
      await tx.wait();

      console.log('✅ Refund successful!');

      // Refresh data
      await fetchParticipantInfo();

      return tx;
    } catch (err: any) {
      console.error('Error requesting refund:', err);
      setError(err.message || 'Failed to request refund');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contractAddress, provider, fetchParticipantInfo]);

  // Get potential payout
  const getPotentialPayout = useCallback(async (): Promise<bigint> => {
    if (!contractAddress || !provider) {
      return BigInt(0);
    }

    try {
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
      const payout = await contract.getPotentialPayout();
      return payout;
    } catch (err) {
      console.error('Error getting potential payout:', err);
      return BigInt(0);
    }
  }, [contractAddress, provider]);

  // Initial fetch
  useEffect(() => {
    fetchMarketInfo();
    fetchParticipantInfo();
  }, [fetchMarketInfo, fetchParticipantInfo]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMarketInfo();
      fetchParticipantInfo();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchMarketInfo, fetchParticipantInfo]);

  return {
    marketInfo,
    participantInfo,
    loading,
    error,
    submitPrediction,
    computeWinner,
    withdraw,
    refund,
    getPotentialPayout,
    refreshMarketInfo: fetchMarketInfo,
    refreshParticipantInfo: fetchParticipantInfo,
  };
}

