import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deployment script for Prediction Market Factory
 * 
 * This is the MAIN deployment script.
 * Deploy Factory once → Create unlimited markets via UI
 */
const deployFactory: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("\n🏭 Deploying Prediction Market Factory...");
  console.log("📍 Deployer (will be owner):", deployer);

  const result = await deploy("PredictionMarketFactory", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  if (result.newlyDeployed) {
    console.log("\n✅ Factory deployed successfully!");
    console.log("📍 Factory address:", result.address);
    console.log("👤 Owner:", deployer);
    console.log("\n💡 Next Steps:");
    console.log("  1. Save to .env.local:");
    console.log(`     NEXT_PUBLIC_FACTORY_ADDRESS=${result.address}`);
    console.log("\n  2. Create markets via UI:");
    console.log("     http://localhost:3000/admin/create");
    console.log("\n  3. View all markets:");
    console.log("     http://localhost:3000/markets");
    console.log("\n🎉 Ready to create unlimited markets!\n");
  }
};

export default deployFactory;
deployFactory.tags = ["PredictionMarketFactory", "Factory", "all"];

