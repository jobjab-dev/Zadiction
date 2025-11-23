import { expect } from "chai";
import { ethers } from "hardhat";
import { ZadictionLottery, MockZadictionLottery } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("ZadictionLottery", function () {
    let lottery: ZadictionLottery;
    let owner: HardhatEthersSigner;
    let player1: HardhatEthersSigner;
    let player2: HardhatEthersSigner;
    let protocolTreasury: HardhatEthersSigner;

    const ROUND_ID = 1;
    const DIGITS = 2; // 00-99
    const BET_PERIOD = 3600; // 1 hour
    const INITIAL_ODDS = 10000; // 100x
    const MIN_ODDS = 110; // 1.1x
    const CREATOR_FEE = 500; // 5%
    const PROTOCOL_FEE = 25; // 0.25%
    const COLLATERAL = ethers.parseEther("1.0"); // 1 ETH

    beforeEach(async function () {
        [owner, player1, player2, protocolTreasury] = await ethers.getSigners();

        const LotteryFactory = await ethers.getContractFactory("ZadictionLottery");
        lottery = (await LotteryFactory.deploy(
            owner.address,
            ROUND_ID,
            DIGITS,
            BET_PERIOD,
            INITIAL_ODDS,
            MIN_ODDS,
            CREATOR_FEE,
            PROTOCOL_FEE,
            protocolTreasury.address,
            { value: COLLATERAL }
        )) as ZadictionLottery;

        await lottery.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the correct owner and parameters", async function () {
            expect(await lottery.owner()).to.equal(owner.address);
            expect(await lottery.roundId()).to.equal(ROUND_ID);
            expect(await lottery.digits()).to.equal(DIGITS);
            expect(await lottery.initialOdds()).to.equal(INITIAL_ODDS);
            expect(await lottery.liabilityLimit()).to.equal(COLLATERAL);
        });

        it("Should have correct initial balance", async function () {
            const balance = await ethers.provider.getBalance(await lottery.getAddress());
            expect(balance).to.equal(COLLATERAL);
        });
    });

    describe("Betting Logic (AMM)", function () {
        it("Should allow placing a bet and update exposure", async function () {
            const number = 42;
            const betAmount = ethers.parseEther("0.01");

            // Calculate expected net amount (deducting fees)
            const creatorFee = (betAmount * BigInt(CREATOR_FEE)) / 10000n;
            const protocolFee = (betAmount * BigInt(PROTOCOL_FEE)) / 10000n;
            const netAmount = betAmount - creatorFee - protocolFee;

            // Initial exposure should be 0
            expect(await lottery.exposure(number)).to.equal(0);

            await lottery.connect(player1).placeBet(number, { value: betAmount });

            // Check exposure increased
            const exposure = await lottery.exposure(number);
            expect(exposure).to.be.gt(0);

            // Check total stakes
            expect(await lottery.totalStakes(number)).to.equal(netAmount);
        });

        it("Should decrease odds as exposure increases (Slippage)", async function () {
            const number = 77;
            // Use a small bet that doesn't immediately hit minOdds
            // Collateral 1 ETH. Initial Odds 100x.
            // Max payout ~1 ETH.
            // Bet 0.001 ETH -> Payout 0.1 ETH. Exposure 0.05 ETH (5% of limit).
            const betAmount = ethers.parseEther("0.001");

            const odds1 = await lottery.getOdds(number, betAmount);

            // Place first bet
            await lottery.connect(player1).placeBet(number, { value: betAmount });

            // Place second bet of same amount
            const odds2 = await lottery.getOdds(number, betAmount);

            // Odds should have decreased
            expect(odds2).to.be.lt(odds1);
            console.log(`\tOdds 1: ${Number(odds1) / 100}x`);
            console.log(`\tOdds 2: ${Number(odds2) / 100}x`);
        });

        it("Should revert if bet exceeds liability limit (Solvency)", async function () {
            const number = 99;
            // Even at minOdds (1.1x), the payout must exceed collateral (1 ETH)
            // 1.0 ETH * 1.1 = 1.1 ETH > 1.0 ETH

            const hugeBet = ethers.parseEther("1.0");

            await expect(
                lottery.connect(player1).placeBet(number, { value: hugeBet })
            ).to.be.revertedWithCustomError(lottery, "ExceedsLimit");
        });

        it("Should distribute fees correctly", async function () {
            const number = 5;
            const betAmount = ethers.parseEther("0.01"); // Small bet to pass solvency

            const creatorFee = (betAmount * BigInt(CREATOR_FEE)) / 10000n; // 0.05 ETH
            const protocolFee = (betAmount * BigInt(PROTOCOL_FEE)) / 10000n; // 0.0025 ETH

            const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
            const treasuryBalanceBefore = await ethers.provider.getBalance(protocolTreasury.address);

            await lottery.connect(player1).placeBet(number, { value: betAmount });

            const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
            const treasuryBalanceAfter = await ethers.provider.getBalance(protocolTreasury.address);

            expect(ownerBalanceAfter - ownerBalanceBefore).to.equal(creatorFee);
            expect(treasuryBalanceAfter - treasuryBalanceBefore).to.equal(protocolFee);
        });
    });

    describe("Withdrawal", function () {
        it("Should not allow withdrawal before round ends", async function () {
            await expect(lottery.withdrawCollateral()).to.be.revertedWithCustomError(lottery, "RoundNotEnded");
        });
    });

    describe("Game Flow (End-to-End with Mock)", function () {
        let mockLottery: MockZadictionLottery;

        beforeEach(async function () {
            const MockFactory = await ethers.getContractFactory("MockZadictionLottery");
            mockLottery = (await MockFactory.deploy(
                owner.address,
                ROUND_ID,
                DIGITS,
                BET_PERIOD,
                INITIAL_ODDS,
                MIN_ODDS,
                CREATOR_FEE,
                PROTOCOL_FEE,
                protocolTreasury.address,
                { value: COLLATERAL }
            )) as MockZadictionLottery;
            await mockLottery.waitForDeployment();
        });

        it("Should allow full game flow: Bet -> Resolve -> Claim", async function () {
            const winningNum = 42;
            const losingNum = 99;
            const betAmount = ethers.parseEther("0.01");

            // 1. Place Bets
            await mockLottery.connect(player1).placeBet(winningNum, { value: betAmount });
            await mockLottery.connect(player2).placeBet(losingNum, { value: betAmount });

            // 2. Resolve Round (Mock FHE)
            await mockLottery.forceResolve(winningNum);

            // 3. Claim Winnings
            const balanceBefore = await ethers.provider.getBalance(player1.address);

            await expect(mockLottery.connect(player1).claimWinnings()).to.not.be.reverted;

            // 4. Loser cannot claim
            await expect(mockLottery.connect(player2).claimWinnings()).to.be.revertedWithCustomError(mockLottery, "NothingToClaim");
        });

        it("Should allow owner to withdraw remaining collateral", async function () {
            const winningNum = 10;
            await mockLottery.forceResolve(winningNum);

            await expect(mockLottery.connect(owner).withdrawCollateral()).to.not.be.reverted;
        });

        it("Should revert if betting after deadline", async function () {
            // Increase time to pass deadline
            await ethers.provider.send("evm_increaseTime", [BET_PERIOD + 1]);
            await ethers.provider.send("evm_mine", []);

            const number = 42;
            const betAmount = ethers.parseEther("0.01");

            await expect(
                mockLottery.connect(player1).placeBet(number, { value: betAmount })
            ).to.be.revertedWithCustomError(mockLottery, "RoundEnded");
        });

        it("Should revert if claiming twice", async function () {
            const winningNum = 42;
            const betAmount = ethers.parseEther("0.01");

            await mockLottery.connect(player1).placeBet(winningNum, { value: betAmount });
            await mockLottery.forceResolve(winningNum);

            // First claim should succeed
            await mockLottery.connect(player1).claimWinnings();

            // Second claim should fail
            await expect(
                mockLottery.connect(player1).claimWinnings()
            ).to.be.revertedWithCustomError(mockLottery, "NothingToClaim");
        });
    });
});
