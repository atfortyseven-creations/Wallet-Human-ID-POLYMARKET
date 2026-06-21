/**
 * run_migration.ts
 * Finds all MINT_IDENTITY transactions at raw EVM addresses (42 chars)
 * and migrates them to the correct derived Aztec address (66 chars).
 */
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function deriveAztecAddress(evmAddress: string): string {
  const normalized = evmAddress.trim().toLowerCase();
  const round1 = crypto.createHash('sha256').update(`aztec-schnorr:${normalized}`).digest();
  const round2 = crypto.createHash('sha256').update(round1).digest('hex');
  return `0x${round2}`;
}

async function main() {
  console.log('🔄 Running Aztec Identity Migration...\n');

  // Find all MINT_IDENTITY txs at raw EVM addresses (40-char hex = 42 total with 0x)
  const oldMintTxs = await prisma.transaction.findMany({
    where: {
      type: 'MINT_IDENTITY',
      token: 'QDs',
      status: 'COMPLETED',
    }
  });

  const evmFormat = oldMintTxs.filter(tx => tx.toAddress.length === 42);
  console.log(`Found ${evmFormat.length} wallet(s) with QDs at raw EVM address`);

  let migrated = 0;
  let skipped = 0;

  for (const tx of evmFormat) {
    const evmAddr = tx.toAddress;
    const derivedAztecAddr = deriveAztecAddress(evmAddr);

    // Check if already migrated
    const existing = await prisma.transaction.findFirst({
      where: {
        toAddress: derivedAztecAddr,
        token: 'QDs',
        type: 'AIRDROP',
        status: 'COMPLETED',
      }
    });

    if (existing) {
      console.log(`  ⏭️  ${evmAddr} → already migrated`);
      skipped++;
      continue;
    }

    // Create migration AIRDROP at derived address
    const txCount = await prisma.transaction.count();
    const blockNumber = 103860 + txCount + 1;
    const payload = `migrate-${derivedAztecAddr}-${tx.amount}-${Date.now()}-${blockNumber}`;
    const txHash = '0x' + crypto.createHash('sha256').update(payload).digest('hex');

    await prisma.transaction.create({
      data: {
        txHash,
        status: 'COMPLETED',
        type: 'AIRDROP',
        amount: tx.amount,
        token: 'QDs',
        tokenSymbol: 'QDs',
        fromAddress: '0x0000000000000000000000000000000000000000000000000000000000000000',
        toAddress: derivedAztecAddr,
        blockNumber: BigInt(blockNumber),
        chainId: 2151908,
        metadata: {
          aztecTxHash: txHash,
          explorerUrl: `https://testnet.aztecscan.xyz/tx-effect/${txHash}`,
          network: 'aztec-testnet',
          note: `Migrated from EVM MINT_IDENTITY. Original EVM: ${evmAddr}`,
          migratedFromEvm: evmAddr,
          originalTxId: tx.id,
        },
      }
    });

    console.log(`  ✅ ${evmAddr} → ${derivedAztecAddr.slice(0, 18)}... (${tx.amount} QDs)`);
    migrated++;
  }

  console.log('');
  console.log(`Migration complete: ${migrated} migrated, ${skipped} already done`);
  console.log('');

  // Final state
  const correctFormat = await prisma.$queryRaw<{count: bigint}[]>`
    SELECT COUNT(DISTINCT "toAddress") as count FROM "Transaction" 
    WHERE type='AIRDROP' AND token='QDs' AND status='COMPLETED' AND LENGTH("toAddress") = 66
  `;
  const pendingOld = await prisma.$queryRaw<{count: bigint}[]>`
    SELECT COUNT(*) as count FROM "Transaction" 
    WHERE type='MINT_IDENTITY' AND token='QDs' AND status='COMPLETED' AND LENGTH("toAddress") = 42
  `;
  
  console.log(`✅ Wallets at correct Aztec addr: ${correctFormat[0].count}`);
  console.log(`${Number(pendingOld[0].count) === 0 ? '✅' : '⚠️ '} Old EVM-format mints remaining: ${pendingOld[0].count}`);
}

main()
  .catch(e => { console.error('❌ Migration failed:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
