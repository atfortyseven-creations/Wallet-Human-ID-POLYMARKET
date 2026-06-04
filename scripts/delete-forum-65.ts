import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('️ Initiating System Purge Protocol...');
    
    // Find all mock users by their specific generated bio pattern
    const mockUsers = await prisma.user.findMany({
        where: {
            bio: {
                contains: 'Managing tier-1 liquidity on EVM. Institutional grade execution.'
            }
        }
    });

    const userIds = mockUsers.map(u => u.id);
    
    if (userIds.length === 0) {
        console.log(' No mock personas found in the database. Clean grid.');
        return;
    }

    console.log(`Found ${userIds.length} synthetic personas. Purging associated data...`);

    // 1. Delete all notifications tied to these users
    const delNotif = await prisma.forumNotification.deleteMany({
        where: { OR: [{ userId: { in: userIds } }, { actorId: { in: userIds } }] }
    });
    console.log(`[-] Erased ${delNotif.count} notifications.`);

    // 2. Delete all likes
    const delLikes = await prisma.forumLike.deleteMany({
        where: { userId: { in: userIds } }
    });
    console.log(`[-] Erased ${delLikes.count} engagement records.`);

    // 3. Delete all posts (replies)
    const delPosts = await prisma.forumPost.deleteMany({
        where: { authorId: { in: userIds } }
    });
    console.log(`[-] Erased ${delPosts.count} cryptographic mandates (posts).`);

    // 4. Delete all topics
    const delTopics = await prisma.forumTopic.deleteMany({
        where: { authorId: { in: userIds } }
    });
    console.log(`[-] Erased ${delTopics.count} analytics alerts (topics).`);

    // 5. Delete the personas themselves
    const delUsers = await prisma.user.deleteMany({
        where: { id: { in: userIds } }
    });
    console.log(`[-] Erased ${delUsers.count} synthetic identities.`);

    console.log(' Success! The System Network is now perfectly clean.');
}

main()
    .catch(e => {
        console.error(' Error during purge:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
