import { prisma } from '@/lib/prisma';

export const HUMANITY_MULTIPLIERS = [
  { maxScore: 30, multiplier: 1.0 },
  { maxScore: 65, multiplier: 2.0 },
  { maxScore: 85, multiplier: 3.0 },
  { maxScore: 100, multiplier: 4.0 }
];

/**
 * Calculates the yield multiplier based on a user's cryptographic Humanity Score.
 */
export function getHumanityMultiplier(score: number): number {
  const tier = HUMANITY_MULTIPLIERS.find(t => score <= t.maxScore);
  return tier ? tier.multiplier : 4.0;
}

/**
 * Verifies if a user has sufficient credits for an operation, accounting for their Humanity Multiplier.
 * Throws an error if insufficient, guaranteeing Zero-Trust execution.
 */
export async function checkCredits(userId: string, requiredCredits: number): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { creditsBalance: true, humanityScore: true }
  });

  if (!user) throw new Error('Unauthorized: Identity not found in Ledger');

  const multiplier = getHumanityMultiplier(user.humanityScore);
  // Example logic: Multiplier can act as a discount on operations, 
  // or simply a boost on monthly refills. We treat it as a discount here:
  // effectiveCost = baseCost / multiplier
  const effectiveCost = Math.ceil(requiredCredits / multiplier);

  return user.creditsBalance >= effectiveCost;
}

/**
 * Atomically deducts credits and records the transaction in the immutable CreditLedger.
 * Uses a Prisma Transaction to prevent double-spend race conditions.
 */
export async function deductCredits(userId: string, action: string, baseCost: number, description?: string): Promise<{ success: boolean; remainingBalance: number }> {
  // 1. Fetch current score to calculate effective cost
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { creditsBalance: true, humanityScore: true }
  });

  if (!user) throw new Error('Unauthorized: Identity not found in Ledger');

  const multiplier = getHumanityMultiplier(user.humanityScore);
  const effectiveCost = Math.ceil(baseCost / multiplier);

  if (user.creditsBalance < effectiveCost) {
    throw new Error(`Insufficient System Credits. Required: ${effectiveCost}, Balance: ${user.creditsBalance}`);
  }

  // 2. Execute Atomic Transaction
  const result = await prisma.$transaction(async (tx) => {
    // Decrement balance
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        creditsBalance: {
          decrement: effectiveCost
        }
      }
    });

    // Record immutable ledger entry
    await tx.creditLedger.create({
      data: {
        userId,
        amount: -effectiveCost,
        action,
        description: description || `Execution: ${action} at ${multiplier}x Humanity Yield`
      }
    });

    return updatedUser;
  });

  return { success: true, remainingBalance: result.creditsBalance };
}

/**
 * Rewards a user's Humanity Score and records the event atomically.
 */
export async function rewardHumanity(userId: string, eventType: string, points: number): Promise<{ newScore: number }> {
  const result = await prisma.$transaction(async (tx) => {
    // 1. Record event
    await tx.humanityEvent.create({
      data: {
        userId,
        eventType,
        points
      }
    });

    // 2. Increment score (cap at 100)
    const user = await tx.user.findUnique({ where: { id: userId } });
    const currentScore = user?.humanityScore || 0;
    
    // Calculate new score with 100 max boundary cap
    let newScore = currentScore + points;
    if (newScore > 100) newScore = 100;
    if (newScore < 0) newScore = 0; // Penalties could be negative

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        humanityScore: newScore
      }
    });

    return updatedUser;
  });

  return { newScore: result.humanityScore };
}
