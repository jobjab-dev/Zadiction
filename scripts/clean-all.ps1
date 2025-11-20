# Clean All Script (PowerShell)
# Removes all caches, artifacts, and generated files

Write-Host ""
Write-Host "🧹 Cleaning entire project..." -ForegroundColor Yellow
Write-Host ""

# Remove node_modules
Write-Host "📦 Cleaning node_modules..." -ForegroundColor Cyan
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue node_modules
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue packages\*/node_modules
Write-Host "✅ node_modules cleaned" -ForegroundColor Green

# Remove build artifacts
Write-Host ""
Write-Host "🔨 Cleaning build artifacts..." -ForegroundColor Cyan
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue packages\hardhat\cache
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue packages\hardhat\artifacts
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue packages\hardhat\typechain-types
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue packages\nextjs\.next
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue packages\nextjs\out
Write-Host "✅ Build artifacts cleaned" -ForegroundColor Green

# Remove deployment files
Write-Host ""
Write-Host "📝 Cleaning deployments..." -ForegroundColor Cyan
Remove-Item -Force -ErrorAction SilentlyContinue packages\hardhat\deployments\*.json
Remove-Item -Force -ErrorAction SilentlyContinue packages\nextjs\src\contracts\deployedContracts.json
Write-Host "✅ Deployments cleaned" -ForegroundColor Green

# Remove lock files (optional)
# Remove-Item -Force -ErrorAction SilentlyContinue pnpm-lock.yaml

Write-Host ""
Write-Host "✨ Clean complete!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Next steps:" -ForegroundColor Yellow
Write-Host "   pnpm install"
Write-Host "   pnpm sepolia:deploy"
Write-Host ""

