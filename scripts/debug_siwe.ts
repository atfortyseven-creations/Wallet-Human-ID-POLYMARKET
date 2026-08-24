import { Wallet } from 'ethers';
import { SiweMessage } from 'siwe';
import { PrismaClient } from '@prisma/client';

const QA_URL = 'postgresql://postgres:postgres@127.0.0.1:5433/humanity_qa';
process.env.DATABASE_URL = QA_URL;
const prisma = new PrismaClient({ datasources: { db: { url: QA_URL } } });

const w = Wallet.createRandom();
const nonce = 'validnonce123';

// Pre-seed nonce
await prisma.siweNonce.create({ data: { nonce, expiresAt: new Date(Date.now() + 60000) } });
await prisma.$disconnect();

const msg = new SiweMessage({
  domain: 'localhost:3000',
  address: w.address,
  statement: 'QA Manual SIWE Test',
  uri: 'http://localhost:3000',
  version: '1',
  chainId: 137,
  nonce,
});
const prepared = msg.prepareMessage();
console.log('Prepared message (first 80 chars):', prepared.substring(0, 80) + '...');
const sig = await w.signMessage(prepared);

console.log('Sending request...');
const res = await fetch('http://localhost:3000/api/auth/siwe/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Cookie': `siwe-nonce=${nonce}` },
  body: JSON.stringify({ message: prepared, signature: sig })
});
const j = await res.json().catch(() => null);
console.log('HTTP', res.status, JSON.stringify(j));
