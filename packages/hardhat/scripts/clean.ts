import * as fs from 'fs';
import * as path from 'path';

/**
 * Clean script - Clear all caches and old deployments
 * Run this before deploying to ensure fresh state
 */

function removeDir(dirPath: string) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`✅ Removed: ${dirPath}`);
  }
}

function removeFile(filePath: string) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`✅ Removed: ${filePath}`);
  }
}

async function main() {
  console.log("\n🧹 Cleaning project...\n");

  const rootDir = path.join(__dirname, '..');

  // Remove Hardhat cache and artifacts
  console.log("📦 Cleaning Hardhat cache & artifacts...");
  removeDir(path.join(rootDir, 'cache'));
  removeDir(path.join(rootDir, 'artifacts'));
  removeDir(path.join(rootDir, 'typechain-types'));

  // Remove deployment files
  console.log("\n📝 Cleaning deployment files...");
  const deploymentsDir = path.join(rootDir, 'deployments');
  if (fs.existsSync(deploymentsDir)) {
    const files = fs.readdirSync(deploymentsDir);
    files.forEach(file => {
      if (file.endsWith('.json')) {
        removeFile(path.join(deploymentsDir, file));
      }
    });
  }

  // Remove generated frontend contracts
  console.log("\n🎨 Cleaning frontend generated files...");
  const frontendContractsDir = path.join(rootDir, '..', 'nextjs', 'src', 'contracts');
  if (fs.existsSync(frontendContractsDir)) {
    const files = fs.readdirSync(frontendContractsDir);
    files.forEach(file => {
      if (file.endsWith('.json') && file !== 'factoryABI.ts') {
        removeFile(path.join(frontendContractsDir, file));
      }
    });
  }

  console.log("\n✨ Clean complete! Ready for fresh deployment.\n");
  console.log("💡 Next steps:");
  console.log("   1. pnpm contracts:build");
  console.log("   2. pnpm sepolia:deploy\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

