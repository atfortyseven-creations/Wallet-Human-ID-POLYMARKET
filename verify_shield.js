const fs = require('fs');

const files = [
    './components/auth/TuringShieldGate.tsx',
    './components/bsv/PermissionNexusModal.tsx',
    './components/bsv/SirDeggenBrowser.tsx',
    './components/chat/MessageEngine.tsx',
    './components/compliance/TermsGate.tsx',
    './components/developer/NoirCircuitSandbox.tsx',
    './components/infrastructure/SystemNodeCore.tsx',
    './components/landing/ClearanceView.tsx',
    './components/landing/LegendaryDownhead.tsx',
    './components/landing/ModuleShowcaseSections.tsx',
    './components/landing/SubmarineDeconstruction3D.tsx',
    './components/marketing/EarlyAccess.tsx',
    './components/network/ForensicHistoryVisualizer.tsx',
    './components/network/whale/EntityNexus.tsx',
    './components/network/whale/WhaleProfiler.tsx',
    './components/node_infrastructure/SecurityPanel.tsx',
    './components/notifications/NotificationCenter.tsx',
    './components/omni-matrix/DarkForestRadar.tsx',
    './components/onboarding/WelcomeModal.tsx',
    './components/passport/PassportView.tsx',
    './components/passport/PassportWalletGuard.tsx',
    './components/portfolio/AztecShieldingTerminal.tsx',
    './components/portfolio/PortfolioSecurityPanel.tsx',
    './components/portfolio/QuantumDeFiPositions.tsx',
    './components/portfolio/SecurityAllowances.tsx',
    './components/portfolio/TransactionHistory.tsx',
    './components/premium/AdvancedAnalytics.tsx',
    './components/premium/CopyTradingArena.tsx',
    './components/premium/LegendaryNewsFeed.tsx',
    './components/premium/MinimalDarkPool.tsx',
    './components/premium/TacticalWhaleDatabase.tsx',
    './components/premium/ToastManager.tsx',
    './components/premium/TokenChartOverlay.tsx',
    './components/premium/WalletAnalyticsPanel.tsx',
    './components/premium/WhaleTracker.tsx',
    './components/premium/WhaleVerificationReport.tsx',
    './components/privacy/CookieConsent.tsx',
    './components/privacy/NukeProfile.tsx',
    './components/provenance/ProvenanceStudioContent.tsx',
    './components/rainbow/OptimisticExecutionIndicator.tsx',
    './components/security/AntiTamperCore.tsx',
    './components/security/DeadmanSwitchPanel.tsx',
    './components/security/SecurityShield.tsx',
    './components/terminal/BitcoinPrimitives.tsx',
    './components/terminal/CoreMinerUI.tsx',
    './components/terminal/CoreWelcomeClaim.tsx',
    './components/terminal/DeFiYieldPanel.tsx',
    './components/terminal/ExecutionDock.tsx',
    './components/terminal/MempoolForensicsPanel.tsx',
    './components/terminal/NewPairsTable.tsx',
    './components/terminal/NewsOfToday.tsx',
    './components/terminal/OmniExplorer.tsx',
    './components/terminal/PolymarketPanel.tsx',
    './components/terminal/SystemAMLOracle.tsx',
    './components/terminal/WhaleContractModal.tsx',
    './components/terminal/WhaleSonar.tsx',
    './components/ui/GlobalErrorBoundary.tsx',
    './components/ui/InstitutionalErrorBoundary.tsx',
    './components/ui/TokenInfoModal.tsx',
    './components/VoidShell.tsx',
    './components/wallet/BiometricGuard.tsx',
    './components/wallet/WalletConnect.tsx',
    './components/walletconnect/SessionProposalModal.tsx',
    './app/changelog/page.tsx',
    './app/forum/admin/page.tsx',
    './app/forum/settings/page.tsx',
    './app/gold-registry/page.tsx',
    './app/terms/page.tsx',
    './app/whalepost/full-report/page.tsx'
];

let broken = 0;
files.forEach(f => {
    if (!fs.existsSync(f)) return;
    const content = fs.readFileSync(f, 'utf8');
    const hasShieldTag = content.match(/<Shield\b/);
    if (!hasShieldTag) return; // False positive in previous script

    // Check if Shield is properly imported
    const hasImport = content.match(/import\s+{([^}]*)\bShield\b([^}]*)}\s+from\s+['"]lucide-react['"]/);
    if (!hasImport) {
        console.log(`STILL BROKEN: ${f}`);
        broken++;
    }
});

console.log(`Done verification. Broken files: ${broken}`);
