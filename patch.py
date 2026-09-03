import re

# Fix 1
p1 = r'd:\Projects\Wallet Human Polymarket ID\app\api\chat\contacts\request\[action]\route.ts'
with open(p1, 'r', encoding='utf-8') as f:
    c1 = f.read()
c1 = re.sub(
    r'export async function POST\(req: NextRequest, { params }: { params: { action: string } }\) {',
    r'export async function POST(req: NextRequest, { params }: { params: Promise<{ action: string }> }) {\n    const resolvedParams = await params;\n    const action = resolvedParams.action;',
    c1
)
with open(p1, 'w', encoding='utf-8') as f:
    f.write(c1)

# Fix 2
p2 = r'd:\Projects\Wallet Human Polymarket ID\components\bsv\InstitutionalPortfolioView.tsx'
with open(p2, 'r', encoding='utf-8') as f:
    c2 = f.read()
c2 = c2.replace('<SettingsView onBack={() => setShowSettings(false)} />', '<SettingsView onClose={() => setShowSettings(false)} />')
with open(p2, 'w', encoding='utf-8') as f:
    f.write(c2)

# Fix 3
p3 = r'd:\Projects\Wallet Human Polymarket ID\components\settings\SettingsView.tsx'
with open(p3, 'r', encoding='utf-8') as f:
    c3 = f.read()
c3 = c3.replace(
    'const { verifyPassword } = await import(\'@/lib/store/crypto-utils\');\n            const isValid = await verifyPassword(authPassword, passwordHash);',
    'const CryptoJS = (await import(\'crypto-js\')).default;\n            const isValid = CryptoJS.SHA256(authPassword).toString() === passwordHash;'
)
with open(p3, 'w', encoding='utf-8') as f:
    f.write(c3)

# Fix 4
p4 = r'd:\Projects\Wallet Human Polymarket ID\components\terminal\LedgerChat.tsx'
with open(p4, 'r', encoding='utf-8') as f:
    c4 = f.read()
c4 = c4.replace('style="custom"', 'style="default"')
c4 = c4.replace('theme="light"', '')
with open(p4, 'w', encoding='utf-8') as f:
    f.write(c4)
