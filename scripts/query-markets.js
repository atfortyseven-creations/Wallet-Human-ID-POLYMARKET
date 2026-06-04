
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        const markets = await prisma.market.findMany();
        console.log('Total markets:', markets.length);
        if (markets.length > 0) {
            console.log('Sample market:', JSON.stringify(markets[0], null, 2));
        }
        
        const proposals = await prisma.marketProposal.findMany({
            where: { status: 'APPROVED' }
        });
        console.log('Approved proposals:', proposals.length);
        if (proposals.length > 0) {
            console.log('Sample proposal:', JSON.stringify(proposals[0], null, 2));
        }

    } catch (e) {
        console.error('Test failed:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

test();
