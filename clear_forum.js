const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  await prisma.forumPost.deleteMany({});
  await prisma.forumTopic.deleteMany({});
  console.log('Deleted all topics and posts');
}

run().catch(console.error).finally(() => prisma.$disconnect());
