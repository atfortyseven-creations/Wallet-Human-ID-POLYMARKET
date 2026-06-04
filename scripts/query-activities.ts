import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function main() {
    console.log('--- Whale Activities in DB ---');
    const activities = await prisma.whaleActivity.findMany({
        orderBy: { timestamp: 'desc' },
        take: 10
    });

    activities.forEach(a => {
        console.log(`[${a.timestamp.toISOString()}] ${a.token}: ${a.amount} ($${a.usdValue}) | ${a.transactionHash}`);
    });

    console.log('\n--- Treasury Snapshots ---');
    const snapshots = await prisma.treasurySnapshot.findMany({
        orderBy: { date: 'desc' },
        take: 5
    });
    snapshots.forEach(s => {
        console.log(`[${s.date.toISOString()}] TVL: ${s.totalValueLocked} | Revenue: ${s.protocolRevenue}`);
    });

    console.log('\n--- Watched Wallets with Large Balances ---');
    const wallets = await prisma.watchedWallet.findMany({
        where: {
            OR: [
                { lastValue: { gt: 10000000 } } // > $10M
            ]
        }
    });
    wallets.forEach(w => {
        console.log(`!! LARGE WALLET: ${w.address} | Value: ${w.lastValue} | Label: ${w.label}`);
    });

    console.log('\n--- Large Balances Check (Activities) ---');
    const largeActivities = await prisma.whaleActivity.findMany({
        where: {
            OR: [
                { amount: { gt: 1000000 } },
                { usdValue: { gt: 100000000 } }
            ]
        }
    });

    if (largeActivities.length > 0) {
        console.log(`Found ${largeActivities.length} large activities!`);
        largeActivities.forEach(a => {
            console.log(`!! LARGE ACTIVITY: ${a.token}: ${a.amount} ($${a.usdValue})`);
        });
    } else {
        console.log('No extremely large activities found in DB.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
