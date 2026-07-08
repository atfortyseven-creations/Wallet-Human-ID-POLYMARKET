const fs = require('fs');
const path = require('path');

const routes = [
    'app/api/aztec/anchor/route.ts',
    'app/api/aztec/migrate-identity/route.ts',
    'app/api/aztec/mintIdentity/route.ts',
    'app/api/aztec/transfer/route.ts',
    'app/api/faucet/route.ts'
];

routes.forEach(r => {
    const fullPath = path.join(__dirname, r);
    if (!fs.existsSync(fullPath) || fs.readFileSync(fullPath, 'utf8').trim() === '') {
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, "export const dynamic = 'force-dynamic';\nexport async function GET() { return new Response('OK'); }\n");
    }
});

const others = [
    'lib/aztec/provenanceIndexer.ts',
    'components/provenance/ProvenanceStudioContent.tsx'
];

others.forEach(o => {
    const fullPath = path.join(__dirname, o);
    if (!fs.existsSync(fullPath) || fs.readFileSync(fullPath, 'utf8').trim() === '') {
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, "export default function Component() { return null; }\n");
    }
});

const airdrop = path.join(__dirname, 'app/api/aztec/airdrop/route.ts');
if (fs.existsSync(airdrop)) {
    let content = fs.readFileSync(airdrop, 'utf8');
    content = content.replace(/mint_public/g, 'mint_to_public');
    fs.writeFileSync(airdrop, content);
}
