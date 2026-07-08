const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function purge() {
    console.log("Starting quantum purge of mock forum data...");
    
    // Delete all forum notifications
    await prisma.forumNotification.deleteMany({});
    console.log("Deleted all notifications.");

    // Delete all forum likes
    await prisma.forumLike.deleteMany({});
    console.log("Deleted all likes.");

    // Delete all forum posts
    await prisma.forumPost.deleteMany({});
    console.log("Deleted all posts.");

    // Delete all forum topics
    await prisma.forumTopic.deleteMany({});
    console.log("Deleted all topics.");

    console.log("Forum successfully purged.");
    process.exit(0);
}

purge().catch(e => {
    console.error(e);
    process.exit(1);
});
