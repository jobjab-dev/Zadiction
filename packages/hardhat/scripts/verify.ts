import { run } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  // Replace with your deployed contract address
  const contractAddress = process.env.CONTRACT_ADDRESS || "";
  
  if (!contractAddress) {
    console.error("❌ Please set CONTRACT_ADDRESS in .env file");
    process.exit(1);
  }

  console.log("🔍 Verifying contract on Etherscan...");
  console.log("Contract address:", contractAddress);

  // Market parameters (must match deployment)
  const question = process.env.MARKET_QUESTION || "Will Zama Developer Program November have >500 participants?";
  const stakeAmountEth = process.env.MARKET_STAKE_AMOUNT || "0.01";
  const { ethers } = require("hardhat");
  const stakeAmount = ethers.parseEther(stakeAmountEth);
  
  const commitPeriodDays = parseInt(process.env.MARKET_COMMIT_PERIOD_DAYS || "7");
  const commitPeriod = commitPeriodDays * 24 * 60 * 60;
  
  const resolvePeriodDays = parseInt(process.env.MARKET_RESOLVE_PERIOD_DAYS || "3");
  const resolvePeriod = resolvePeriodDays * 24 * 60 * 60;
  
  const resolver = process.env.MARKET_RESOLVER_ADDRESS || process.env.DEPLOYER_ADDRESS || "";
  
  const creatorFeePercentValue = parseInt(process.env.MARKET_CREATOR_FEE_PERCENT || "2");
  const creatorFeePercent = creatorFeePercentValue * 100;

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [
        question,
        stakeAmount,
        commitPeriod,
        resolvePeriod,
        resolver,
        creatorFeePercent,
      ],
    });

    console.log("✅ Contract verified successfully!");
    console.log(`📍 View on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract already verified!");
    } else {
      console.error("❌ Verification failed:", error.message);
      process.exit(1);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

