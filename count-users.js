const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const c = await p.user.count();
  console.log('Total users:', c);
  const mockUsers = await p.user.count({ where: { isPro: true, bio: { not: null } } }); // some heuristic
  console.log('Total users with bio:', mockUsers);
  
  // also what about forum users? Did we create 11000 users?
}
main().then(() => process.exit(0));
