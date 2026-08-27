import { PrismaClient, HumanitySession, HumanityIdentity } from '@prisma/client';
import { verifyJWT } from '@/lib/jwt';
import { getSession } from '@/lib/session';
import { cookies } from 'next/headers';

// ─── Singleton prisma para uso en módulos de server-side ───────────────────────
// Este módulo es importado por múltiples API routes: no instanciar PrismaClient
// en cada request — usar el singleton global de @/lib/prisma.
import { prisma } from '@/lib/prisma';

// ─── Tipos exportados ─────────────────────────────────────────────────────────

export type StudioAdapterMode = 'OFF' | 'SHADOW' | 'PILOT' | 'LIVE';

export interface StudioIdentityResult {
    /** Dirección Ethereum del token legacy (ledger_session / human_session) */
    legacyAddress: string | null;
    /** Dirección Ethereum del token humanity_session (SIWE) */
    humanityAddress: string | null;
    /** UUID de la sesión HumanitySession en base de datos */
    sessionId: string | null;
    /** Modo del feature flag actual */
    mode: StudioAdapterMode;
    /** true si legacyAddress !== humanityAddress (para telemetría SHADOW) */
    mismatch: boolean;
    /**
     * La dirección que tiene autorización real para ejecutar mutaciones.
     * - OFF/SHADOW: legacyAddress (comportamiento actual conservado)
     * - PILOT/LIVE: humanityAddress (sólo si DB confirma sesión no revocada)
     */
    authorizedAddress: string | null;
    /**
     * STEP 4 — Authoritative DB Session Check.
     * Sólo relleno cuando mode=PILOT|LIVE y sessionId != null.
     * null si aún no se ha realizado la comprobación.
     */
    dbSessionValid: boolean | null;
}

// ─── Feature flag ──────────────────────────────────────────────────────────────

/**
 * Lee el feature flag de identity migration de Studio.
 * Sólo acepta valores del enum tipado — cualquier otro valor cae a 'OFF'.
 * 
 * Valores válidos del env var NEXT_PUBLIC_IDENTITY_SIWE_STUDIO_ENABLED:
 *   OFF    → usa únicamente legacy getSession() (comportamiento por defecto)
 *   SHADOW → resuelve ambas identidades, compara, pero autoriza con legacy
 *   PILOT  → resuelve ambas identidades, autoriza con HumanityIdentity si la
 *             sesión DB es válida (no revocada, no expirada)
 *   LIVE   → igual que PILOT, pero considerado el estado final de migración
 */
export async function getStudioAdapterMode(): Promise<StudioAdapterMode> {
    const flag = process.env.NEXT_PUBLIC_IDENTITY_SIWE_STUDIO_ENABLED ?? 'OFF';
    const VALID_MODES: StudioAdapterMode[] = ['OFF', 'SHADOW', 'PILOT', 'LIVE'];
    if ((VALID_MODES as string[]).includes(flag)) {
        return flag as StudioAdapterMode;
    }
    console.warn(`[StudioAdapter] Invalid NEXT_PUBLIC_IDENTITY_SIWE_STUDIO_ENABLED="${flag}", defaulting to OFF.`);
    return 'OFF';
}

// ─── Core: Resolver de identidad ──────────────────────────────────────────────

/**
 * Resuelve la identidad para una petición de mutación de Studio.
 *
 * SHADOW Mode (Step 3):
 *   - Resuelve AMBAS identidades en paralelo.
 *   - Detecta y registra cualquier discrepancia (mismatch).
 *   - La dirección autorizada sigue siendo la legacy (sin cambio de comportamiento).
 *   - Cero impacto en producción para el usuario.
 *
 * PILOT/LIVE Mode (Step 4 — Authoritative Session Check):
 *   - Resuelve identidad humanity_session y verifica en DB (dentro del flujo
 *     transaccional del llamador) que la sesión NO esté revocada ni expirada.
 *   - Si la sesión DB es inválida, authorizedAddress = null → el llamador devuelve 401.
 *
 * @param skipDbCheck - Si true, omite la comprobación DB (para SHADOW puro sin overhead de DB).
 */
export async function resolveStudioIdentity(
    skipDbCheck: boolean = false
): Promise<StudioIdentityResult> {
    const mode = await getStudioAdapterMode();

    // ── OFF: fast path, sin overhead ─────────────────────────────────────────
    if (mode === 'OFF') {
        const legacySession = await getSession();
        const legacyAddress = legacySession?.userId?.toLowerCase() ?? null;
        return {
            legacyAddress,
            humanityAddress: null,
            sessionId: null,
            mode,
            mismatch: false,
            authorizedAddress: legacyAddress,
            dbSessionValid: null,
        };
    }

    // ── SHADOW / PILOT / LIVE: resolución dual en paralelo ────────────────────
    const cookieStore = await cookies();

    const [legacySession, humanityPayload] = await Promise.all([
        getSession().catch(() => null),
        resolveHumanitySession(cookieStore),
    ]);

    const legacyAddress  = legacySession?.userId?.toLowerCase() ?? null;
    const humanityAddress = humanityPayload?.address ?? null;
    const sessionId       = humanityPayload?.sessionId ?? null;

    // Normalizar a lowercase para comparación segura
    const normalizedLegacy   = legacyAddress?.toLowerCase() ?? null;
    const normalizedHumanity = humanityAddress?.toLowerCase() ?? null;
    const mismatch = normalizedLegacy !== normalizedHumanity;

    // ── Telemetría SHADOW ─────────────────────────────────────────────────────
    if (mismatch) {
        console.warn(
            `[StudioAdapter:${mode}] Identity mismatch detected!`,
            `legacy=${normalizedLegacy ?? 'NONE'}`,
            `humanity=${normalizedHumanity ?? 'NONE'}`,
        );
    } else if (normalizedLegacy && normalizedHumanity) {
        console.info(`[StudioAdapter:${mode}] Identities matched: ${normalizedLegacy}`);
    }

    // ── SHADOW: sólo telemetría, autoriza con legacy ──────────────────────────
    if (mode === 'SHADOW') {
        return {
            legacyAddress,
            humanityAddress,
            sessionId,
            mode,
            mismatch,
            authorizedAddress: legacyAddress,
            dbSessionValid: null,
        };
    }

    // ── PILOT / LIVE: DB Authoritative Session Check ──────────────────────────
    // Si no hay humanity_session válida, no hay autorización bajo la nueva arquitectura.
    if (!humanityAddress || !sessionId) {
        console.warn(`[StudioAdapter:${mode}] No valid humanity_session found — denying authorization.`);
        return {
            legacyAddress,
            humanityAddress,
            sessionId,
            mode,
            mismatch,
            authorizedAddress: null,
            dbSessionValid: false,
        };
    }

    if (skipDbCheck) {
        // Llamador explícitamente omitió la comprobación DB (ej.: dentro de una transacción
        // Prisma ya abierta donde el llamador hará la comprobación él mismo).
        return {
            legacyAddress,
            humanityAddress,
            sessionId,
            mode,
            mismatch,
            authorizedAddress: humanityAddress,
            dbSessionValid: null,
        };
    }

    // Comprobación DB canónica — fuera de la transacción del llamador para uso en
    // rutas de lectura, pero el llamador puede (y debe para mutations) re-verificar
    // DENTRO de su Prisma.$transaction para eliminar la race window.
    const dbSessionValid = await checkDbSessionValid(sessionId, humanityAddress);

    return {
        legacyAddress,
        humanityAddress,
        sessionId,
        mode,
        mismatch,
        authorizedAddress: dbSessionValid ? humanityAddress : null,
        dbSessionValid,
    };
}

// ─── Helper: Resolución del token humanity_session ───────────────────────────

interface HumanitySessionPayload {
    address: string;
    sessionId: string;
}

async function resolveHumanitySession(
    cookieStore: Awaited<ReturnType<typeof cookies>>
): Promise<HumanitySessionPayload | null> {
    const tokenValue = cookieStore.get('humanity_session')?.value;
    if (!tokenValue) return null;

    try {
        const payload = await verifyJWT(tokenValue) as any;

        // Payload structure: { sub: address, sid: sessionId, ... }
        const address   = (payload.sub as string | undefined)?.toLowerCase();
        const sessionId = payload.sid as string | undefined;

        if (!address || !sessionId) {
            console.warn('[StudioAdapter] humanity_session JWT missing sub or sid claim.');
            return null;
        }

        return { address, sessionId };
    } catch (err: any) {
        // JWT expirado, firma inválida, etc.
        console.debug('[StudioAdapter] humanity_session JWT verification failed:', err.message ?? err);
        return null;
    }
}

// ─── Helper: DB Authoritative Session Check ──────────────────────────────────

/**
 * Verifica en base de datos que la HumanitySession:
 *   1. Existe
 *   2. No ha sido revocada (revokedAt IS NULL)
 *   3. No ha expirado (expiresAt > NOW)
 *   4. Pertenece a la identidad correcta (identityId.walletAddress === address)
 *
 * Esta es la función que cierra el "24h revocation gap" identificado en el Baseline.
 * Para mutaciones críticas, el llamador DEBE ejecutar esta misma lógica DENTRO
 * de un Prisma.$transaction para eliminar la race window entre verificación y escritura.
 */
export async function checkDbSessionValid(
    sessionId: string,
    address: string
): Promise<boolean> {
    if (!sessionId || !address) return false;

    try {
        const session = await prisma.humanitySession.findUnique({
            where: { sessionId },
            include: {
                identity: {
                    select: { walletAddress: true, verificationStatus: true }
                },
            },
        });

        if (!session) {
            console.warn(`[StudioAdapter:DB] Session ${sessionId} not found in DB.`);
            return false;
        }

        // 1. Revocation check
        if (session.revokedAt !== null) {
            console.warn(`[StudioAdapter:DB] Session ${sessionId} was revoked at ${session.revokedAt.toISOString()}.`);
            return false;
        }

        // 2. Expiry check
        if (session.expiresAt < new Date()) {
            console.warn(`[StudioAdapter:DB] Session ${sessionId} expired at ${session.expiresAt.toISOString()}.`);
            return false;
        }

        // 3. Identity ownership check — address in JWT must match DB identity
        const dbAddress = session.identity.walletAddress?.toLowerCase();
        if (dbAddress !== address.toLowerCase()) {
            console.error(
                `[StudioAdapter:DB] SECURITY: JWT address (${address}) != DB identity address (${dbAddress}).`,
                `Session ${sessionId} rejected.`
            );
            return false;
        }

        // Update lastSeenAt asynchronously — do NOT await to avoid blocking request path
        prisma.humanitySession.update({
            where: { sessionId },
            data: { lastSeenAt: new Date() },
        }).catch(err => {
            console.debug('[StudioAdapter:DB] Failed to update lastSeenAt (non-critical):', err.message);
        });

        return true;
    } catch (err: any) {
        console.error('[StudioAdapter:DB] DB session check failed:', err.message ?? err);
        // On DB error, fail closed (deny access) — security-first
        return false;
    }
}

/**
 * Ejecuta el DB Authoritative Session Check DENTRO de una transacción Prisma abierta.
 * Usar este helper en mutations críticas (POST /api/passport, spendQDs, etc.)
 * para ELIMINAR completamente la race window entre verificación y escritura.
 *
 * @param tx - La instancia de Prisma transaction activa
 * @param sessionId - UUID de la HumanitySession
 * @param address - Dirección Ethereum a validar contra la identidad DB
 */
export async function checkDbSessionValidInTx(
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
    sessionId: string,
    address: string
): Promise<boolean> {
    if (!sessionId || !address) return false;

    const session = await (tx as any).humanitySession.findUnique({
        where: { sessionId },
        include: {
            identity: {
                select: { walletAddress: true }
            },
        },
    });

    if (!session) return false;
    if (session.revokedAt !== null) return false;
    if (session.expiresAt < new Date()) return false;

    const dbAddress = session.identity.walletAddress?.toLowerCase();
    if (dbAddress !== address.toLowerCase()) {
        console.error(`[StudioAdapter:TX] SECURITY: Address mismatch for session ${sessionId}.`);
        return false;
    }

    return true;
}
