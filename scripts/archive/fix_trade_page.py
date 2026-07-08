import os

path = r'c:\Users\admin\.gemini\antigravity\scratch\Wallet Human Polymarket ID\app\trade\page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    # Remove the WorldGate wrapper tag (opening/closing)
    if '<WorldGate>' in line or '</WorldGate>' in line:
        continue
    # Remove the WorldGate import
    if 'import { WorldGate } from \'@/components/guards/WorldGate\';' in line:
        continue
    new_lines.append(line)

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Successfully cleaned up app/trade/page.tsx")
