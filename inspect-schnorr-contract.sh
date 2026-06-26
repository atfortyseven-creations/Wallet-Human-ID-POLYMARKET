#!/bin/bash
# ══════════════════════════════════════════════════════════════
#  QDs Token Deploy — Aztec Testnet V5 — DEFINITIVO
#  humanidfi.com | SDK 5.0.0-nightly.20260625
# ══════════════════════════════════════════════════════════════
set -e
source ~/.nvm/nvm.sh
nvm use 20 --silent

SDK_DIR="/mnt/d/Projects/Wallet Human Polymarket ID/.aztec-v5-sdk"

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║   🚀  QDs Token Deploy — Aztec Testnet V5 DEFINITIVO  ║"
echo "║   humanidfi.com                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

cd "$SDK_DIR"

# ── Primero leer la source de SchnorrAccountContract para entender getAccount ──
echo ">>> Inspeccionando SchnorrAccountContract.getAccount..."
node --input-type=module << 'INSPECT'
import { SchnorrAccountContract } from '@aztec/accounts/schnorr';
import { Fr, GrumpkinScalar } from '@aztec/aztec.js/fields';

const sk = Fr.random();
const sigKey = GrumpkinScalar.fromBuffer(sk.toBuffer());
const contract = new SchnorrAccountContract(sigKey);

console.log('SchnorrAccountContract source:');
console.log(SchnorrAccountContract.toString().slice(0, 2000));

// Check getContractArtifact
const artifact = await contract.getContractArtifact();
console.log('\nArtifact name:', artifact?.name);
console.log('Artifact functions count:', artifact?.functions?.length);

// Check getInitializationFunctionAndArgs
try {
  const init = await contract.getInitializationFunctionAndArgs();
  console.log('\nInitialization:', JSON.stringify(init));
} catch(e) {
  console.log('\ngetInitializationFunctionAndArgs error:', e.message.slice(0,100));
}

// Check getImmutablesHash
try {
  const hash = await contract.getImmutablesHash();
  console.log('getImmutablesHash:', hash?.toString());
} catch(e) {
  console.log('getImmutablesHash error:', e.message.slice(0,100));
}
INSPECT
