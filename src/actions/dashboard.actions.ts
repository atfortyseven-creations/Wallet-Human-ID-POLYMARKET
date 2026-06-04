'use server' // Ensures code runs on the server, not the browser

import { TreasuryService } from "@/services/treasury.service";
import { IdentityService } from "@/services/identity.service";
import db from "@/lib/db";

// 1. Fetch data for Bento Grid
export async function getDashboardData() {
    // Parallel execution for maximum speed (Promise.all)
    // A Senior doesn't wait for A to finish before requesting B.
    const [treasury, intel] = await Promise.all([
        TreasuryService.getProtocolMetrics(),
        db.intelItem.findMany({
            take: 5,
            orderBy: { publishedAt: 'desc' },
            select: { title: true, category: true, source: true, publishedAt: true } // Selective for lightweight payload
        })
    ]);

    return {
        treasury,
        intel
    };
}

// 2. Action to connect wallet and register session
export async function loginWallet(address: string) {
    return await IdentityService.syncUser(address);
}
