#  Whale Alert Hub V3 - One-Click Deployment Script
# Run this once Railway Incident is resolved: "All systems operational"

Write-Host "Checking Railway Login Status..." -ForegroundColor Cyan
railway whoami

if ($LASTEXITCODE -ne 0) {
    Write-Host "️ Not logged into Railway. Please run 'railway login' first." -ForegroundColor Yellow
    exit
}

Write-Host " Starting Production Push (V3 Master Branding)..." -ForegroundColor Green
railway up

if ($LASTEXITCODE -eq 0) {
    Write-Host " DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host "The new Red Hexagonal branding is now LIVE." -ForegroundColor Cyan
} else {
    Write-Host " Deployment failed. Check the logs above." -ForegroundColor Red
}
