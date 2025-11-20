/**
 * Clean All Script (Node.js)
 * Removes all caches, artifacts, and generated files
 * Cross-platform compatible
 */

const fs = require('fs');
const path = require('path');

function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`✅ Removed: ${dirPath}`);
    return true;
  }
  return false;
}

function removeFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`✅ Removed: ${filePath}`);
    return true;
  }
  return false;
}

function cleanDirectory(dirPath, pattern) {
  if (!fs.existsSync(dirPath)) return;
  
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    if (file.match(pattern)) {
      const filePath = path.join(dirPath, file);
      removeFile(filePath);
    }
  });
}

async function main() {
  console.log("\n🧹 Cleaning entire project...\n");

  const rootDir = __dirname + '/..';

  // ========================================
  // Clean Hardhat
  // ========================================
  console.log("📦 Cleaning Hardhat artifacts...");
  removeDir(path.join(rootDir, 'packages/hardhat/cache'));
  removeDir(path.join(rootDir, 'packages/hardhat/artifacts'));
  removeDir(path.join(rootDir, 'packages/hardhat/typechain-types'));
  
  console.log("\n📝 Cleaning deployments...");
  cleanDirectory(path.join(rootDir, 'packages/hardhat/deployments'), /\.json$/);

  // ========================================
  // Clean Next.js
  // ========================================
  console.log("\n🎨 Cleaning Next.js build...");
  removeDir(path.join(rootDir, 'packages/nextjs/.next'));
  removeDir(path.join(rootDir, 'packages/nextjs/out'));
  
  console.log("\n📝 Cleaning generated contracts...");
  const contractsFile = path.join(rootDir, 'packages/nextjs/src/contracts/deployedContracts.json');
  removeFile(contractsFile);

  // ========================================
  // Clean node_modules (optional)
  // ========================================
  // Uncomment to clean node_modules too
  // console.log("\n📦 Cleaning node_modules...");
  // removeDir(path.join(rootDir, 'node_modules'));
  // removeDir(path.join(rootDir, 'packages/hardhat/node_modules'));
  // removeDir(path.join(rootDir, 'packages/nextjs/node_modules'));

  console.log("\n✨ Clean complete! Ready for fresh deployment.\n");
  console.log("💡 Next steps:");
  console.log("   1. pnpm contracts:build     # Compile");
  console.log("   2. pnpm sepolia:deploy      # Deploy + Verify");
  console.log("   3. pnpm start               # Start app");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Clean failed:", error);
    process.exit(1);
  });

