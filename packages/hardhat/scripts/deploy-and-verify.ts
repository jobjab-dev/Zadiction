import { ethers, run } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Deploy Factory + Verify Script
 * 
 * This script:
 * 1. Deploys PredictionMarketFactory
 * 2. Verifies on Etherscan
 * 3. Optionally creates first market
 * 4. Saves addresses to file
 */

async function main() {
  console.log("\n🚀 Starting deployment process...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📍 Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // ========================================
  // Step 1: Deploy Factory
  // ========================================
  console.log("📦 Step 1: Deploying PredictionMarketFactory...");
  
  const Factory = await ethers.getContractFactory("PredictionMarketFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();
  
  const factoryAddress = await factory.getAddress();
  console.log("✅ Factory deployed at:", factoryAddress);
  console.log("👤 Owner:", deployer.address);

  // Wait for confirmations
  console.log("\n⏳ Waiting for 5 confirmations...");
  await factory.deploymentTransaction()?.wait(5);
  console.log("✅ Confirmed!\n");

  // ========================================
  // Step 2: Verify on Etherscan
  // ========================================
  console.log("🔍 Step 2: Verifying contract on Etherscan...");
  
  try {
    await run("verify:verify", {
      address: factoryAddress,
      constructorArguments: [],
    });
    console.log("✅ Contract verified successfully!");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract already verified!");
    } else {
      console.error("❌ Verification failed:", error.message);
      console.log("💡 You can verify manually later with:");
      console.log(`   npx hardhat verify --network sepolia ${factoryAddress}\n`);
    }
  }

  // Note: Create markets via UI at /admin/create
  // No need to create during deployment

  // ========================================
  // Step 4: Save Addresses
  // ========================================
  console.log("\n📋 Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Factory Address:   ", factoryAddress);
  console.log("Owner:             ", deployer.address);
  console.log("Network:           ", (await ethers.provider.getNetwork()).name);
  console.log("Chain ID:          ", (await ethers.provider.getNetwork()).chainId);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  console.log("\n🎯 Next Steps:");
  console.log("1. Save Factory Address to .env.local:");
  console.log(`   NEXT_PUBLIC_FACTORY_ADDRESS=${factoryAddress}`);
  console.log("\n2. View on Etherscan:");
  console.log(`   https://sepolia.etherscan.io/address/${factoryAddress}`);
  console.log("\n3. Start frontend:");
  console.log("   pnpm start");
  console.log("\n4. Create markets:");
  console.log("   http://localhost:3000/admin/create");
  console.log("\n✨ Deployment complete!\n");

  // Save to file
  const fs = require("fs");
  const path = require("path");
  
  // Create deployments directory
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    factoryAddress: factoryAddress,
    owner: deployer.address,
    deployedAt: new Date().toISOString(),
    etherscanUrl: `https://sepolia.etherscan.io/address/${factoryAddress}`,
  };

  fs.writeFileSync(
    path.join(deploymentsDir, "latest.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("💾 Deployment info saved to: deployments/latest.json\n");
  
  // Also save to frontend for easy access
  const frontendConfigDir = path.join(__dirname, "..", "..", "nextjs", "src", "contracts");
  if (!fs.existsSync(frontendConfigDir)) {
    fs.mkdirSync(frontendConfigDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(frontendConfigDir, "deployedContracts.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("💾 Deployment info copied to frontend\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });

