$commitMessage = @"
perf: forum web3 redesign + capital ledger hardening + DPI wave fix

FORUM - ZERO-LOAD ARCHITECTURE:
- Removed framer-motion from template.tsx (instant tab navigation)
- Removed all blocking loading guards from all forum pages

FORUM - WEB3 MINIMALIST REDESIGN:
- ForumHeader: removed Old English logotype + lucide icons, mono text nav
- forum/page.tsx: clean tab bar + topic list, client-side fetch
- forum/new/page.tsx: fixed style-jsx App Router bug, mono composer
- t/[id]/page.tsx: removed sidebar, blue colors, icons; PostRow mono
- u/[address]/page.tsx: tabs ACTIVITY/TOPICS/REPLIES, mono feed
- tags/page.tsx: monochrome bar chart, no Tag icons
- notifications/page.tsx: signal log table, no colored icons
- badges/page.tsx: plain text table, no Award/Star/Zap icons
- groups/page.tsx: cohort table with live Prisma counts
- guidelines/page.tsx: numbered rules mono, no Shield icons
- anniversaries/page.tsx: epoch table, no Cake icon
- forum/layout.tsx: bg #FAF9F6, text #050505, max-w 920px

CAPITAL LEDGER - HARDENING:
- New route /api/analytics/mass-transfers (ETH+BSC+BASE)
- api-client.ts: direct fetch, 30s refetch / 25s stale
- MassTransferIntel.tsx: floor pills ALL/`$100K to `$50M
- Real Sync button with bust cache + queryClient invalidate
- Removed ArrowUpDown unused import and framer-motion

WAVE PATTERN - MAX DPI FIX:
- WavePatternOverlay reads devicePixelRatio on mount
- Patron Cosmico: 280px/DPR CSS = same physical px on all screens
- Hokusai wave: 100% auto replaced with cover (no mobile zoom)

FORUM SEED - 50 INSTITUTIONAL NODES:
- /api/admin/seed-forum: 50 users, 10 topics, 48 replies
- Topics: ZK-SNARKs, MEV, Noir, DeFi yields, RWA, whale clustering
"@

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " SOVEREIGN TERMINAL - INSTITUTIONAL DEPLOYMENT (POWERSHELL) " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] Staging all changes..." -ForegroundColor Yellow
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: git add failed." -ForegroundColor Red
    exit 1
}
Write-Host "OK - staged." -ForegroundColor Green
Write-Host ""

Write-Host "[2/3] Committing..." -ForegroundColor Yellow
$commitFile = Join-Path $env:TEMP "system_commit.txt"
$commitMessage | Out-File -FilePath $commitFile -Encoding UTF8
git commit -F $commitFile
Remove-Item $commitFile -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "[3/3] Pushing to origin/main..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: git push failed. Check remote and credentials." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host " PUSH COMPLETE - RAILWAY AUTO-DEPLOYS IN ~90 SECONDS" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host " POST-DEPLOY CHECKLIST:" -ForegroundColor Magenta
Write-Host " 1. GET /api/admin/seed-forum  (populate 50 users + topics)"
Write-Host " 2. Check Capital Ledger tab   (floor pills + LIVE indicator)"
Write-Host " 3. Open on iPhone/Android     (wave should be crisp at any DPI)"
Write-Host ""
