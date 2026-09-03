import pathlib, re

files = [
    'd:/Projects/Wallet Human Polymarket ID/app/api/forum/telemetry/route.ts',
    'd:/Projects/Wallet Human Polymarket ID/app/api/forum/user/[address]/settings/route.ts',
    'd:/Projects/Wallet Human Polymarket ID/app/api/user/nuke/route.ts',
    'd:/Projects/Wallet Human Polymarket ID/app/api/forum/categories/route.ts',
    'd:/Projects/Wallet Human Polymarket ID/app/api/chat/onion/queue/route.ts',
    'd:/Projects/Wallet Human Polymarket ID/app/api/chat/onion/register/route.ts',
]

DUPE_BLOCK = '''
    const session = await getSession();
    if (!session?.userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized: Authentication required.' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const session = await getSession();
    if (!session?.userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized: Authentication required.' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }'''

CLEAN_BLOCK = '''
    const session = await getSession();
    if (!session?.userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized: Authentication required.' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }'''

for f in files:
    p = pathlib.Path(f)
    if not p.exists():
        print(f"SKIP (not found): {f}")
        continue
    content = p.read_text(encoding='utf-8')
    if DUPE_BLOCK in content:
        content = content.replace(DUPE_BLOCK, CLEAN_BLOCK)
        p.write_text(content, encoding='utf-8')
        print(f"FIXED: {f}")
    else:
        print(f"OK (no dupe): {f}")
