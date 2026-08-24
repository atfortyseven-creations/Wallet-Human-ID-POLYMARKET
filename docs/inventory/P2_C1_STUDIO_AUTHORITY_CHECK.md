# P2-C.1 Studio Authority Check Design

> Authorized only AFTER baseline verification passes AND Identity Adapter is in SHADOW mode.  
> Status: PENDING

---

## Design Principle
**24h JWT TTL is NOT 24h authorization.**  
Every sensitive mutation requires:
```
JWT valid (Edge check)
+
HumanitySession.revokedAt === null (DB authoritative check)
+
Permission valid
```

## Required Helper: `requireActiveSession`

```typescript
// lib/security/studio-auth.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function requireActiveStudioSession(req: Request): Promise<{
    walletAddress: string;
    sessionId: string;
}> {
    // 1. Extract humanity_session cookie and verify JWT
    const cookies = req.headers.get('cookie') || '';
    const sessionCookie = cookies.match(/humanity_session=([^;]+)/)?.[1];
    if (!sessionCookie) throw Object.assign(new Error('No session'), { status: 401 });
    
    const { jwtVerify } = await import('jose');
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(sessionCookie, secret);
    const sessionId = payload.sid as string;
    
    // 2. Authoritative DB check — same flow as the mutation (not "earlier")
    const session = await prisma.humanitySession.findUnique({
        where: { id: sessionId },
        select: { id: true, revokedAt: true, expiresAt: true, identity: { select: { walletAddress: true } } }
    });
    
    if (!session) throw Object.assign(new Error('Session not found'), { status: 401 });
    if (session.revokedAt) throw Object.assign(new Error('Session revoked'), { status: 401 });
    if (session.expiresAt < new Date()) throw Object.assign(new Error('Session expired'), { status: 401 });
    
    return { walletAddress: session.identity.walletAddress, sessionId: session.id };
}
```

## Transactional Boundary for Mutations
For `POST /api/passport`:
```typescript
const passport = await prisma.$transaction(async (tx) => {
    // Step 1: Authority check INSIDE the transaction
    const session = await tx.humanitySession.findUnique({
        where: { id: sessionId },
        select: { revokedAt: true, expiresAt: true }
    });
    if (!session || session.revokedAt || session.expiresAt < new Date()) {
        throw new Error('Session invalid or revoked');
    }
    
    // Step 2: Permission check INSIDE the transaction
    // (rate limit, tier check)
    
    // Step 3: Mutation INSIDE the transaction
    return await tx.productPassport.create({ data: { ... } });
});
```

## Transaction Properties
- **Boundary:** Single `prisma.$transaction` block covering session check + permission check + mutation
- **Isolation level:** READ COMMITTED (PostgreSQL default) — sufficient to prevent dirty reads
- **Race behavior:** If session is revoked between T0 (auth) and T1 (tx start), the transaction will see the revocation because it re-reads from DB within the tx
- **Limitation:** If session is revoked DURING the transaction (after the session read), the mutation may complete within the same isolation snapshot. This is an inherent race window but is bounded by the transaction duration (milliseconds), not by JWT TTL (24h).

## Revocation Race Window
```
T0  JWT valid → request enters
T1  tx.findUnique(session) → VALID at this point
T2  [external revocation occurs]
T3  tx.productPassport.create() → may complete
```
Window = T1 to T3 (milliseconds).  
Compare to legacy: entire JWT TTL (up to 24h).  
This is an acceptable documented residual risk for P2-C.1 scope.
