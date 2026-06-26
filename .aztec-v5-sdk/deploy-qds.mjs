/**
 * QDs TokenContract — Aztec Testnet V5
 * SDK: 5.0.0-nightly.20260625
 * API 5.x: AccountManager + SchnorrAccountContract + deriveKeys
 */

import { createAztecNodeClient }          from '@aztec/aztec.js/node';
import { AccountManager, DeployAccountMethod } from '@aztec/aztec.js/wallet';
import { Fr, GrumpkinScalar }             from '@aztec/aztec.js/fields';
import { deriveKeys }                     from '@aztec/aztec.js/keys';
import { SchnorrAccountContract }         from '@aztec/accounts/schnorr';
import { TokenContract }                  from '@aztec/noir-contracts.js/Token';

const NODE_URL   = 'https://v5.testnet.rpc.aztec-labs.com';
const SECRET_HEX = process.env.AZTEC_RELAYER_SECRET_KEY;
if (!SECRET_HEX) { console.error('AZTEC_RELAYER_SECRET_KEY no definida'); process.exit(1); }

// ── Helpers de formato ──────────────────────────────────────
const dim  = s => `\x1b[2m${s}\x1b[0m`;
const bold = s => `\x1b[1m${s}\x1b[0m`;
const ok   = s => `\x1b[32m✓\x1b[0m  ${s}`;
const fail = s => `\x1b[31m✗\x1b[0m  ${s}`;

async function main() {
  const t0 = Date.now();

  console.log(`  ${dim('nodo')}    : ${NODE_URL}`);
  console.log(`  ${dim('token')}   : Quantum Dots (QDs, 18 dec)`);
  console.log(`  ${dim('clave')}   : ${SECRET_HEX.slice(0, 10)}...`);
  console.log('');

  // ── 1. Nodo V5 ─────────────────────────────────────────────
  process.stdout.write('  [1/5] Conectando al nodo Aztec V5... ');
  const node     = await createAztecNodeClient(NODE_URL);
  const blockNum = await node.getBlockNumber();
  console.log(ok(`bloque #${blockNum}`));

  // ── 2. Derivar claves Schnorr (API 5.x) ───────────────────
  process.stdout.write('  [2/5] Derivando claves Schnorr...     ');
  const secretKey  = Fr.fromString(SECRET_HEX);
  const derived    = deriveKeys(secretKey);   // { masterIncomingViewingSecretKey, masterNullifierSecretKey, masterOutgoingViewingSecretKey, masterTaggingSecretKey }
  
  // Signing key: en 5.x SchnorrAccountContract usa el secretKey directamente
  // como clave de firma determinista (GrumpkinScalar from Fr)
  const signingKey = GrumpkinScalar.fromBuffer(secretKey.toBuffer());
  
  const accountContract = new SchnorrAccountContract(signingKey);
  console.log(ok('claves derivadas'));

  // ── 3. AccountManager → wallet ─────────────────────────────
  process.stdout.write('  [3/5] Creando AccountManager...       ');
  const accountManager = await AccountManager.create(node, secretKey, accountContract);
  const wallet  = await accountManager.getAccount();
  const addr    = wallet.getAddress();
  console.log(ok(addr.toString().slice(0, 22) + '…'));

  // ── 4. Deploy QDs TokenContract ────────────────────────────
  process.stdout.write('  [4/5] Enviando deploy (prueba ZK V5)  ');
  const deployResult = await TokenContract.deploy(wallet, addr, 'Quantum Dots', 'QDs', 18n)
    .send({ universalDeploy: true });
  
  process.stdout.write('\n         esperando minado en testnet...');
  const receipt = deployResult.receipt;
  console.log('');
  console.log(ok(`TX minada: ${receipt.txHash?.toString()?.slice(0,20)}…`));

  const contractAddr = (receipt.contract?.address ?? receipt.contractAddress)?.toString() ?? 'DESCONOCIDA';

  // ── 5. Resultado ────────────────────────────────────────────
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   ✅  QDs TokenContract DESPLEGADO — Testnet V5 REAL     ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  ${bold('AZTEC_TOKEN_CONTRACT_ADDRESS')}=${contractAddr}`);
  console.log(`  ${bold('AZTEC_RELAYER_ADDRESS')}=${addr.toString()}`);
  console.log(`  ${bold('AZTEC_RELAYER_SECRET_KEY')}=${SECRET_HEX}`);
  console.log(`  ${bold('TX_HASH')}=${receipt.txHash?.toString() ?? 'n/a'}`);
  console.log('');
  console.log(`  ${dim('AztecScan')} → https://testnet.aztecscan.xyz/address/${contractAddr}`);
  console.log(`  ${dim('Tiempo')}    → ${elapsed}s`);
  console.log('');

  // Guardar resultado
  const { writeFileSync } = await import('fs');
  const result = {
    contractAddress : contractAddr,
    adminAddress    : addr.toString(),
    txHash          : receipt.txHash?.toString(),
    blockNumber     : Number(blockNum),
    timestamp       : new Date().toISOString(),
    network         : 'aztec-testnet-v5',
    token           : { name: 'Quantum Dots', symbol: 'QDs', decimals: 18 }
  };
  writeFileSync('/tmp/aztec-qds-result.json', JSON.stringify(result, null, 2));
  console.log(`  ${dim('Resultado')} → /tmp/aztec-qds-result.json`);
  console.log('');
  process.exit(0);
}

main().catch(err => {
  console.error('');
  console.error(`  \x1b[31m❌  Deploy fallido: ${err.message}\x1b[0m`);
  const lines = (err.stack || '').split('\n').slice(1, 8);
  lines.forEach(l => console.error(`  ${l}`));
  process.exit(1);
});
