import pathlib

# ===== FIX 1: user/nuke - IDOR: delete session.userId, NOT body.address =====
path = pathlib.Path('d:/Projects/Wallet Human Polymarket ID/app/api/user/nuke/route.ts')
content = path.read_text(encoding='utf-8')

# The IDOR: route gets session.userId but deletes body.address
# Fix: enforce that body.address must match session.userId
old_sig_check = """        // 3. Cryptographic Signature Verification
        const message = I want to permanently delete all my data from System Handshake. Wallet: . Timestamp: ;"""
new_sig_check = """        // 3. IDOR Fix: Enforce that the address in body matches the authenticated session
        // Without this, an attacker can authenticate as their own wallet then delete any victim's account
        if (address.toLowerCase() !== session.userId.toLowerCase()) {
            return NextResponse.json({ error: 'Address mismatch with authenticated session.' }, { status: 403 });
        }

        // 3. Cryptographic Signature Verification
        const message = I want to permanently delete all my data from System Handshake. Wallet: . Timestamp: ;"""
content = content.replace(old_sig_check, new_sig_check)

# Fix hardcoded salt fallback
old_salt = "                const salt = process.env.NUKE_SALT || process.env.JWT_SECRET || 'HumanityLedger_ZeroG_Salt_777';"
new_salt = """                // [SECURITY] Fail closed - never use hardcoded salt for deletion commitments
                const salt = process.env.NUKE_SALT || process.env.JWT_SECRET;
                if (!salt) {
                    throw new Error('NUKE_SALT not configured. Cannot create deletion commitment.');
                }"""
content = content.replace(old_salt, new_salt)

path.write_text(content, encoding='utf-8')
print("Fixed user/nuke - IDOR + hardcoded salt")

# ===== FIX 2: zk/avs GET - Publicly exposes ALL unverified ledger activity =====
path2 = pathlib.Path('d:/Projects/Wallet Human Polymarket ID/app/api/zk/avs/route.ts')
content2 = path2.read_text(encoding='utf-8')

if 'import { getSession }' not in content2:
    content2 = "import { getSession } from '@/lib/session';\n" + content2

old_get = """export async function GET(req: NextRequest) {
    try {
        // Fetch 5 most recent unverified ledger activity signals
        const pendingSignals = await prisma.ledgerActivity.findMany({"""
new_get = """export async function GET(req: NextRequest) {
    try {
        // [SECURITY] Only registered AVS operators (authenticated) should pull pending signals
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ ok: false, error: 'Unauthorized: AVS operator session required.' }, { status: 401 });
        }
        // Fetch 5 most recent unverified ledger activity signals
        const pendingSignals = await prisma.ledgerActivity.findMany({"""
content2 = content2.replace(old_get, new_get)

old_post = """export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { txHash, proof, operatorId } = body;"""
new_post = """export async function POST(req: NextRequest) {
    try {
        // [SECURITY] Only authenticated operators can submit proofs
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ ok: false, error: 'Unauthorized: AVS operator session required.' }, { status: 401 });
        }
        const body = await req.json();
        const { txHash, proof, operatorId } = body;
        
        // [SECURITY] Ensure operatorId matches the authenticated session
        if (operatorId && operatorId.toLowerCase() !== session.userId.toLowerCase()) {
            return NextResponse.json({ ok: false, error: 'operatorId mismatch with authenticated session.' }, { status: 403 });
        }"""
content2 = content2.replace(old_post, new_post)

path2.write_text(content2, encoding='utf-8')
print("Fixed zk/avs - added auth + operatorId IDOR fix")

# ===== FIX 3: JWT lib - check for algorithm confusion =====
# The current jwt.ts uses explicit algorithm whitelisting: ['EdDSA'] and ['HS256'] - that's GOOD
# But verifyJWT could be confused if EdDSA keys are present but token was signed with HS256 during migration
# Add explicit issuer validation and audience check
path3 = pathlib.Path('d:/Projects/Wallet Human Polymarket ID/lib/jwt.ts')
content3 = path3.read_text(encoding='utf-8')

# Add explicit issuer to mint
old_mint_eddsa = """    return new SignJWT(payload)
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(keys.privateKey);"""
new_mint_eddsa = """    return new SignJWT(payload)
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime('7d')
      .setIssuer('humanidfi.com')
      .setAudience('humanidfi.com')
      .sign(keys.privateKey);"""
content3 = content3.replace(old_mint_eddsa, new_mint_eddsa)

old_mint_hs256 = """  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(secret));"""
new_mint_hs256 = """  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .setIssuer('humanidfi.com')
    .setAudience('humanidfi.com')
    .sign(new TextEncoder().encode(secret));"""
content3 = content3.replace(old_mint_hs256, new_mint_hs256)

path3.write_text(content3, encoding='utf-8')
print("Fixed lib/jwt.ts - added issuer and audience claims to all minted JWTs")

print("ALL PHASE 4 PATCHES APPLIED")
