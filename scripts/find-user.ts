/**
 * [Private ADMIN SCRIPT] find-user.ts
 * 
 * Finds a user in the database by wallet address, email, or partial match.
 * Zero-Clerk: uses native Prisma DB lookups only.
 *
 * Usage:
 *   SEARCH_TERM=0xabc... npx ts-node scripts/find-user.ts
 *   SEARCH_TERM=user@email.com npx ts-node scripts/find-user.ts
 */
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();
const SEARCH_TERM = process.env.SEARCH_TERM || '';

async function findUser() {
  console.log(`\n Searching for user: "${SEARCH_TERM}"`);
  console.log('-------------------------------------------');

  if (!SEARCH_TERM) {
    console.error(' Set SEARCH_TERM env var to a wallet address or email.');
    return;
  }

  try {
    // Search by wallet address (exact)
    const byWallet = await prisma.user.findUnique({
      where: { walletAddress: SEARCH_TERM.toLowerCase() }
    });

    // Search by email in AuthUser table
    const byEmail = await prisma.authUser.findUnique({
      where: { email: SEARCH_TERM.toLowerCase() }
    }).catch(() => null);

    if (byWallet) {
      console.log('\n Found in User table (by walletAddress):');
      console.log(JSON.stringify(byWallet, null, 2));
    }

    if (byEmail) {
      console.log('\n Found in AuthUser table (by email):');
      console.log(JSON.stringify(byEmail, null, 2));

      // If AuthUser has a walletAddress, look that up too
      if (byEmail.walletAddress) {
        const linked = await prisma.user.findUnique({
          where: { walletAddress: byEmail.walletAddress }
        });
        if (linked) {
          console.log('\n Linked User record:');
          console.log(JSON.stringify(linked, null, 2));
        }
      }
    }

    if (!byWallet && !byEmail) {
      console.log('️  No user found with that wallet address or email.');

      // Partial wallet address search
      const partial = await prisma.user.findMany({
        where: { walletAddress: { contains: SEARCH_TERM.toLowerCase() } },
        take: 5
      });

      if (partial.length > 0) {
        console.log(`\n Partial matches (${partial.length}):`);
        partial.forEach(u => console.log(`  - ${u.walletAddress} [${u.tier}]`));
      }
    }

    // Also show their subscription
    const identifier = byWallet?.walletAddress || byEmail?.walletAddress || SEARCH_TERM;
    const sub = await prisma.subscription.findFirst({
      where: { userId: identifier }
    });
    if (sub) {
      console.log('\n Subscription status:');
      console.log(JSON.stringify(sub, null, 2));
    }

  } catch (error) {
    console.error(' Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findUser();
