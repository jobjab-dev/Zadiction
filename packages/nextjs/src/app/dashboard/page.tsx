'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useFactory, MarketInfo } from '@/hooks/useFactory';
import { useEthersProvider } from '@/hooks/useEthersProvider';
import { MARKET_ABI_HUMAN as MARKET_ABI } from '@/contracts/contractABIs';
import { EncryptedText } from '@/components/EncryptedText';
import { SketchDice, SketchMoneyBag, SketchCreate, SketchChart } from '@/components/SketchIcons';
import { ConnectButton } from '@rainbow-me/rainbowkit';

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

interface AggregatedBet {
    marketAddress: string;
    roundId: bigint;
    digits: number;
    betDeadline: bigint;
    isResolved: boolean;
    winningNumber: bigint;
    player: string;
    number: bigint;
    amount: bigint;
    lockedOdds: bigint;
    potentialPayout: bigint;
    claimed: boolean;
}

interface CreatorMarket {
    market: MarketInfo;
    creator: string;
    totalBetsReceived: bigint;
    feesEarned: bigint;
}

type ViewMode = 'player' | 'creator';

export default function DashboardPage() {
    const { address: userAddress, isConnected } = useAccount();
    const provider = useEthersProvider();
    const { marketsInfo } = useFactory(FACTORY_ADDRESS, provider);

    const [viewMode, setViewMode] = useState<ViewMode>('player');
    const [activeBets, setActiveBets] = useState<AggregatedBet[]>([]);
    const [pastBets, setPastBets] = useState<AggregatedBet[]>([]);
    const [creatorMarkets, setCreatorMarkets] = useState<CreatorMarket[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalWagered, setTotalWagered] = useState<bigint>(BigInt(0));
    const [totalWon, setTotalWon] = useState<bigint>(BigInt(0));
    const [totalCollateral, setTotalCollateral] = useState<bigint>(BigInt(0));
    const [totalFeesEarned, setTotalFeesEarned] = useState<bigint>(BigInt(0));

    // Fetch player bets
    useEffect(() => {
        const fetchAllBets = async () => {
            if (!userAddress || !provider || marketsInfo.length === 0) return;

            setLoading(true);
            const active: AggregatedBet[] = [];
            const past: AggregatedBet[] = [];
            let wagered = BigInt(0);
            let won = BigInt(0);

            try {
                await Promise.all(
                    marketsInfo.map(async (market) => {
                        try {
                            const contract = new ethers.Contract(market.marketAddress, MARKET_ABI, provider);
                            const bets = await contract.getUserBets(userAddress);

                            if (bets && bets.length > 0) {
                                bets.forEach((bet: any) => {
                                    const aggregatedBet: AggregatedBet = {
                                        marketAddress: market.marketAddress,
                                        roundId: market.roundId,
                                        digits: market.digits,
                                        betDeadline: market.betDeadline,
                                        isResolved: market.isResolved,
                                        winningNumber: BigInt(0),
                                        player: bet.player,
                                        number: bet.number,
                                        amount: bet.amount,
                                        lockedOdds: bet.lockedOdds,
                                        potentialPayout: bet.potentialPayout,
                                        claimed: bet.claimed,
                                    };

                                    wagered += bet.amount;

                                    if (market.isResolved) {
                                        past.push(aggregatedBet);
                                    } else {
                                        active.push(aggregatedBet);
                                    }
                                });
                            }
                        } catch (err) {
                            console.error(`Error fetching bets for market ${market.marketAddress}:`, err);
                        }
                    })
                );

                active.sort((a, b) => Number(b.roundId - a.roundId));
                past.sort((a, b) => Number(b.roundId - a.roundId));

                setActiveBets(active);
                setPastBets(past);
                setTotalWagered(wagered);

                const claimedAmount = [...active, ...past].reduce((acc, bet) => {
                    return bet.claimed ? acc + bet.potentialPayout : acc;
                }, BigInt(0));
                setTotalWon(claimedAmount);

            } catch (err) {
                console.error('Error aggregating bets:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllBets();
    }, [userAddress, provider, marketsInfo]);

    // Fetch creator markets
    useEffect(() => {
        const fetchCreatorMarkets = async () => {
            if (!userAddress || !provider || marketsInfo.length === 0) return;

            console.log('🔍 Fetching creator markets...');
            console.log('📍 User Address:', userAddress);
            console.log('📊 Total Markets:', marketsInfo.length);

            try {
                const creatorMarketsData: CreatorMarket[] = [];
                let totalColl = BigInt(0);
                let totalFees = BigInt(0);

                await Promise.all(
                    marketsInfo.map(async (market, index) => {
                        try {
                            console.log(`\n--- Checking Market ${index + 1}/${marketsInfo.length} ---`);
                            console.log('Market Address:', market.marketAddress);

                            const contract = new ethers.Contract(market.marketAddress, MARKET_ABI, provider);

                            // Try both creator() and owner()
                            let creator;
                            try {
                                creator = await contract.creator();
                                console.log('✅ Creator (via creator()):', creator);
                            } catch (err) {
                                console.log('⚠️ creator() not found, trying owner()...');
                                try {
                                    creator = await contract.owner();
                                    console.log('✅ Creator (via owner()):', creator);
                                } catch (err2) {
                                    console.error('❌ Both creator() and owner() failed:', err2);
                                    return;
                                }
                            }

                            // Check if user is the creator (case-insensitive)
                            const isCreator = creator.toLowerCase() === userAddress.toLowerCase();
                            console.log(`${isCreator ? '✅' : '❌'} Match: ${isCreator ? 'USER IS CREATOR!' : 'Not creator'}`);

                            if (isCreator) {
                                const betCount = await contract.getBetCount();
                                const feePercent = await contract.feePercent();

                                console.log('Bet Count:', betCount.toString());
                                console.log('Fee Percent:', feePercent.toString());

                                // Calculate total bets and fees
                                let totalBets = BigInt(0);
                                for (let i = 0; i < Number(betCount); i++) {
                                    try {
                                        const bet = await contract.bets(i);
                                        totalBets += bet.amount;
                                    } catch (err) {
                                        console.warn(`⚠️ Could not fetch bet ${i}:`, err);
                                    }
                                }

                                console.log('Total Bets:', ethers.formatEther(totalBets), 'ETH');

                                // Fees = totalBets * feePercent / 10000
                                const fees = (totalBets * feePercent) / BigInt(10000);
                                console.log('Fees Earned:', ethers.formatEther(fees), 'ETH');

                                creatorMarketsData.push({
                                    market,
                                    creator,
                                    totalBetsReceived: totalBets,
                                    feesEarned: fees,
                                });

                                totalColl += market.collateral;
                                totalFees += fees;

                                console.log('✅ Added to creator markets!');
                            }
                        } catch (err) {
                            console.error(`❌ Error fetching creator data for ${market.marketAddress}:`, err);
                        }
                    })
                );

                console.log('\n📈 SUMMARY:');
                console.log('Total Creator Markets Found:', creatorMarketsData.length);
                console.log('Total Collateral:', ethers.formatEther(totalColl), 'ETH');
                console.log('Total Fees:', ethers.formatEther(totalFees), 'ETH');

                creatorMarketsData.sort((a, b) => Number(b.market.roundId - a.market.roundId));
                setCreatorMarkets(creatorMarketsData);
                setTotalCollateral(totalColl);
                setTotalFeesEarned(totalFees);
            } catch (err) {
                console.error('❌ Error fetching creator markets:', err);
            }
        };

        fetchCreatorMarkets();
    }, [userAddress, provider, marketsInfo]);

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-paper text-ink flex items-center justify-center p-4">
                <div className="card-sketch text-center py-12 bg-white max-w-md w-full">
                    <div className="text-6xl mb-6">🔐</div>
                    <h2 className="text-3xl font-bold text-ink mb-4">
                        <EncryptedText text="Dashboard Locked" hoverOnly={false} animateOnView={true} />
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Connect your wallet to view your betting history and stats.
                    </p>
                    <div className="flex justify-center">
                        <ConnectButton />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-paper pb-20">
            <main className="container mx-auto px-4 py-12 max-w-5xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-ink mb-4 transform -rotate-1">
                        <EncryptedText text="Dashboard" hoverOnly={false} animateOnView={true} />
                    </h1>
                    <div className="h-2 w-32 bg-marker-yellow mx-auto mt-4 rounded-full transform rotate-1"></div>
                </div>

                {/* View Mode Tabs */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    <button
                        onClick={() => setViewMode('player')}
                        className={`px-6 md:px-8 py-3 font-bold border-2 rounded-sketch-sm transition-all w-full md:w-auto ${viewMode === 'player'
                            ? 'bg-marker-yellow border-ink shadow-sketch transform -translate-y-1'
                            : 'bg-white border-gray-200 text-gray-400 hover:border-ink/50'
                            }`}
                    >
                        Player View
                    </button>
                    <button
                        onClick={() => setViewMode('creator')}
                        className={`px-6 md:px-8 py-3 font-bold border-2 rounded-sketch-sm transition-all w-full md:w-auto ${viewMode === 'creator'
                            ? 'bg-marker-yellow border-ink shadow-sketch transform -translate-y-1'
                            : 'bg-white border-gray-200 text-gray-400 hover:border-ink/50'
                            }`}
                    >
                        Creator View {creatorMarkets.length > 0 && `(${creatorMarkets.length})`}
                    </button>
                </div>

                {/* Player View */}
                {viewMode === 'player' && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <div className="card-sketch bg-white transform rotate-1">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-100 rounded-full border-2 border-ink">
                                        <SketchDice className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 font-bold text-sm uppercase">Total Bets</p>
                                        <p className="text-3xl font-bold text-ink">{activeBets.length + pastBets.length}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card-sketch bg-white transform -rotate-1">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-yellow-100 rounded-full border-2 border-ink">
                                        <SketchMoneyBag className="w-8 h-8 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 font-bold text-sm uppercase">Total Wagered</p>
                                        <p className="text-3xl font-bold text-ink">{parseFloat(ethers.formatEther(totalWagered)).toFixed(4)} <span className="text-sm text-gray-400">ETH</span></p>
                                    </div>
                                </div>
                            </div>

                            <div className="card-sketch bg-white transform rotate-1">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-100 rounded-full border-2 border-ink">
                                        <SketchMoneyBag className="w-8 h-8 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 font-bold text-sm uppercase">Total Won (Claimed)</p>
                                        <p className="text-3xl font-bold text-green-600">{parseFloat(ethers.formatEther(totalWon)).toFixed(4)} <span className="text-sm text-gray-400">ETH</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Active Bets Section */}
                        <section className="mb-12">
                            <div className="flex items-center gap-3 mb-6">
                                <h2 className="text-2xl font-bold text-ink">
                                    <EncryptedText text="Active Bets" hoverOnly={false} animateOnView={true} />
                                </h2>
                                {loading && <span className="text-sm text-gray-500 animate-pulse">(Syncing...)</span>}
                            </div>

                            {activeBets.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {activeBets.map((bet, i) => (
                                        <BetCard key={`${bet.marketAddress}-${i}`} bet={bet} isActive={true} />
                                    ))}
                                </div>
                            ) : (
                                <div className="card-sketch bg-white text-center py-12 opacity-80">
                                    <p className="text-gray-500 font-bold">No active bets found.</p>
                                    <Link href="/markets" className="text-blue-600 hover:underline mt-2 inline-block">
                                        Browse Markets &rarr;
                                    </Link>
                                </div>
                            )}
                        </section>

                        {/* Past Bets Section */}
                        <section>
                            <h2 className="text-2xl font-bold text-ink mb-6">
                                <EncryptedText text="Betting History" hoverOnly={false} animateOnView={true} />
                            </h2>

                            {pastBets.length > 0 ? (
                                <div className="space-y-4">
                                    {pastBets.map((bet, i) => (
                                        <BetRow key={`${bet.marketAddress}-${i}`} bet={bet} />
                                    ))}
                                </div>
                            ) : (
                                <div className="card-sketch bg-white text-center py-12 opacity-80">
                                    <p className="text-gray-500 font-bold">No betting history.</p>
                                </div>
                            )}
                        </section>
                    </>
                )}

                {/* Creator View */}
                {viewMode === 'creator' && (
                    <>
                        {/* Creator Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <div className="card-sketch bg-white transform rotate-1">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-100 rounded-full border-2 border-ink">
                                        <SketchCreate className="w-8 h-8 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 font-bold text-sm uppercase">Markets Created</p>
                                        <p className="text-3xl font-bold text-ink">{creatorMarkets.length}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card-sketch bg-white transform -rotate-1">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-100 rounded-full border-2 border-ink">
                                        <SketchMoneyBag className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 font-bold text-sm uppercase">Total Collateral</p>
                                        <p className="text-3xl font-bold text-ink">{parseFloat(ethers.formatEther(totalCollateral)).toFixed(4)} <span className="text-sm text-gray-400">ETH</span></p>
                                    </div>
                                </div>
                            </div>

                            <div className="card-sketch bg-white transform rotate-1">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-100 rounded-full border-2 border-ink">
                                        <SketchChart className="w-8 h-8 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 font-bold text-sm uppercase">Fees Earned</p>
                                        <p className="text-3xl font-bold text-green-600">{parseFloat(ethers.formatEther(totalFeesEarned)).toFixed(4)} <span className="text-sm text-gray-400">ETH</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Creator Markets Section */}
                        <section>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                <h2 className="text-2xl font-bold text-ink">
                                    <EncryptedText text="My Markets" hoverOnly={false} animateOnView={true} />
                                </h2>
                                <Link href="/create" className="btn-sketch-primary px-4 py-2 text-sm w-full md:w-auto text-center">
                                    + Create Market
                                </Link>
                            </div>

                            {creatorMarkets.length > 0 ? (
                                <div className="space-y-4">
                                    {creatorMarkets.map((cm, i) => (
                                        <CreatorMarketCard key={`${cm.market.marketAddress}-${i}`} creatorMarket={cm} />
                                    ))}
                                </div>
                            ) : (
                                <div className="card-sketch bg-white text-center py-12 opacity-80">
                                    <div className="flex justify-center mb-6 opacity-50">
                                        <SketchCreate className="w-24 h-24 text-gray-300" />
                                    </div>
                                    <p className="text-gray-500 font-bold mb-4">You haven&apos;t created any markets yet.</p>
                                    <Link href="/create" className="btn-sketch-primary">
                                        Create Your First Market
                                    </Link>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}

function BetCard({ bet, isActive }: { bet: AggregatedBet; isActive: boolean }) {
    return (
        <div className="card-sketch bg-white hover:shadow-sketch-hover transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-marker-yellow px-3 py-1 text-xs font-bold border-l-2 border-b-2 border-ink rounded-bl-lg">
                Round #{bet.roundId.toString()}
            </div>

            <div className="flex justify-between items-start mb-4 mt-2">
                <div>
                    <p className="text-xs text-gray-500 font-bold uppercase">Your Number</p>
                    <p className="text-4xl font-bold text-ink font-mono">{bet.number.toString().padStart(bet.digits, '0')}</p>
                </div>
                <div className="text-right mr-8">
                    <p className="text-xs text-gray-500 font-bold uppercase">Wager</p>
                    <p className="text-xl font-bold text-ink">{ethers.formatEther(bet.amount)} ETH</p>
                </div>
            </div>

            <div className="bg-gray-50 p-3 rounded border border-gray-200 flex justify-between items-center">
                <div>
                    <p className="text-xs text-gray-500">Locked Odds</p>
                    <p className="font-bold">{(Number(bet.lockedOdds) / 100).toFixed(2)}x</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500">Potential Payout</p>
                    <p className="font-bold text-green-600">{ethers.formatEther(bet.potentialPayout)} ETH</p>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t-2 border-dashed border-ink/10 flex justify-between items-center">
                <Link href={`/market/${bet.marketAddress}`} className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
                    View Round <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
                <span className="badge-sketch bg-blue-100 text-blue-800 text-xs">
                    {isActive ? 'In Progress' : 'Finished'}
                </span>
            </div>
        </div>
    );
}

function BetRow({ bet }: { bet: AggregatedBet }) {
    return (
        <div className="card-sketch bg-white p-4 flex flex-col md:flex-row items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border-2 border-ink font-bold text-gray-500">
                    #{bet.roundId.toString()}
                </div>
                <div>
                    <p className="font-bold text-ink">Bet on {bet.number.toString().padStart(bet.digits, '0')}</p>
                    <p className="text-xs text-gray-500">{ethers.formatEther(bet.amount)} ETH at {(Number(bet.lockedOdds) / 100).toFixed(2)}x</p>
                </div>
            </div>

            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right">
                    <p className="text-xs text-gray-500 font-bold uppercase">Result</p>
                    {bet.claimed ? (
                        <span className="text-green-600 font-bold flex items-center gap-1">
                            <SketchMoneyBag className="w-4 h-4" /> Won & Claimed
                        </span>
                    ) : (
                        <span className="text-gray-400 font-bold">
                            Settled
                        </span>
                    )}
                </div>

                <Link href={`/market/${bet.marketAddress}`} className="btn-sketch px-4 py-2 text-sm">
                    View
                </Link>
            </div>
        </div>
    );
}

function CreatorMarketCard({ creatorMarket }: { creatorMarket: CreatorMarket }) {
    const { market, totalBetsReceived, feesEarned } = creatorMarket;
    const isActive = !market.isResolved && Date.now() / 1000 < Number(market.betDeadline);

    return (
        <div className="card-sketch bg-white p-6 hover:shadow-sketch-hover transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-ink mb-1">Round #{market.roundId.toString()}</h3>
                    <p className="text-sm text-gray-500">{market.digits} Digits • Created {new Date(Number(market.createdAt) * 1000).toLocaleDateString()}</p>
                </div>
                <span className={`badge-sketch ${isActive ? 'badge-active' : 'badge-closed'}`}>
                    {isActive ? 'Active' : market.isResolved ? 'Resolved' : 'Closed'}
                </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Collateral</p>
                    <p className="text-lg font-bold text-ink">{parseFloat(ethers.formatEther(market.collateral)).toFixed(3)} ETH</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Total Bets</p>
                    <p className="text-lg font-bold text-ink">{parseFloat(ethers.formatEther(totalBetsReceived)).toFixed(3)} ETH</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Fees Earned</p>
                    <p className="text-lg font-bold text-green-600">{parseFloat(ethers.formatEther(feesEarned)).toFixed(3)} ETH</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Status</p>
                    <p className="text-lg font-bold text-ink">{isActive ? '🟢 Open' : '⚪ Settled'}</p>
                </div>
            </div>

            <Link href={`/market/${market.marketAddress}`} className="btn-sketch w-full text-center">
                Manage Market →
            </Link>
        </div>
    );
}
