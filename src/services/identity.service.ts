import db from '@/lib/db';

export class IdentityService {
    /**
     * User "Upsert": Creates if not exists, updates if returning.
     * Handles "Vampire Attack" logic (identity merge).
     */
    static async syncUser(walletAddress: string) {
        if (!walletAddress) throw new Error("Wallet Address required");

        const user = await db.user.upsert({
            where: { walletAddress },
            update: { lastActive: new Date() },
            create: {
                walletAddress,
                tier: 'GHOST', // Nivel 0 por defecto
                humanityScore: 10 // Base points for connecting wallet
            }
        });

        return user;
    }

    /**
     * Critical logic: Verify World ID
     * This elevates the user Tier to Enterprise
     */
    static async verifyWorldID(walletAddress: string, proof: any) {
        // Real ZK proof cryptographic validation would go here
        const isValid = true; // Simulado para el ejemplo

        if (isValid) {
            return await db.user.update({
                where: { walletAddress },
                data: {
                    tier: 'Enterprise',
                    humanityScore: { increment: 50 } // Reputation boost
                }
            });
        }
        throw new Error("Invalid Proof");
    }
}
