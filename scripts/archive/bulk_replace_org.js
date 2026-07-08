const fs = require('fs');
const path = require('path');

const directory = '.';
const filesToModify = [
    ".gitattributes",
    ".github/CODEOWNERS",
    ".github/FUNDING.yml",
    ".github/ISSUE_TEMPLATE/security_vulnerability.md",
    "DEPLOYMENT.md",
    "LICENSE",
    "NOTICE",
    "QUICKSTART.md",
    "README.md",
    "SOVEREIGN_WHITEPAPER.md",
    "app/api/admin/clean-posts/route.ts",
    "app/api/newsletter/subscribe/route.ts",
    "app/api/subscription/status/route.ts",
    "app/changelog/page.tsx",
    "app/forum/preferences/account/page.tsx",
    "app/forum/preferences/layout.tsx",
    "app/forum/u\\[address]/page.tsx",
    "app/layout.tsx",
    "app/legal/compliance/page.tsx",
    "app/legal/privacy/page.tsx",
    "app/legal/security/page.tsx",
    "app/legal/terms/page.tsx",
    "app/open-letter/page.tsx",
    "app/support/page.tsx",
    "components/landing/ImmersiveManifestoLanding.tsx",
    "components/landing/SystemFooter.tsx",
    "components/landing/WhaleAlertFooter.tsx",
    "components/layout/LegalDocLayout.tsx",
    "components/premium/WhaleTracker.tsx",
    "install.sh",
    "k8s/helm/Chart.yaml",
    "k8s/helm/values.yaml",
    "k8s/production.yaml",
    "lib/COPYRIGHT.ts",
    "lib/constants.ts",
    "lib/constants/architecturalManifesto.ts",
    "lib/security/premium-security-new.ts",
    "pitch_deck.html",
    "public/llms.txt",
    "public/pitch_deck.html",
    "scratch/seed-aztec.js",
    "test_html.html"
];

let totalReplaced = 0;

filesToModify.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let newContent = content.replace(/atfortyseven-creations/g, 'humanityledger');
        newContent = newContent.replace(/atfortyseven2/g, 'humanityledger');
        newContent = newContent.replace(/atfortyseven/g, 'humanityledger');
        
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log('Replaced in ' + file);
            totalReplaced++;
        }
    } else {
        console.warn('File not found: ' + file);
    }
});

console.log('Total files modified: ' + totalReplaced);
