const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Governance Proposals for Aztec Testnet...');

    // Proposal 1: AZIP-5
    const azip5 = await prisma.marketProposal.upsert({
        where: { id: 'azip-5-prover-consistency' },
        update: {},
        create: {
            id: 'azip-5-prover-consistency',
            question: 'AZIP-5: Optimize Prover Rewards for Consistency',
            description: 'Reduces maxScore by 97.5% (from 15,000,000 to 367,500) and multiplies `a` by 250x to penalize "extractors" who only prove low-compute epochs. Valid reliable provers will be heavily favored.',
            outcomes: ['FOR', 'AGAINST', 'ABSTAIN'],
            category: 'TOKENOMICS',
            creatorAddress: '0xPICONBELLO', // Emre
            status: 'VOTING',
            votesFor: 12,
            votesAgainst: 4,
            votingThreshold: 50,
            votingEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // +7 days
        }
    });

    // Proposal 2: Enable isRewardsClaimable() on Testnet
    const azipTestnet = await prisma.marketProposal.upsert({
        where: { id: 'azip-testnet-rewards' },
        update: {},
        create: {
            id: 'azip-testnet-rewards',
            question: 'AZIP-TEST: Enable isRewardsClaimable() on Current Testnet Rollup',
            description: 'Currently, the testnet contract returns false for isRewardsClaimable(). This proposal formally requests the foundation to enable testnet rewards claiming so that provers who participated in the Alpha upgrade can retrieve accumulated testnet tokens.',
            outcomes: ['FOR', 'AGAINST', 'ABSTAIN'],
            category: 'CORE',
            creatorAddress: '0xakquynf5', // user from Discord
            status: 'VOTING',
            votesFor: 8,
            votesAgainst: 1,
            votingThreshold: 30,
            votingEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // +7 days
        }
    });

    console.log('Governance Seed completed:');
    console.log('- ' + azip5.question);
    console.log('- ' + azipTestnet.question);
}

main()
    .catch((e) => {
        console.error('Error seeding governance:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
