// Look for a WalletSchema in aztec.js wallet module
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const walletJs = fs.readFileSync(
  path.join(__dirname, 'node_modules/@aztec/aztec.js/dest/wallet/wallet.js'),
  'utf8'
);
const schemaMatches = walletJs.match(/export const \w+Schema/g);
console.log('Exported schemas:', schemaMatches);

// Also look for "WalletSchema"
const walletSchemaLine = walletJs.split('\n').find(l => l.includes('WalletSchema'));
console.log('WalletSchema line:', walletSchemaLine);
