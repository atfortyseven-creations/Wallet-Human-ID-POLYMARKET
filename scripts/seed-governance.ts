/**
 * seed-governance.ts
 * Run once via: npx tsx scripts/seed-governance.ts
 * Seeds real governance proposals into the MarketProposal table.
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PROPOSALS = [
  {
    question: 'Should Ledger Network integrate Hyperliquid perpetuals directly into the terminal?',
    description: 'A proposal to add a native Hyperliquid perpetuals panel to the Ledger Terminal. This would allow Ledger members to place, modify, and cancel perpetual orders directly from the app without leaving the ZK-verified environment.',
    outcomes: ['FOR', 'AGAINST', 'ABSTAIN'],
    category: 'PRODUCT',
    status: 'VOTING',
    votingEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
    votingThreshold: 50,
    votesFor: 0,
    votesAgainst: 0,
    creatorAddress: '0x0000000000000000000000000000000000000001',
  },
  {
    question: 'Should 5% of all QD transaction fees be allocated to a community treasury?',
    description: 'This proposal would redirect 5% of all QD network fees into a multi-sig community treasury governed by Ledger token holders. Funds would be used for grants, audits, and protocol development.',
    outcomes: ['FOR', 'AGAINST', 'ABSTAIN'],
    category: 'TOKENOMICS',
    status: 'VOTING',
    votingEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    votingThreshold: 100,
    votesFor: 0,
    votesAgainst: 0,
    creatorAddress: '0x0000000000000000000000000000000000000001',
  },
  {
    question: 'Should ZK stealth transfers require a mandatory AML attestation for amounts above 1,000 QDs?',
    description: 'To comply with emerging EU MiCA regulations and ensure institutional adoption, this proposal adds an optional AML Travel Rule proof for ZK transfers above the 1,000 QD threshold. Below the threshold, full privacy is maintained.',
    outcomes: ['FOR', 'AGAINST', 'ABSTAIN'],
    category: 'COMPLIANCE',
    status: 'VOTING',
    votingEndsAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days
    votingThreshold: 75,
    votesFor: 0,
    votesAgainst: 0,
    creatorAddress: '0x0000000000000000000000000000000000000001',
  },
];

async function main() {
  console.log('Seeding governance proposals...');
  for (const p of PROPOSALS) {
    const existing = await (prisma as any).marketProposal.findFirst({ where: { question: p.question } });
    if (existing) {
      console.log(`  ⏭  Already exists: "${p.question.slice(0, 60)}..."`);
      continue;
    }
    await (prisma as any).marketProposal.create({ data: p });
    console.log(`  ✅ Created: "${p.question.slice(0, 60)}..."`);
  }
  console.log('Done.');
  await prisma.$disconnect();
}

main().catch(async e => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
