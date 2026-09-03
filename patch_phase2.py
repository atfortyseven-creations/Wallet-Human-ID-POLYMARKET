import pathlib

# ===== 1. FIX RELAYER/EXECUTE — Add auth + sanitize errors =====
path = pathlib.Path('d:/Projects/Wallet Human Polymarket ID/app/api/relayer/execute/route.ts')
content = path.read_text(encoding='utf-8')

old_import = 'import { NextRequest, NextResponse } from "next/server";'
new_import = 'import { NextRequest, NextResponse } from "next/server";\nimport { getSession } from "@/lib/session";'
content = content.replace(old_import, new_import)

old_fn = '''export async function POST(req: NextRequest) {
    try {
        const body = await req.json();'''
new_fn = '''export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized: Authentication required." }, { status: 401 });
        }
        const body = await req.json();'''
content = content.replace(old_fn, new_fn)

# Sanitize error leak
old_err = '''return NextResponse.json({ error: error.message || "Execution failed" }, { status: 500 });'''
new_err = '''const safeErr = process.env.NODE_ENV === "production" ? "Execution failed. Please try again." : error.message;
        return NextResponse.json({ error: safeErr }, { status: 500 });'''
content = content.replace(old_err, new_err)

path.write_text(content, encoding='utf-8')
print("Fixed relayer/execute")

# ===== 2. FIX RELAYER/ZAP — Add auth + fix IDOR =====
path2 = pathlib.Path('d:/Projects/Wallet Human Polymarket ID/app/api/relayer/zap/route.ts')
content2 = path2.read_text(encoding='utf-8')

if 'import { getSession }' not in content2:
    content2 = 'import { getSession } from "@/lib/session";\n' + content2

old_fn2 = '''export async function POST(req: NextRequest) {
    try {
        // ====================================================================
        // PARSE REQUEST
        // ====================================================================

        const body = await req.json();
        const {
            user,'''
new_fn2 = '''export async function POST(req: NextRequest) {
    try {
        // Auth guard
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: "Unauthorized: Authentication required." }, { status: 401 });
        }

        // ====================================================================
        // PARSE REQUEST
        // ====================================================================

        const body = await req.json();
        const {
            user,'''
content2 = content2.replace(old_fn2, new_fn2)

# Fix IDOR: use session userId instead of body.user for DB write
content2 = content2.replace(
    "userId: user.toLowerCase(),",
    "userId: session.userId, // IDOR fix: use verified session, NOT client-supplied user field"
)

path2.write_text(content2, encoding='utf-8')
print("Fixed relayer/zap")

# ===== 3. FIX SIWE/VERIFY — sameSite strict + domain + chainId =====
path3 = pathlib.Path('d:/Projects/Wallet Human Polymarket ID/app/api/siwe/verify/route.ts')
content3 = path3.read_text(encoding='utf-8')

# Fix sameSite lax -> strict
content3 = content3.replace(
    "sameSite: 'lax' as const,",
    "sameSite: 'strict' as const, // CSRF fix: was 'lax'"
)

# Add domain/chainId enforcement after siweMessage.verify call
old_verify = '''    const { data: fields, error: siweErr } = await siweMessage.verify({
      signature,
      nonce,
    });'''
new_verify = '''    const { data: fields, error: siweErr } = await siweMessage.verify({
      signature,
      nonce,
      domain: process.env.NEXT_PUBLIC_DOMAIN || 'humanidfi.com',
    });'''
content3 = content3.replace(old_verify, new_verify)

# Add chainId check after siweErr check
old_chain_check = '''    if (siweErr || !fields) {
      console.error('[SIWE] Verification failed:', siweErr);
      return NextResponse.json({ ok: false, error: 'Invalid signature or nonce mismatch.' }, { status: 401 });
    }'''
new_chain_check = '''    if (siweErr || !fields) {
      console.error('[SIWE] Verification failed:', siweErr);
      return NextResponse.json({ ok: false, error: 'Invalid signature or nonce mismatch.' }, { status: 401 });
    }
    
    // Enforce only supported chains (Ethereum mainnet=1, Base=8453, Base Sepolia=84532)
    const ALLOWED_CHAINS = [1, 8453, 84532];
    if (!ALLOWED_CHAINS.includes(fields.chainId)) {
      return NextResponse.json({ ok: false, error: 'Unsupported chain. Use Ethereum or Base.' }, { status: 401 });
    }'''
content3 = content3.replace(old_chain_check, new_chain_check)

path3.write_text(content3, encoding='utf-8')
print("Fixed siwe/verify")

# ===== 4. FIX oracle/zk-biometrics — Real SHA-256 payloadHash =====
path4 = pathlib.Path('d:/Projects/Wallet Human Polymarket ID/app/api/oracle/zk-biometrics/route.ts')
content4 = path4.read_text(encoding='utf-8')

old_hash = "        const payloadHash = payload.slice(-32); // Use the tail of the base64 as a quick 'hash' for binding"
new_hash = """        // Real SHA-256 hash of the full payload buffer (not a slice)
        const { createHash } = await import('crypto');
        const payloadHash = createHash('sha256').update(Buffer.from(payload, 'base64')).digest('hex').substring(0, 32);"""
content4 = content4.replace(old_hash, new_hash)

path4.write_text(content4, encoding='utf-8')
print("Fixed oracle/zk-biometrics")

print("ALL PHASE 2 PATCHES APPLIED")
