import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { SiweMessage } from 'siwe';

/**
 * P2-B.1 ADVERSARIAL QA TEST SUITE
 * 
 * NOTE: This script requires a live PostgreSQL connection (DATABASE_URL) to verify
 * row-level locking atomicity under concurrency. Do not use SQLite for this test.
 */

const prisma = new PrismaClient();

async function testConcurrency(instances: number) {
  console.log(`\n--- Running Concurrency Test with ${instances} parallel requests ---`);
  const mockNonce = crypto.randomBytes(32).toString('hex');
  await prisma.siweNonce.create({
    data: { nonce: mockNonce, expiresAt: new Date(Date.now() + 5000) }
  });

  const consumeNonce = async (id: number) => {
    try {
      // Postgres atomic DELETE
      await prisma.siweNonce.delete({ where: { nonce: mockNonce } });
      return { id, success: true };
    } catch (e: any) {
      return { id, success: false, error: e.code }; // Expect P2025 (RecordNotFound)
    }
  };

  const promises = Array.from({ length: instances }, (_, i) => consumeNonce(i));
  const results = await Promise.all(promises);
  
  const successful = results.filter(r => r.success);
  if (successful.length === 1) {
    console.log(`oe SUCCESS: Exactly 1 out of ${instances} requests succeeded. Atomicity verified.`);
  } else {
    console.error(`~ FAIL: ${successful.length} requests succeeded. Concurrency breach!`);
  }
}

async function runAll() {
  try {
    await prisma.$connect();
    await testConcurrency(2);
    await testConcurrency(10);
    await testConcurrency(50);
  } catch (e) {
    console.error("Database connection failed. Cannot run empirical tests.", e);
  } finally {
    await prisma.$disconnect();
  }
}

runAll();
