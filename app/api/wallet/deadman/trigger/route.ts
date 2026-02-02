import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/wallet/deadman/trigger
 * 
 * SYSTEM ROUTE: Should be called by a cron job (e.g. Vercel Cron or GitHub Actions)
 * This route checks for expired Dead Man's Switches and initiates the fund recovery process.
 */
export async function POST(req: Request) {
    try {
        // Simple security check (could be a secret header in production)
        const authHeader = req.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();
        
        // 1. Find all active switches that have expired
        // Formula: lastPingAt + (inactivityPeriod * 30 days) < now
        const activeSwitches = await prisma.deadMansSwitch.findMany({
            where: {
                status: 'ACTIVE'
            },
            include: {
                authUser: true
            }
        });

        const expiredSwitches = activeSwitches.filter(sw => {
            const expiryDate = new Date(sw.lastPingAt);
            expiryDate.setMonth(expiryDate.getMonth() + sw.inactivityPeriod);
            return expiryDate < now;
        });

        const results = [];

        for (const sw of expiredSwitches) {
            try {
                // 2. Mark as EXPIRED/EXECUTING
                await prisma.deadMansSwitch.update({
                    where: { id: sw.id },
                    data: { status: 'EXECUTING' }
                });

                // 3. Logic to execute the transfer
                // Note: Real implementation would handle gas, signed tx, etc.
                // For now, we simulate the 'Trigger' success.
                const mockExecutionHash = `deadman-exec-${sw.id}-${Date.now()}`;

                await prisma.deadMansSwitch.update({
                    where: { id: sw.id },
                    data: { 
                        status: 'EXECUTED',
                        executionTxHash: mockExecutionHash
                    }
                });

                results.push({
                    userId: sw.userId,
                    beneficiary: sw.beneficiaryAddress,
                    status: 'SUCCESS',
                    txHash: mockExecutionHash
                });

            } catch (err: any) {
                results.push({
                    userId: sw.userId,
                    status: 'FAILED',
                    error: err.message
                });
            }
        }

        return NextResponse.json({
            processed: activeSwitches.length,
            expired: expiredSwitches.length,
            details: results
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
