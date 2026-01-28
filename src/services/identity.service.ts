import db from '@/lib/db';

export class IdentityService {
    /**
     * "Upsert" del usuario: Crea si no existe, actualiza si vuelve.
     * Maneja la lógica del "Vampire Attack" (fusión de identidades).
     */
    static async syncUser(walletAddress: string) {
        if (!walletAddress) throw new Error("Wallet Address required");

        const user = await db.user.upsert({
            where: { walletAddress },
            update: { lastActive: new Date() },
            create: {
                walletAddress,
                tier: 'GHOST', // Nivel 0 por defecto
                reputation: 10 // Puntos base por conectar wallet
            }
        });

        return user;
    }

    /**
     * Lógica crítica: Verificar World ID
     * Esto elevaría el Tier del usuario a SOVEREIGN
     */
    static async verifyWorldID(walletAddress: string, proof: any) {
        // Aquí iría la validación criptográfica real de la prueba ZK
        const isValid = true; // Simulado para el ejemplo

        if (isValid) {
            return await db.user.update({
                where: { walletAddress },
                data: {
                    tier: 'SOVEREIGN',
                    reputation: { increment: 50 } // Boost de reputación
                }
            });
        }
        throw new Error("Invalid Proof");
    }
}
