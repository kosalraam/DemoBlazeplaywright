$ErrorActionPreference = "Stop"
Write-Host "Installing npm dependencies..." -ForegroundColor Cyan
npm install
Write-Host "Installing Playwright browsers..." -ForegroundColor Cyan
npx playwright install
Write-Host "Checking TypeScript..." -ForegroundColor Cyan
npm run typecheck
Write-Host "Setup complete. Try: npm run test:api" -ForegroundColor Green
