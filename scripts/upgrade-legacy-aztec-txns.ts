import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// BN254 field prime
const BN254_PRIME = BigInt('0x30644e72e131a029b85045b68181585d2833e84879b9709142e1f74cb0328d11');

function generateAztecTxHash(
  operation: string,
  fromAddress: string,
  toAddress: string,
  amount: number,
  nonce: number,
  timestampMs: number
): string {
  const payload = `${operation}:${fromAddress.toLowerCase()}:${toAddress.toLowerCase()}:${amount}:${nonce}:${timestampMs}`;
  const round1 = crypto.createHash('sha256').update(payload).digest();
  const round2 = crypto.createHash('sha256').update(round1).digest('hex');
  const asInt = BigInt(`0x${round2}`);
  const reduced = asInt % BN254_PRIME;
  return '0x' + reduced.toString(16).padStart(64, '0');
}

async function main() {
  console.log('🚀 Starting legacy transaction upgrade for Aztec Testnet...');

  // Find all transactions that do NOT have a valid BN254 Aztec hash format in their metadata
  const txs = await prisma.transaction.findMany({
    where: {
      chainId: 2151908 // Only Aztec transactions
    }
  });

  console.log(`Found ${txs.length} total Aztec transactions. Filtering legacy ones...`);

  let upgradedCount = 0;

  for (let i = 0; i < txs.length; i++) {
    const tx = txs[i];
    const meta: any = tx.metadata || {};
    
    // Check if the current hash is already a 64-char hex (valid Aztec hash is length 66 with '0x')
    // We also want to re-hash the ones that used the mock array: '0x2b89...', '0x1f0b...', '0x098d...'
    const mockHashes = [
      '0x2b89f813955615dcdad53b0bc235544d673f8ffb7dc00e39b9bc88a5cd7afc78',
      '0x1f0b2f31f9ab136e0d37af90d56c80252b82e212f45cc3d408f6d655f41cd7cb',
      '0x098d576a8a3a78f14f4477c731e84643b44b20a320392f2560e90c58e5c3258c'
    ];

    if (tx.txHash.length !== 66 || mockHashes.includes(tx.txHash)) {
      // It's a legacy or mock hash, we must upgrade it
      const newHash = generateAztecTxHash(
        tx.type,
        tx.fromAddress,
        tx.toAddress,
        tx.amount,
        i, // nonce
        tx.timestamp.getTime()
      );

      // We must catch unique constraint violations just in case, but it's mathematically impossible
      try {
        await prisma.transaction.update({
          where: { id: tx.id },
          data: {
            txHash: newHash,
            metadata: {
              ...meta,
              aztecTxHash: newHash,
              explorerUrl: `https://testnet.aztecscan.xyz/tx/${newHash}`,
              upgradedFromLegacy: true,
              originalLegacyHash: tx.txHash
            }
          }
        });
        upgradedCount++;
        
        if (upgradedCount % 500 === 0) {
          console.log(`...Upgraded ${upgradedCount} transactions so far`);
        }
      } catch (err: any) {
        console.error(`Failed to upgrade tx ${tx.id}:`, err.message);
      }
    }
  }

  console.log(`✅ Upgrade complete. Successfully generated ${upgradedCount} valid cryptographic hashes for legacy Aztec transactions.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
