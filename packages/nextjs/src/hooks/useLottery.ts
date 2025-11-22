import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { MARKET_ABI } from '@/contracts/factoryABI';

export interface Bet {
    player: string;
    number: bigint;
    amount: bigint;
    lockedOdds: bigint;
    potentialPayout: bigint;
    claimed: boolean;
}

export interface LotteryState {
    roundId: bigint;
    digits: number;
    maxNumber: bigint;
    betDeadline: bigint;
    collateral: bigint;
    liabilityLimit: bigint;
    initialOdds: bigint;
    minOdds: bigint;
    feePercent: bigint;
    isResolved: boolean;
    winningNumber: bigint;
    totalUnclaimedPayouts: bigint;
    drawRequestedAt: bigint;
    betCount: bigint;
}

export function useLottery(
    contractAddress: string | undefined,
    provider: ethers.Provider | null,
    userAddress: string | undefined,
    signer: ethers.Signer | null | undefined
) {
    const [state, setState] = useState<LotteryState | null>(null);
    const [userBets, setUserBets] = useState<Bet[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch Lottery State
    const fetchState = useCallback(async () => {
        if (!contractAddress || !provider) return;

        try {
            const contract = new ethers.Contract(contractAddress, MARKET_ABI, provider);

            const [
                roundId, digits, maxNumber, betDeadline, collateral, liabilityLimit,
                initialOdds, minOdds, feePercent, isResolved, winningNumber,
                totalUnclaimedPayouts, drawRequestedAt, betCount
            ] = await Promise.all([
                contract.roundId(),
                contract.digits(),
                contract.maxNumber(),
                contract.betDeadline(),
                contract.collateral(),
                contract.liabilityLimit(),
                contract.initialOdds(),
                contract.minOdds(),
                contract.feePercent(),
                contract.isResolved(),
                contract.winningNumber(),
                contract.totalUnclaimedPayouts(),
                contract.drawRequestedAt(),
                contract.getBetCount()
            ]);

            setState({
                roundId,
                digits: Number(digits),
                maxNumber, betDeadline, collateral, liabilityLimit,
                initialOdds, minOdds, feePercent, isResolved, winningNumber,
                totalUnclaimedPayouts, drawRequestedAt, betCount
            });
        } catch (err: any) {
            console.error('Error fetching lottery state:', err);
            setError(err.message);
        }
    }, [contractAddress, provider]);

    // Fetch User Bets
    const fetchUserBets = useCallback(async () => {
        if (!contractAddress || !provider || !userAddress) return;

        try {
            const contract = new ethers.Contract(contractAddress, MARKET_ABI, provider);
            const bets = await contract.getUserBets(userAddress);
            setUserBets(bets);
        } catch (err: any) {
            console.error('Error fetching user bets:', err);
        }
    }, [contractAddress, provider, userAddress]);

    // Get Odds for a specific number and amount
    const getOdds = useCallback(async (number: number, amount: bigint) => {
        if (!contractAddress || !provider) return BigInt(0);
        try {
            const contract = new ethers.Contract(contractAddress, MARKET_ABI, provider);
            return await contract.getOdds(number, amount);
        } catch (err: any) {
            console.error('Error getting odds:', err);
            return BigInt(0);
        }
    }, [contractAddress, provider]);

    // Get Max Bet for a specific number
    const getMaxBet = useCallback(async (number: number) => {
        if (!contractAddress || !provider) return BigInt(0);
        try {
            const contract = new ethers.Contract(contractAddress, MARKET_ABI, provider);
            return await contract.maxBet(number);
        } catch (err: any) {
            console.error('Error getting max bet:', err);
            return BigInt(0);
        }
    }, [contractAddress, provider]);

    // Place Bet
    const placeBet = useCallback(async (number: number, amount: bigint) => {
        if (!contractAddress || !signer) {
            throw new Error("No signer available. Please connect your wallet.");
        }
        setLoading(true);
        try {
            const contract = new ethers.Contract(contractAddress, MARKET_ABI, signer);
            const tx = await contract.placeBet(number, { value: amount });
            await tx.wait();
            await fetchState();
            await fetchUserBets();
            return tx;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [contractAddress, signer, fetchState, fetchUserBets]);

    // Draw Result
    const drawResult = useCallback(async () => {
        if (!contractAddress || !signer) {
            throw new Error("No signer available. Please connect your wallet.");
        }
        setLoading(true);
        try {
            const contract = new ethers.Contract(contractAddress, MARKET_ABI, signer);
            const tx = await contract.drawResult();
            await tx.wait();
            await fetchState();
            return tx;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [contractAddress, signer, fetchState]);

    // Claim Winnings
    const claimWinnings = useCallback(async () => {
        if (!contractAddress || !signer) {
            throw new Error("No signer available. Please connect your wallet.");
        }
        setLoading(true);
        try {
            const contract = new ethers.Contract(contractAddress, MARKET_ABI, signer);
            const tx = await contract.claimWinnings();
            await tx.wait();
            await fetchState();
            await fetchUserBets();
            return tx;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [contractAddress, signer, fetchState, fetchUserBets]);

    // Initial Fetch
    useEffect(() => {
        fetchState();
        fetchUserBets();
        const interval = setInterval(() => {
            fetchState();
            fetchUserBets();
        }, 10000);
        return () => clearInterval(interval);
    }, [fetchState, fetchUserBets]);

    return {
        state,
        userBets,
        loading,
        error,
        getOdds,
        getMaxBet,
        placeBet,
        drawResult,
        claimWinnings,
        refresh: fetchState
    };
}
