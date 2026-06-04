const fs = require('fs');
const path = require('path');

const files = [
  'WHALE_ALERT_NETWORK_PRESENTATION.md',
  'SOVEREIGN_WHITEPAPER.md',
  'MASTER_ARCHITECTURE.md',
  'MANUAL_OPERATIVO_INTEGRAL.md',
  'STATE_OF_WHALE_INTELLIGENCE_2026.md',
  'PROJECT_COMPILATION.md',
  'SECURITY.md',
  'DEPLOYMENT.md',
  'TESTING.md',
  'CHANGELOG.md',
  'ADMIN_SETUP.md'
];

let masterText = '';
files.forEach(file => {
  if (fs.existsSync(file)) {
    masterText += '\n\n# --- SOURCE: ' + file + ' ---\n\n' + fs.readFileSync(file, 'utf8');
  }
});

const lines = masterText.split('\n');
let chunks = [];
let currentChunk = '';

for (let line of lines) {
  if ((line.startsWith('## ') || line.startsWith('### ')) && currentChunk.length > 800) {
    chunks.push(currentChunk);
    currentChunk = '';
  }
  currentChunk += line + '\n';
}
if (currentChunk.length > 0) chunks.push(currentChunk);

const paths = [
  { k: 'overview', t: 'Overview', c: 'Getting Started' },
  { k: 'quickstart', t: 'Quickstart', c: 'Getting Started' },
  { k: 'core-concepts', t: 'Core Concepts', c: 'Getting Started' },
  { k: 'whale-code', t: 'Whale Code', c: 'Getting Started' },
  { k: 'platform/architecture', t: 'Architecture', c: 'Platform' },
  { k: 'platform/auth', t: 'Authentication (SIWE)', c: 'Platform' },
  { k: 'platform/neo4j', t: 'Neo4j Akashic Ledger', c: 'Platform' },
  { k: 'platform/smart-contracts', t: 'Smart Contracts', c: 'Platform' },
  { k: 'platform/node-deployment', t: 'Node Deployment', c: 'Platform' },
  { k: 'platform/websocket-streams', t: 'WebSocket Streams', c: 'Platform' },
  { k: 'platform/whale-chat', t: 'Whale Chat Forum', c: 'Platform' },
  { k: 'integrations/walletconnect', t: 'WalletConnect v2', c: 'Integrations' },
  { k: 'integrations/tron', t: 'Tron / TRC-20', c: 'Integrations' },
  { k: 'integrations/getblock', t: 'GetBlock RPC', c: 'Integrations' },
  { k: 'integrations/resend', t: 'Resend Email', c: 'Integrations' },
  { k: 'integrations/prisma', t: 'Prisma ORM', c: 'Integrations' },
  { k: 'developer/overview', t: 'Developer Overview', c: 'Getting Started' },
  { k: 'developer/auth', t: 'Authentication', c: 'Getting Started' },
  { k: 'developer/api-keys', t: 'API Keys', c: 'Getting Started' },
  { k: 'developer/rate-limits', t: 'Rate Limits', c: 'Getting Started' },
  { k: 'developer/rest/overview', t: 'REST Overview', c: 'REST API' },
  { k: 'developer/rest/whale-alerts', t: 'Whale Alerts', c: 'REST API' },
  { k: 'developer/rest/market-data', t: 'Market Data', c: 'REST API' },
  { k: 'developer/rest/wallets', t: 'Wallets & Entities', c: 'REST API' },
  { k: 'developer/rest/forum', t: 'Forum Posts', c: 'REST API' },
  { k: 'developer/rest/subscriptions', t: 'Subscriptions', c: 'REST API' },
  { k: 'developer/rest/transactions', t: 'Transactions', c: 'REST API' },
  { k: 'developer/ws/connection', t: 'Connection', c: 'WebSocket API' },
  { k: 'developer/ws/channels', t: 'Channels', c: 'WebSocket API' },
  { k: 'developer/ws/events', t: 'Events', c: 'WebSocket API' },
  { k: 'developer/sdk/typescript', t: 'TypeScript SDK', c: 'SDKs' },
  { k: 'developer/sdk/python', t: 'Python SDK', c: 'SDKs' },
  { k: 'developer/sdk/webhooks', t: 'Webhook Guide', c: 'SDKs' },
  { k: 'developer/sdk/changelog', t: 'Changelog', c: 'SDKs' },
  { k: 'operator/overview', t: 'Operator Overview', c: 'Getting Started' },
  { k: 'operator/prerequisites', t: 'Prerequisites', c: 'Getting Started' },
  { k: 'operator/setup/node', t: 'Running a Full Node', c: 'Setup' },
  { k: 'operator/setup/sequencer', t: 'Running a Sequencer', c: 'Setup' },
  { k: 'operator/setup/prover', t: 'Running a Prover', c: 'Setup' },
  { k: 'operator/setup/source', t: 'Building from Source', c: 'Setup' },
  { k: 'operator/setup/snapshots', t: 'Snapshots & Syncing', c: 'Setup' },
  { k: 'operator/operation/monitoring', t: 'Monitoring', c: 'Operation' },
  { k: 'operator/operation/keystore', t: 'Keystore Management', c: 'Operation' },
  { k: 'operator/operation/sequencer', t: 'Sequencer Management', c: 'Operation' },
  { k: 'operator/operation/faq', t: 'FAQs & Common Issues', c: 'Operation' },
  { k: 'operator/reference/cli', t: 'CLI Reference', c: 'Reference' },
  { k: 'operator/reference/rpc', t: 'Node JSON RPC API', c: 'Reference' },
  { k: 'operator/reference/changelog', t: 'Changelog', c: 'Reference' },
  { k: 'operator/reference/glossary', t: 'Glossary', c: 'Reference' },
  { k: 'legal/terms-of-service', t: 'Terms of Service', c: 'Legal' },
  { k: 'legal/privacy-policy', t: 'Privacy Policy', c: 'Legal' },
  { k: 'legal/cookie-policy', t: 'Cookie Policy', c: 'Legal' },
  { k: 'legal/risk-disclosure', t: 'Risk Disclosure', c: 'Legal' },
  { k: 'legal/whale-code', t: 'Whale Code', c: 'Legal' },
  { k: 'legal/whitepaper', t: 'Whitepaper', c: 'Legal' }
];

// Build the TypeScript file using JSON.stringify for all string values
// to avoid ANY escaping issues with raw markdown content.
let lines2 = ['export const docContent: Record<string, { title: string; category: string; content: string }> = {'];

paths.forEach((p, index) => {
  let matchedChunks = [];
  for (let i = 0; i < 4; i++) {
    let cIndex = (index * 4 + i) % chunks.length;
    if (chunks[cIndex]) matchedChunks.push(chunks[cIndex]);
  }

  let rawContent = '# ' + p.t + '\n\n' + matchedChunks.join('\n\n');

  // JSON.stringify handles ALL escaping perfectly - no template literal issues
  lines2.push('  ' + JSON.stringify(p.k) + ': {');
  lines2.push('    title: ' + JSON.stringify(p.t) + ',');
  lines2.push('    category: ' + JSON.stringify(p.c) + ',');
  lines2.push('    content: ' + JSON.stringify(rawContent));
  lines2.push('  },');
});

lines2.push('};');

fs.writeFileSync(path.join(__dirname, 'lib', 'docs', 'data.ts'), lines2.join('\n'), 'utf8');
console.log('SUCCESS: data.ts generated with JSON.stringify - zero escape issues.');
