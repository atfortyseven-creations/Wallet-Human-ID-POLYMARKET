import pathlib
import os

critical_routes = [
    'app/api/admin/purge-mock/route.ts',
    'app/api/admin/reset-forum/route.ts',
    'app/api/admin/seed-forum/route.ts',
]

for route in critical_routes:
    path = pathlib.Path(f'd:/Projects/Wallet Human Polymarket ID/{route}')
    if not path.exists():
        continue
        
    content = path.read_text(encoding='utf-8')
    if 'getSession' not in content:
        # Add getSession import
        content = "import { getSession } from '@/lib/session';\n" + content
        
        # Inject check at start of POST or GET
        check = '''
    const session = await getSession();
    if (!session?.userId) {
        return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }
'''
        content = content.replace('export async function POST(request: NextRequest) {', 'export async function POST(request: NextRequest) {' + check)
        content = content.replace('export async function GET(request: NextRequest) {', 'export async function GET(request: NextRequest) {' + check)
        
        path.write_text(content, encoding='utf-8')
        print(f"Patched {route}")
