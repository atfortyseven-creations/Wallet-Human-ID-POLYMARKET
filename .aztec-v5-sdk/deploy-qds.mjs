/**
 * QDs TokenContract — Aztec Testnet V5
 * SDK: 5.0.0 (stable)
 * Corrección Error 14: Usando node.getContract() para obtener la instancia real
 * del FPC de la testnet y registrarla en el PXE con el artifact local.
 */

import { createAztecNodeClient } from '@aztec/aztec.js/node';
import { EmbeddedWallet } from '@aztec/wallets/embedded';
import { Fr } from '@aztec/foundation/curves/bn254';
import { AztecAddress } from '@aztec/stdlib/aztec-address';
import { TokenContract } from '@aztec/noir-contracts.js/Token';
import { SponsoredFPCContractArtifact } from '@aztec/noir-contracts.js/SponsoredFPC';
import { SponsoredFeePaymentMethod } from '@aztec/aztec.js/fee';

const NODE_URL   = 'https://v5.testnet.rpc.aztec-labs.com/';
const SECRET_HEX = process.env.AZTEC_RELAYER_SECRET_KEY?.trim();
const SPONSORED_FPC = '0x1441491b59934ec64f8c98f17c91f23c01ca2a45dbb35caf123146ec76f9970c';

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
  const secretKey = Fr.fromHexString(SECRET_HEX);
  const signingKey = secretKey;
  const accountManager = await wallet.createSchnorrAccount(secretKey, Fr.ZERO, signingKey);
  const addr = accountManager.address;
  console.log(ok(addr.toString().slice(0, 22) + '…'));

  // ── 4. Registrar FPC con instancia REAL de la testnet ──────
  // node.getContract() devuelve la instancia real con el classId correcto (0x2015e1c6...)
  // Usamos esa instancia + nuestro artifact local para que el PXE pueda simular la tx.
  const fpcAddress = AztecAddress.fromStringUnsafe(SPONSORED_FPC);
  process.stdout.write('  [3b] Registrando FPC en PXE (instancia de testnet)... ');
  try {
    const fpcInstance = await node.getContract(fpcAddress);
    if (!fpcInstance) {
      throw new Error('getContract devolvió null/undefined');
    }
    // La instancia tiene originalContractClassId = 0x2015e1c6... (el real de testnet)
    // Al registrar con nuestro artifact (que tiene funciones idénticas pero bytecode de v5.0.0),
    // el PXE puede simular el entrypoint del FPC.
    await wallet.registerContract({
      artifact: SponsoredFPCContractArtifact,
      instance: { 
        address: fpcAddress,
        ...fpcInstance,
        // Forzamos el contract class ID de la testnet para que coincida exactamente
        contractClassId: fpcInstance.originalContractClassId,
      }
    });
    console.log(ok(`registrado (classId: ${fpcInstance.originalContractClassId?.toString().slice(0,18)}…)`));
  } catch (regErr) {
    console.log(dim(`  (aviso registro FPC: ${regErr.message.slice(0, 80)})`));
    // Fallback: intentar con registerContractClass si está disponible
    try {
      const walletMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(wallet));
      if (walletMethods.includes('registerContractClass')) {
        await wallet.registerContractClass(SponsoredFPCContractArtifact);
        console.log(dim('  (registrado como class únicamente)'));
      }
    } catch {}
  }

  // ── 5. Construir y enviar la Tx (con Sponsored FPC) ────────
  process.stdout.write('  [4/5] Enviando deploy (prueba ZK V5)  ');
  const paymentMethod = new SponsoredFeePaymentMethod(fpcAddress, addr);
  
  const receipt = await TokenContract.deploy(wallet, addr, 'Quantum Dots', 'QDs', 18n)
    .send({ universalDeploy: true, from: addr, fee: { paymentMethod } });
  
  process.stdout.write('\n         ¡minada en testnet!\n');
  console.log('');
  console.log(ok(`TX minada: ${receipt.txHash?.toString()?.slice(0,20)}…`));

  const contractAddr = receipt.contract?.address?.toString() || 'DESCONOCIDA';

  // ── 6. Resultado ────────────────────────────────────────────
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
