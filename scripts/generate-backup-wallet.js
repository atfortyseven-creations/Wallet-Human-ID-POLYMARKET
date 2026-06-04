/**
 * generate-backup-wallet.js
 * 
 * Generates a cryptographically secure Ethereum/Polygon wallet for use
 * as the Deadman's Switch backup (inheritance) wallet.
 * 
 * ️  CRITICAL: Save the output somewhere SAFE and OFFLINE.
 *               Never commit private keys to git.
 * 
 * Usage:
 *   node scripts/generate-backup-wallet.js
 */

const { ethers } = require("ethers");
const { createHash, randomBytes } = require("crypto");

// Generate a cryptographically random wallet (not deterministic)
const entropy = randomBytes(32);
const wallet  = ethers.Wallet.createRandom({ extraEntropy: entropy });

const border = "".repeat(64);

console.log(`\n${border}`);
console.log(`   SOVEREIGN HANDSHAKE  BACKUP WALLET GENERATION             `);
console.log(`   Non-Custodial Inheritance Target Wallet                     `);
console.log(`${border}`);
console.log(`                                                               `);
console.log(`  PUBLIC ADDRESS (put this in .env as BACKUP_WALLET):         `);
console.log(`  ${wallet.address.padEnd(61)}`);
console.log(`                                                               `);
console.log(`  MNEMONIC (24-word seed  STORE OFFLINE, NEVER SHARE):       `);
// Split mnemonic onto two lines for readability
const words = wallet.mnemonic.phrase.split(" ");
const line1 = words.slice(0, 12).join(" ");
const line2 = words.slice(12).join(" ");
console.log(`  ${line1.padEnd(61)}`);
console.log(`  ${line2.padEnd(61)}`);
console.log(`                                                               `);
console.log(`  PRIVATE KEY (NEVER expose online  hardware wallet import): `);
console.log(`  ${wallet.privateKey.padEnd(61)}`);
console.log(`                                                               `);
console.log(`${border}`);
console.log(`  FINGERPRINT SHA-256:                                         `);
const fp = createHash("sha256").update(wallet.address).digest("hex");
console.log(`  ${fp.padEnd(61)}`);
console.log(`${border}`);
console.log(`  NEXT STEPS:                                                  `);
console.log(`  1. Import the mnemonic into a hardware wallet (Ledger/Trezor)`);
console.log(`  2. Set BACKUP_WALLET=${wallet.address.slice(0,20)}... in .env    `);
console.log(`  3. Fund with a small amount of MATIC for gas on Amoy testnet `);
console.log(`  4. Never store the private key digitally  only hardware     `);
console.log(`${border}\n`);

// Safety: also write a JSON receipt (public info only) to avoid losing the address
const fs   = require("fs");
const path = require("path");
const receiptPath = path.join(__dirname, "../vault-storage/backup-wallet-receipt.json");
fs.mkdirSync(path.dirname(receiptPath), { recursive: true });
fs.writeFileSync(receiptPath, JSON.stringify({
  address:      wallet.address,
  fingerprint:  fp,
  network:      "polygon / polygon-amoy",
  purpose:      "Deadman Switch Backup (Inheritance Target)",
  generatedAt:  new Date().toISOString(),
  WARNING:      "This file contains only the PUBLIC address. Private key stored offline."
}, null, 2));

console.log(`  Public receipt saved to vault-storage/backup-wallet-receipt.json (address only, no key)\n`);
