import pathlib
import os
import re

api_dirs = [
    'd:/Projects/Wallet Human Polymarket ID/app/api/forum',
    'd:/Projects/Wallet Human Polymarket ID/app/api/user',
    'd:/Projects/Wallet Human Polymarket ID/app/api/chat'
]

patched = 0

for d in api_dirs:
    for root, _, files in os.walk(d):
        for f in files:
            if f == 'route.ts':
                path = pathlib.Path(root) / f
                content = path.read_text(encoding='utf-8')
                
                has_write = any(w in content for w in ['.create(', '.update(', '.delete(', '.upsert(', '.createMany(', '.updateMany('])
                has_auth = any(auth in content for auth in ['getSession(', 'x-verified-session-address', 'requireAdmin(', 'jwtVerify(', 'getServerSession(', 'validateSecureRequest'])
                
                if has_write and not has_auth:
                    # Inject import
                    if 'import { getSession } from' not in content:
                        content = "import { getSession } from '@/lib/session';\n" + content
                        
                    # Inject check for POST/PUT/DELETE
                    check = '''
    const session = await getSession();
    if (!session?.userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized: Authentication required.' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
'''
                    content = re.sub(r'export async function (POST|PUT|DELETE|PATCH)\s*\([^)]*\)\s*{', r'export async function \1(request: Request) {' + check, content)
                    content = re.sub(r'export async function (POST|PUT|DELETE|PATCH)\s*\(\s*req[^)]*\)\s*{', r'export async function \1(req: Request) {' + check, content)
                    
                    path.write_text(content, encoding='utf-8')
                    patched += 1
                    print(f"Patched {path}")

print(f"Total routes patched: {patched}")
