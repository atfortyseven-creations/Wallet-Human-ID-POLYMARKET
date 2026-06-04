import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_build');

export interface UnlockSchedule {
    tokenSymbol: string;
    tokenName: string;
    unlockDate: Date;
    amount: string;
    type: 'CLIFF' | 'LINEAR';
    percentageOfSupply: number;
}

/**
 * Elite Dilution Service
 * Tracks upcoming token unlocks and handles automated alerts.
 */
export class DilutionService {
    // PRE-DEFINED Elite DATA (Synchronized with official vesting schedules for March/April 2026)
    private static MAJOR_UNLOCKS: UnlockSchedule[] = [
        {
            tokenSymbol: 'AUTH',
            tokenName: 'Identity',
            unlockDate: new Date('2026-03-05T00:00:00Z'), // Monthly Grants Cycle (Day 5)
            amount: '6.62M',
            type: 'LINEAR',
            percentageOfSupply: 0.12
        },
        {
            tokenSymbol: 'ARB',
            tokenName: 'Arbitrum',
            unlockDate: new Date('2026-03-16T00:00:00Z'), // Periodic Elite vesting
            amount: '92.65M',
            type: 'CLIFF',
            percentageOfSupply: 1.1
        },
        {
            tokenSymbol: 'OP',
            tokenName: 'Optimism',
            unlockDate: new Date('2026-03-31T00:00:00Z'), // Optimism Periodic Unlock
            amount: '31.34M',
            type: 'CLIFF',
            percentageOfSupply: 0.56
        },
        {
            tokenSymbol: 'SUI',
            tokenName: 'Sui',
            unlockDate: new Date('2026-04-03T00:00:00Z'), // SUI Cliff Unlock
            amount: '64.19M',
            type: 'CLIFF',
            percentageOfSupply: 0.82
        }
    ];

    /**
     * Get all upcoming unlocks sorted by date
     */
    static async getUpcomingUnlocks(): Promise<UnlockSchedule[]> {
        return this.MAJOR_UNLOCKS.sort((a, b) => a.unlockDate.getTime() - b.unlockDate.getTime());
    }

    /**
     * Send alerts to ALL registered users with an email
     */
    static async triggerGlobalAlerts(unlock: UnlockSchedule) {
        const users = await prisma.user.findMany({
            where: { email: { not: null } },
            select: { email: true }
        });

        console.log(`[DilutionService] Triggering alerts for ${unlock.tokenSymbol} to ${users.length} users.`);

        for (const user of users) {
            if (!user.email) continue;

            try {
                await resend.emails.send({
                    from: 'System Whale <alerts@institutional.pro>',
                    to: user.email,
                    subject: `️ DILUTION ALERT: ${unlock.tokenSymbol}`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #000; color: #fff; border-radius: 20px;">
                            <h1 style="color: #fff; font-size: 24px; font-weight: 900; letter-spacing: -1px;">UPCOMING DILUTION ANALYSIS</h1>
                            <p style="color: #666; font-size: 14px;">Elite Grade Notification</p>
                            <hr style="border: 0.5px solid #333; margin: 20px 0;">
                            <div style="background: #111; padding: 30px; border-radius: 15px; border: 1px solid #222;">
                                <h2 style="margin: 0; color: #fff;">${unlock.tokenName} (${unlock.tokenSymbol})</h2>
                                <p style="color: #888; margin-top: 10px;">Se aproxima un desbloqueo tipo <strong>${unlock.type}</strong>.</p>
                                <div style="margin-top: 20px; display: grid; grid-template-cols: 1fr 1fr; gap: 20px;">
                                    <div>
                                        <p style="font-size: 10px; text-transform: uppercase; color: #555; margin: 0;">Cantidad</p>
                                        <p style="font-size: 18px; font-weight: bold; margin: 5px 0;">${unlock.amount} ${unlock.tokenSymbol}</p>
                                    </div>
                                    <div>
                                        <p style="font-size: 10px; text-transform: uppercase; color: #555; margin: 0;">Impacto Suministro</p>
                                        <p style="font-size: 18px; font-weight: bold; margin: 5px 0;">${unlock.percentageOfSupply}%</p>
                                    </div>
                                </div>
                                <div style="margin-top: 30px; background: #fff; color: #000; padding: 15px; border-radius: 10px; text-align: center; font-weight: 900; font-size: 12px; letter-spacing: 2px;">
                                    FECHA: ${unlock.unlockDate.toLocaleDateString()}
                                </div>
                            </div>
                            <p style="font-size: 10px; color: #444; margin-top: 30px; text-align: center;">
                                © 2026 Whale Alert - ESTE ES UN MENSAJE AUTOMATIZADO DE INTELIGENCIA SOBERANA.
                            </p>
                        </div>
                    `
                });
            } catch (err) {
                console.error(`Failed to send email to ${user.email}:`, err);
            }
        }
    }
}


