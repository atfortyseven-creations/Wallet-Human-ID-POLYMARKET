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
    './components/network/ledger/EntityNexus.tsx',
    './components/network/ledger/LedgerProfiler.tsx',
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
    './components/premium/TacticalLedgerDatabase.tsx',
    './components/premium/ToastManager.tsx',
    './components/premium/TokenChartOverlay.tsx',
    './components/premium/WalletAnalyticsPanel.tsx',
    './components/premium/LedgerTracker.tsx',
    './components/premium/LedgerVerificationReport.tsx',
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
    './components/terminal/LedgerContractModal.tsx',
    './components/terminal/LedgerSonar.tsx',
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
    './app/ledgerpost/full-report/page.tsx'
];

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    const hasLucide = content.includes('lucide-react');
    if (!hasLucide) {
        // Add import at the top
        const firstImportIdx = content.indexOf('import');
        if (firstImportIdx !== -1) {
            content = content.slice(0, firstImportIdx) + "import { Shield } from 'lucide-react';\n" + content.slice(firstImportIdx);
        } else {
            content = "import { Shield } from 'lucide-react';\n" + content;
        }
    } else {
        // Replace existing import { ... } from 'lucide-react' with import { ..., Shield } from 'lucide-react'
        content = content.replace(/import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/, (match, p1) => {
            if (!p1.includes('Shield')) {
                return `import { ${p1.trim()}, Shield } from 'lucide-react'`;
            }
            return match;
        });
    }
    fs.writeFileSync(f, content);
    console.log("Fixed " + f);
});
