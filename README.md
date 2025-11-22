# 🎲 Zadiction - Decentralized Lottery AMM

> A transparent, linear-capped lottery AMM with dynamic odds and secure on-chain RNG powered by Zama FHEVM.

[![Zama FHEVM](https://img.shields.io/badge/Zama-FHEVM%20v0.9-yellow)](https://docs.zama.ai/fhevm)
[![License](https://img.shields.io/badge/license-BSD--3--Clause--Clear-blue.svg)](LICENSE)

**Built for Zama Developer Program - November 2025**

---

## 🎨 Unique "Sketch" Aesthetic

Zadiction features a distinct **Hand-Drawn / Sketch Paper** theme, moving away from the standard "corporate crypto" look.
- **Paper Backgrounds**: Textured, natural feel.
- **Marker Fonts**: Comic Sans, Marker Felt.
- **Sketch Icons**: Custom SVG icons drawn to look like pencil sketches.
- **Animations**: Smooth CSS animations for toasts and interactions.

---

## 🎯 Overview

Zadiction is a **Lottery Automated Market Maker (AMM)** where users bet against a liquidity pool (collateral). Unlike traditional lotteries with fixed pools, Zadiction offers **fixed-odds betting** (locked at the time of the bet) that dynamically adjust based on the market's risk exposure.

### Key Features

- **📊 Dynamic Odds AMM** - Odds adjust automatically based on market exposure. If many people bet on "77", the odds for "77" decrease to protect solvency.
- **🎲 Secure On-Chain RNG** - Uses **Zama FHEVM** (`TFHE.randEuint64`) to generate truly unpredictable random numbers on-chain without centralized oracles.
- **🛡️ Solvency Protection** - The contract enforces a "Liability Limit" to ensure it can always pay out winners.
- **👨‍🎨 Creator Economy** - Anyone can create a lottery round by providing collateral and earn **Creator Fees** from every bet.
- **📱 Responsive Design** - Fully optimized for mobile and desktop with a custom hamburger menu and responsive layouts.

---

## 🏗️ Architecture

### Smart Contracts

- **`LotteryFactory.sol`**: Manages the creation of new lottery rounds. Tracks all deployed markets.
- **`ZadictionLottery.sol`**: The core logic for each lottery round.
    - Handles betting, odds calculation, and payouts.
    - Uses `TFHE.randEuint64()` for the winning number draw.
    - Implements the "Linear-Capped AMM" math.

### Frontend (Next.js)

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with custom "Sketch" theme configuration.
- **Web3**: `wagmi`, `viem`, `ethers.js v6`, `RainbowKit`.
- **Interactions**:
    - **Market Creation**: Deploys new contracts via Factory.
    - **Betting**: Real-time odds calculation and transaction submission.
    - **Dashboard**: Aggregated view of user bets and creator stats.

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- MetaMask wallet (configured for Zama Devnet or Sepolia)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd Zadiction
   pnpm install
   ```

2. **Setup Environment**
   ```bash
   cd packages/nextjs
   cp .env.example .env.local
   # Add your wallet connect project ID if needed
   ```

3. **Start Frontend**
   ```bash
   pnpm start
   ```
   Access the app at `http://localhost:3000`

---

## 📜 Scripts & Deployment

We provide several utility scripts in `packages/hardhat/scripts` to manage the project lifecycle.

### 1. Deploy & Verify
Deploys the Factory contract and automatically verifies it on the explorer.
```bash
cd packages/hardhat
pnpm sepolia:deploy
```
*Runs `scripts/deploy-and-verify.ts`*

### 2. Auto-Export ABIs
Extracts the latest contract ABIs and updates the frontend configuration.
```bash
pnpm export-abis
```
*Runs `scripts/export-abis.ts`*

### 3. Verify Manually
If verification fails during deployment, you can verify manually:
```bash
npx hardhat run scripts/verify.ts --network sepolia
```

---

## 🎮 How It Works (Technical Deep Dive)

### 1. Market Creation (Factory)
A "Market Maker" (Creator) calls `createMarket` on the Factory.
- **Inputs**: Digits (2/3), Duration, Initial Odds (e.g., 70x), Fees.
- **Action**: Factory deploys a new `ZadictionLottery` clone.
- **Collateral**: Creator locks ETH to back the bets.

### 2. Dynamic Odds Calculation (AMM)
When a user bets on a number (e.g., "42"), the contract calculates odds using a **Linear-Capped AMM** model:
```solidity
// Simplified Logic
exposure = totalPotentialPayoutsForNumber["42"]
liabilityLimit = collateral * (1 - fee)

// As exposure increases, odds decrease
currentOdds = initialOdds * (liabilityLimit - exposure) / liabilityLimit
```
This ensures the contract never promises more than it can pay.

### 3. The Draw (FHE Powered)
When the round ends, `drawResult()` is called.
1. **Generate**: `TFHE.randEuint64()` creates an encrypted random number.
2. **Decrypt**: The contract requests decryption via the Zama Gateway.
3. **Reveal**: The decrypted number is returned via callback.
4. **Compute**: `winningNumber = random % maxNumber`

### 4. Claim Winnings
Winners call `claimWinnings()`.
- The contract checks `userBetIndices` to find winning bets.
- Payouts are sent directly to the user's wallet.

---

## 🔧 Technology Stack

- **Solidity 0.8.24**
- **Zama FHEVM** (On-chain Randomness)
- **Hardhat**
- **Next.js 14**
- **Tailwind CSS**
- **RainbowKit / Wagmi**

---

## 📝 License

BSD-3-Clause-Clear

---

**Built with ❤️ for Zama Community**
