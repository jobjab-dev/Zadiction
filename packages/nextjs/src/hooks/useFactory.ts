import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { FACTORY_ABI } from '@/contracts/factoryABI';

/**
 * Hook for interacting with PredictionMarketFactory
 */

export interface MarketInfo {
  marketAddress: string;
  question: string;
  stakeAmount: bigint;
  commitDeadline: bigint;
  resolveDeadline: bigint;
  resolver: string;
  createdAt: bigint;
  isActive: boolean;
}

export function useFactory(
  factoryAddress: string | undefined,
  provider: ethers.BrowserProvider | null
) {
  const [markets, setMarkets] = useState<string[]>([]);
  const [marketsInfo, setMarketsInfo] = useState<MarketInfo[]>([]);
  const [owner, setOwner] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if current user is owner
  const isOwner = useCallback(async (userAddress?: string) => {
    if (!factoryAddress || !provider || !userAddress) return false;
    
    try {
      const contract = new ethers.Contract(factoryAddress, FACTORY_ABI, provider);
      const ownerAddress = await contract.owner();
      return ownerAddress.toLowerCase() === userAddress.toLowerCase();
    } catch (err) {
      console.error('Error checking owner:', err);
      return false;
    }
  }, [factoryAddress, provider]);

  // Fetch all markets
  const fetchMarkets = useCallback(async () => {
    if (!factoryAddress || !provider) return;

    try {
      const contract = new ethers.Contract(factoryAddress, FACTORY_ABI, provider);
      const allMarkets = await contract.getAllMarkets();
      setMarkets(allMarkets);

      // Fetch info for all markets
      const infos: MarketInfo[] = [];
      for (const marketAddr of allMarkets) {
        const info = await contract.getMarketInfo(marketAddr);
        infos.push({
          marketAddress: info[0],
          question: info[1],
          stakeAmount: info[2],
          commitDeadline: info[3],
          resolveDeadline: info[4],
          resolver: info[5],
          createdAt: info[6],
          isActive: info[7],
        });
      }
      setMarketsInfo(infos);
    } catch (err: any) {
      console.error('Error fetching markets:', err);
      setError(err.message);
    }
  }, [factoryAddress, provider]);

  // Create new market
  const createMarket = useCallback(async (params: {
    question: string;
    stakeAmount: string; // in ETH
    commitPeriodDays: number;
    resolvePeriodDays: number;
    resolverAddress: string;
    creatorFeePercent: number;
  }) => {
    if (!factoryAddress || !provider) {
      throw new Error('Factory not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(factoryAddress, FACTORY_ABI, signer);

      const stakeAmount = ethers.parseEther(params.stakeAmount);
      const commitPeriod = params.commitPeriodDays * 24 * 60 * 60;
      const resolvePeriod = params.resolvePeriodDays * 24 * 60 * 60;
      const creatorFee = params.creatorFeePercent * 100; // to basis points

      console.log('🏭 Creating market...');
      console.log('Question:', params.question);
      console.log('Stake:', params.stakeAmount, 'ETH');
      console.log('Commit Period:', params.commitPeriodDays, 'days');
      console.log('Resolve Period:', params.resolvePeriodDays, 'days');

      const tx = await contract.createMarket(
        params.question,
        stakeAmount,
        commitPeriod,
        resolvePeriod,
        params.resolverAddress,
        creatorFee
      );

      console.log('⏳ Waiting for confirmation...');
      const receipt = await tx.wait();

      // Find MarketCreated event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'MarketCreated';
        } catch {
          return false;
        }
      });

      let marketAddress = '';
      if (event) {
        const parsed = contract.interface.parseLog(event);
        marketAddress = parsed?.args[0];
        console.log('✅ Market created at:', marketAddress);
      }

      // Refresh markets list
      await fetchMarkets();

      return { tx, marketAddress };
    } catch (err: any) {
      console.error('Error creating market:', err);
      setError(err.message || 'Failed to create market');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [factoryAddress, provider, fetchMarkets]);

  // Fetch owner
  useEffect(() => {
    if (!factoryAddress || !provider) return;

    const fetchOwner = async () => {
      try {
        const contract = new ethers.Contract(factoryAddress, FACTORY_ABI, provider);
        const ownerAddr = await contract.owner();
        setOwner(ownerAddr);
      } catch (err) {
        console.error('Error fetching owner:', err);
      }
    };

    fetchOwner();
  }, [factoryAddress, provider]);

  // Initial fetch
  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

  return {
    markets,
    marketsInfo,
    owner,
    loading,
    error,
    createMarket,
    isOwner,
    refreshMarkets: fetchMarkets,
  };
}

