import pathlib
import os

api_dir = pathlib.Path('d:/Projects/Wallet Human Polymarket ID/app/api')
vulnerable = []

for root, _, files in os.walk(api_dir):
    for f in files:
        if f == 'route.ts':
            path = pathlib.Path(root) / f
            content = path.read_text(encoding='utf-8')
            
            # check for DB writes
            has_write = any(w in content for w in ['.create(', '.update(', '.delete(', '.upsert(', '.createMany(', '.updateMany('])
            if has_write and 'prisma.' in content:
                # check for auth
                has_auth = any(auth in content for auth in ['getSession(', 'x-verified-session-address', 'requireAdmin(', 'jwtVerify(', 'getServerSession('])
                
                if not has_auth:
                    vulnerable.append(str(path))

print(f"Found {len(vulnerable)} completely unprotected DB write routes:")
for v in vulnerable:
    print(v)
