/**
 * QDs TokenContract — Aztec Testnet V5
 * SDK: 5.0.0-nightly.20260625
 * API 5.x: EmbeddedWallet + createSchnorrAccount + SponsoredFPC
 */

import { createAztecNodeClient } from '@aztec/aztec.js/node';
import { EmbeddedWallet } from '@aztec/wallets/embedded';
import { Fr } from '@aztec/foundation/curves/bn254';
import { AztecAddress } from '@aztec/stdlib/aztec-address';
import { TokenContract } from '@aztec/noir-contracts.js/Token';
import { SponsoredFeePaymentMethod } from '@aztec/aztec.js/fee';

const NODE_URL   = 'https://v5.testnet.rpc.aztec-labs.com/';
const SECRET_HEX = process.env.AZTEC_RELAYER_SECRET_KEY?.trim();
const SPONSORED_FPC = process.env.SPONSORED_FPC_ADDRESS || '0x261366b3c0a9b4c30864629556cf282be409e6822b1f3a065fcb7e34f36d7880';

// ── Helpers de formato ──────────────────────────────────────
const dim  = s => `\x1b[2m${s}\x1b[0m`;
const bold = s => `\x1b[1m${s}\x1b[0m`;
const ok   = s => `\x1b[32m✓\x1b[0m  ${s}`;
const fail = s => `\x1b[31m✗\x1b[0m  ${s}`;

async function main() {
  if (!SECRET_HEX) { 
      console.error(fail('AZTEC_RELAYER_SECRET_KEY no definida')); 
      process.exit(1); 
  }

  const t0 = Date.now();

  console.log(`  ${dim('nodo')}    : ${NODE_URL}`);
  console.log(`  ${dim('token')}   : Quantum Dots (QDs, 18 dec)`);
  console.log(`  ${dim('clave')}   : ${SECRET_HEX.slice(0, 10)}...`);
  console.log(`  ${dim('fpc')}     : ${SPONSORED_FPC.slice(0, 18)}...`);
  console.log('');

  // ── 1. Nodo V5 ─────────────────────────────────────────────
  process.stdout.write('  [1/5] Conectando al nodo Aztec V5... ');
  const node = await createAztecNodeClient(NODE_URL);
  const blockNum = await node.getBlockNumber();
  console.log(ok(`bloque #${blockNum}`));

  // ── 2. Crear EmbeddedWallet (PXE local) ────────────────────
  process.stdout.write('  [2/5] Creando PXE Local (EmbeddedWallet)... ');
  const wallet = await EmbeddedWallet.create(NODE_URL, { ephemeral: true });
  console.log(ok('creado'));

  // ── 3. Registrar / Derivar claves Schnorr en PXE ───────────
  process.stdout.write('  [3/5] Registrando cuenta Schnorr en PXE...  ');
  const secretKey = Fr.fromString(SECRET_HEX);
  const accountManager = await wallet.createSchnorrAccount(secretKey, Fr.ZERO);
  const addr = accountManager.address;
  console.log(ok(addr.toString().slice(0, 22) + '…'));

  // ── 4. Deploy QDs TokenContract ────────────────────────────
  process.stdout.write('  [4/5] Enviando deploy (prueba ZK V5)  ');
  
  // Usar SponsoredFeePaymentMethod con la dirección canónica
  const CANONICAL_FPC = '0x08b888c4be63ed67f61a622fdd013ea028326bac22a8982a3b5a7e9ec62f765b';
  const fpcAddress = AztecAddress.fromString(CANONICAL_FPC);
  const paymentMethod = new SponsoredFeePaymentMethod(fpcAddress);
  
  // Enviamos la transaccion usando el wallet creado
  const deployTx = await TokenContract.deploy(wallet, addr, 'Quantum Dots', 'QDs', 18n)
    .send({ universalDeploy: true, from: addr, fee: { paymentMethod } });
  
  process.stdout.write('\n         esperando minado en testnet...');
  const receipt = await deployTx.wait();
  console.log('');
  console.log(ok(`TX minada: ${receipt.txHash?.toString()?.slice(0,20)}…`));

  const contractAddr = receipt.contract?.address?.toString() || 'DESCONOCIDA';

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

  process.exit(0);
}

main().catch(err => {
  console.error('');
  console.error(`  \x1b[31m❌  Deploy fallido: ${err.message}\x1b[0m`);
  const lines = (err.stack || '').split('\n').slice(1, 8);
  lines.forEach(l => console.error(`  ${l}`));
  process.exit(1);
});
