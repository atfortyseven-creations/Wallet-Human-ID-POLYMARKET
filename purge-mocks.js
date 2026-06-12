const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const mockUsers = await p.user.findMany({ where: { isPro: true, bio: { not: null } }, select: { id: true } });
  let ids = mockUsers.map(u => u.id);
  console.log('Mock users to delete:', ids.length);
  
  const batchSize = 100;
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    await p.forumNotification.deleteMany({ where: { OR: [{ userId: { in: batch } }, { actorId: { in: batch } }] } });
    await p.forumLike.deleteMany({ where: { userId: { in: batch } } });
    await p.forumPost.deleteMany({ where: { authorId: { in: batch } } });
    await p.forumTopic.deleteMany({ where: { authorId: { in: batch } } });
    await p.user.deleteMany({ where: { id: { in: batch } } });
    console.log(`Deleted batch ${i/batchSize + 1}`);
  }

  const realCount = await p.user.count();
  console.log('Remaining real users:', realCount);
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
