const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  console.log('Running raw SQL to delete mock users...');
  
  // We identify mock users by isPro = true and bio not null.
  const mockUsers = await p.user.findMany({ where: { isPro: true, bio: { not: null } }, select: { id: true } });
  let count = mockUsers.length;
  console.log('Found', count, 'mock users');

  if (count > 0) {
    try {
        await p.$executeRaw`DELETE FROM "ForumNotification" WHERE "actorId" IN (SELECT id FROM "User" WHERE "isPro" = true AND bio IS NOT NULL)`;
        await p.$executeRaw`DELETE FROM "ForumNotification" WHERE "userId" IN (SELECT id FROM "User" WHERE "isPro" = true AND bio IS NOT NULL)`;
        await p.$executeRaw`DELETE FROM "ForumLike" WHERE "userId" IN (SELECT id FROM "User" WHERE "isPro" = true AND bio IS NOT NULL)`;
        await p.$executeRaw`DELETE FROM "ForumPost" WHERE "authorId" IN (SELECT id FROM "User" WHERE "isPro" = true AND bio IS NOT NULL)`;
        await p.$executeRaw`DELETE FROM "ForumTopic" WHERE "authorId" IN (SELECT id FROM "User" WHERE "isPro" = true AND bio IS NOT NULL)`;
        await p.$executeRaw`DELETE FROM "User" WHERE "isPro" = true AND bio IS NOT NULL`;
        console.log('Deleted successfully via SQL');
    } catch (e) {
        console.log('Error executing raw SQL:', e.message);
    }
  }

  const newTotal = await p.user.count();
  console.log('New total users:', newTotal);
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
