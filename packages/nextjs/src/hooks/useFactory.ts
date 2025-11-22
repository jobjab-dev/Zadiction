import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { FACTORY_ABI } from '@/contracts/factoryABI';

/**
 * Hook for interacting with LotteryFactory
 */

export interface MarketInfo {
  marketAddress: string;
  roundId: bigint;
  digits: number;
  collateral: bigint;
  betDeadline: bigint;
  createdAt: bigint;
  isActive: boolean;
  isResolved: boolean;
}

export function useFactory(
  factoryAddress: string | undefined,
  providerOrSigner: ethers.Provider | ethers.Signer | null
) {
  const [markets, setMarkets] = useState<string[]>([]);
  const [marketsInfo, setMarketsInfo] = useState<MarketInfo[]>([]);
  const [owner, setOwner] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if current user is owner
  const isOwner = useCallback(async (userAddress?: string) => {
    if (!factoryAddress || !providerOrSigner || !userAddress) return false;

    try {
      const contract = new ethers.Contract(factoryAddress, FACTORY_ABI, providerOrSigner);
      const ownerAddress = await contract.owner();
      return ownerAddress.toLowerCase() === userAddress.toLowerCase();
    } catch (err) {
      console.error('Error checking owner:', err);
      return false;
    }
  }, [factoryAddress, providerOrSigner]);

  // Fetch all markets
  const fetchMarkets = useCallback(async () => {
    if (!factoryAddress || !providerOrSigner) return;

    try {
      const contract = new ethers.Contract(factoryAddress, FACTORY_ABI, providerOrSigner);
      const allMarkets = await contract.getAllMarkets();
      setMarkets(allMarkets);

      // Fetch info for all markets
      const infos: MarketInfo[] = [];
      for (const marketAddr of allMarkets) {
        const info = await contract.getMarketInfo(marketAddr);
        infos.push({
          marketAddress: info[0],
          roundId: info[1],
          digits: Number(info[2]),
          collateral: info[3],
          betDeadline: info[4],
          createdAt: info[5],
          isActive: info[6],
          isResolved: info[7],
        });
      }
      // Sort by newest first
      infos.sort((a, b) => Number(b.roundId - a.roundId));
      setMarketsInfo(infos);
    } catch (err: any) {
      console.error('Error fetching markets:', err);
      setError(err.message);
    }
  }, [factoryAddress, providerOrSigner]);

  // Create new market
  const createMarket = useCallback(async (params: {
    digits: number;
    betPeriodDays: number;
    initialOdds: number; // e.g. 70
    minOdds: number;     // e.g. 2
    creatorFeePercent: number;
    collateral: string; // ETH amount
  }) => {
    if (!factoryAddress || !providerOrSigner) {
      throw new Error('Factory not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      let signer;
      if ('getSigner' in providerOrSigner) {
        signer = await providerOrSigner.getSigner();
      } else {
        signer = providerOrSigner;
      }

      const contract = new ethers.Contract(factoryAddress, FACTORY_ABI, signer);

      const betPeriod = params.betPeriodDays * 24 * 60 * 60;
      const initialOddsScaled = Math.floor(params.initialOdds * 100); // Scale by 100
      const minOddsScaled = Math.floor(params.minOdds * 100);         // Scale by 100
      const creatorFee = Math.floor(params.creatorFeePercent * 100);  // Scale by 100
      const collateralWei = ethers.parseEther(params.collateral);

      console.log('🏭 Creating lottery round...');
      console.log('Digits:', params.digits);
      console.log('Collateral:', params.collateral, 'ETH');

      const tx = await contract.createMarket(
        params.digits,
        betPeriod,
        initialOddsScaled,
        minOddsScaled,
        creatorFee,
        { value: collateralWei }
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
  }, [factoryAddress, providerOrSigner, fetchMarkets]);

  // Fetch owner
  useEffect(() => {
    if (!factoryAddress || !providerOrSigner) return;

    const fetchOwner = async () => {
      try {
        const contract = new ethers.Contract(factoryAddress, FACTORY_ABI, providerOrSigner);
        const ownerAddr = await contract.owner();
        setOwner(ownerAddr);
      } catch (err) {
        console.error('Error fetching owner:', err);
      }
    };

    fetchOwner();
  }, [factoryAddress, providerOrSigner]);

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

