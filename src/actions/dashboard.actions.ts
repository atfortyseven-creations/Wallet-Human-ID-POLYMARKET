'use server' // Esto asegura que el código corre en el servidor, no en el navegador

import { TreasuryService } from "@/services/treasury.service";
import { IdentityService } from "@/services/identity.service";
import db from "@/lib/db";

// 1. Obtener datos para el Bento Grid
export async function getDashboardData() {
    // Ejecución paralela para máxima velocidad (Promise.all)
    // Un Senior no espera a que termine A para pedir B.
    const [treasury, intel] = await Promise.all([
        TreasuryService.getProtocolMetrics(),
        db.intelItem.findMany({
            take: 5,
            orderBy: { publishedAt: 'desc' },
            select: { title: true, category: true, source: true, publishedAt: true } // Selectivo para payload ligero
        })
    ]);

    return {
        treasury,
        intel
    };
}

// 2. Acción para conectar wallet y registrar sesión
export async function loginWallet(address: string) {
    return await IdentityService.syncUser(address);
}
