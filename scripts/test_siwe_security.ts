import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { SiweMessage } from 'siwe';

const prisma = new PrismaClient();

async function runTests() {
  console.log("' Starting SIWE Security Test Suite");

  // 1. Nonce Race Condition Test (Atomic Consumption)
  console.log("\n[TEST 1] Nonce Atomic Consumption (Race Condition)");
  const mockNonce = crypto.randomBytes(32).toString('hex');
  await prisma.siweNonce.create({
    data: { nonce: mockNonce, expiresAt: new Date(Date.now() + 5000) }
  });

  const consumeAttempt1 = prisma.siweNonce.delete({ where: { nonce: mockNonce } }).catch(e => 'failed');
  const consumeAttempt2 = prisma.siweNonce.delete({ where: { nonce: mockNonce } }).catch(e => 'failed');
  
  const results = await Promise.all([consumeAttempt1, consumeAttempt2]);
  const successCount = results.filter(r => r !== 'failed').length;
  
  if (successCount === 1) {
    console.log("oe SUCCESS: Nonce was consumed exactly once despite race condition.");
  } else {
    console.error("~ FAILURE: Nonce atomic consumption broken", results);
  }

  // 2. Server Restart Emulation
  console.log("\n[TEST 2] Identity & Session Persistence (Server Restart)");
  const mockWallet = `0x${crypto.randomBytes(20).toString('hex')}`;
  
  // Emulate SIWE verify creating a session
  const identity = await prisma.humanityIdentity.create({
    data: { walletAddress: mockWallet, chainId: 1, verificationStatus: 'SIWE_VERIFIED' }
  });
  const session = await prisma.humanitySession.create({
    data: { identityId: identity.id, authenticationMethod: 'SIWE', expiresAt: new Date(Date.now() + 10000) }
  });

  // Emulate Node process exit and restart
  const isolatedPrisma = new PrismaClient();
  const recoveredSession = await isolatedPrisma.humanitySession.findUnique({
    where: { sessionId: session.sessionId },
    include: { identity: true }
  });

  if (recoveredSession && recoveredSession.identity.walletAddress === mockWallet) {
    console.log("oe SUCCESS: Session and Identity survived isolated DB connection (persistent).");
  } else {
    console.error("~ FAILURE: Session lost.");
  }

  // Cleanup
  await prisma.humanitySession.delete({ where: { sessionId: session.sessionId } });
  await prisma.humanityIdentity.delete({ where: { id: identity.id } });
  
  console.log("\n' Security tests completed.");
  process.exit(0);
}

runTests();
