#!/bin/bash

# Clean All Script
# Removes all caches, artifacts, and generated files

echo ""
echo "🧹 Cleaning entire project..."
echo ""

# Remove node_modules
echo "📦 Cleaning node_modules..."
rm -rf node_modules
rm -rf packages/*/node_modules
echo "✅ node_modules cleaned"

# Remove build artifacts
echo ""
echo "🔨 Cleaning build artifacts..."
rm -rf packages/hardhat/cache
rm -rf packages/hardhat/artifacts
rm -rf packages/hardhat/typechain-types
rm -rf packages/nextjs/.next
rm -rf packages/nextjs/out
echo "✅ Build artifacts cleaned"

# Remove deployment files
echo ""
echo "📝 Cleaning deployments..."
rm -rf packages/hardhat/deployments/*.json
rm -rf packages/nextjs/src/contracts/deployedContracts.json
echo "✅ Deployments cleaned"

# Remove lock files (optional)
# rm -rf pnpm-lock.yaml

echo ""
echo "✨ Clean complete!"
echo ""
echo "💡 Next steps:"
echo "   pnpm install"
echo "   pnpm sepolia:deploy"
echo ""

