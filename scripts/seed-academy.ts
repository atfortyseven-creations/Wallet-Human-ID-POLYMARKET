import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const COURSES = [
    {
        id: 'whale-basics',
        title: 'Whale Analytics Fundamentals',
        description: 'Learn how to identify and track institutional whale wallets, interpret on-chain signals, and build your first watchlist.',
        totalDuration: '2h 30m', badge: 'Popular', level: 'Beginner',
        lessons: [
            { id: 'w1', title: 'What is a Whale?', duration: '8m', level: 'Beginner', description: 'Defining institutional wallets vs retail. Size thresholds and behavioral patterns.', orderIndex: 1 },
            { id: 'w2', title: 'Reading On-Chain Data', duration: '15m', level: 'Beginner', description: 'Understanding Etherscan, Solscan, block explorers.', orderIndex: 2 }
        ],
    },
    {
        id: 'defi-mastery',
        title: 'DeFi & New Pairs Mastery',
        description: 'Master the art of detecting new liquidity pools, evaluating rug-pull risk, and timing entries with precision.',
        totalDuration: '3h 15m', badge: 'New', level: 'Intermediate',
        lessons: [
            { id: 'd1', title: 'How DEXes Create New Pairs', duration: '10m', level: 'Beginner', description: 'AMM mechanics, Uniswap V3, Raydium.', orderIndex: 1 },
            { id: 'd2', title: 'Sniper & Insider Detection', duration: '22m', level: 'Intermediate', description: 'Bot wallets vs demand.', isLocked: true, orderIndex: 2 }
        ],
    }
];

async function main() {
    console.log("Seeding Academy Courses...");
    for (const course of COURSES) {
        const c = await prisma.course.upsert({
            where: { slug: course.id },
            update: {},
            create: {
                id: course.id,
                slug: course.id,
                title: course.title,
                description: course.description,
                totalDuration: course.totalDuration,
                badge: course.badge,
                level: course.level
            }
        });
        
        for (const less of course.lessons) {
             await prisma.lesson.create({
                 data: {
                     title: less.title,
                     duration: less.duration,
                     level: less.level,
                     description: less.description,
                     orderIndex: less.orderIndex,
                     isLocked: less.isLocked || false,
                     courseId: c.id
                 }
             });
        }
    }
    console.log("Seeding Complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
