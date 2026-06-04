import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * Beta Tester Provisioning Script
 * 
 * Generates 30 Golden Tickets with unique serial codes for the Closed Beta cohort.
 * This simulates the zero-knowledge credential issuance process for institutional evaluators.
 */

const BETA_COHORT_SIZE = 30;

// Generate a secure, URL-safe random string for serial codes
function generateSerialCode(): string {
  return 'BETA-' + crypto.randomBytes(8).toString('hex').toUpperCase();
}

async function provisionBeta() {
  console.log(`\n[Cosmic Command] Provisioning ${BETA_COHORT_SIZE} Institutional Beta Tickets...`);

  let successCount = 0;
  const generatedSerials: string[] = [];

  for (let i = 0; i < BETA_COHORT_SIZE; i++) {
    const serialCode = generateSerialCode();
    
    // In a real ZK scenario, we would generate a Semaphore commitment here.
    // For this beta, we generate the claimable ticket shells.
    try {
      await prisma.goldenTicket.create({
        data: {
          userAddress: `0xUNCLAIMED_${crypto.randomBytes(4).toString('hex').toUpperCase()}`, // Placeholder until claimed
          serialCode: serialCode,
          tier: 'Private_BETA',
          badgeColor: 'OBSIDIAN',
          networkLaunchEligible: true,
          isActive: false, // Becomes true when claimed via ZK proof
        }
      });
      successCount++;
      generatedSerials.push(serialCode);
    } catch (error) {
      console.error(`Failed to generate ticket ${i}:`, error);
    }
  }

  console.log(`\n Provisioning Complete. Generated ${successCount} Golden Tickets.`);
  console.log(`\n--- BETA INVITATION CODES ---`);
  
  // Print the first 5 codes for easy access by the founder during onboarding
  for (let i = 0; i < 5; i++) {
    console.log(`[EVALUATOR ${i + 1}]: ${generatedSerials[i]}`);
  }
  console.log(`\n(Remaining 25 codes stored securely in database).`);
  console.log(`Instruct evaluators to use these codes during the ZK-SNARK identity handshake.\n`);
}

provisionBeta()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
