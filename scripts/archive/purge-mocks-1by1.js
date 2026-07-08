const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const mockUsers = await p.user.findMany({ where: { isPro: true, bio: { not: null } }, select: { id: true }, take: 100 });
  let ids = mockUsers.map(u => u.id);
  console.log('Mock users to delete this run:', ids.length);
  
  for (const id of ids) {
    try {
      await p.forumNotification.deleteMany({ where: { OR: [{ userId: id }, { actorId: id }] } });
      await p.forumLike.deleteMany({ where: { userId: id } });
      await p.forumPost.deleteMany({ where: { authorId: id } });
      await p.forumTopic.deleteMany({ where: { authorId: id } });
      await p.user.delete({ where: { id } });
      process.stdout.write('.');
    } catch (e) {
      console.log('Error deleting', id, e.message);
    }
  }
  console.log('\nDone.');
  const count = await p.user.count();
  console.log('Total users now:', count);
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
