import re

# Fix 1
p1 = r'd:\Projects\Wallet Human Polymarket ID\app\api\chat\contacts\request\[action]\route.ts'
with open(p1, 'r', encoding='utf-8') as f:
    c1 = f.read()

# Replace any NextRequest signature
c1 = re.sub(
    r'export async function POST\(req: NextRequest, { params }: { params: { action: string } }\) {',
    r'export async function POST(req: NextRequest, { params }: { params: Promise<{ action: string }> }) {\n    const resolvedParams = await params;\n    const action = resolvedParams.action;',
    c1
)
with open(p1, 'w', encoding='utf-8') as f:
    f.write(c1)

# Fix 4
p4 = r'd:\Projects\Wallet Human Polymarket ID\components\terminal\LedgerChat.tsx'
with open(p4, 'r', encoding='utf-8') as f:
    c4 = f.read()
c4 = c4.replace('style="custom"', 'style="default"')
with open(p4, 'w', encoding='utf-8') as f:
    f.write(c4)
