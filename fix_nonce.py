import sys
import re

with open("components/landing/ConnectPage.tsx", "r", encoding="utf-8") as f:
    content = f.read()

pattern = r"const nonce = `HL-\$\{Date\.now\(\)\}-\$\{Math\.random\(\)\.toString\(36\)\.slice\(2\)\}`;(.*?)const msg = `Sign in to Humanity Ledger\\n\\nAddress: \$\{address\}\\nNonce: \$\{nonce\}\\nChain: Ethereum`;"

replacement = r"""const nonceRes = await fetch("/api/auth/nonce", { cache: "no-store" });
        if (!nonceRes.ok) throw new Error("Failed to fetch cryptographic nonce");
        const { nonce } = await nonceRes.json();\1const msg = `Sign in to Humanity Ledger\n\nAddress: ${address}\nNonce: ${nonce}\nChain: Ethereum`;"""

new_content, count = re.subn(pattern, replacement, content, flags=re.DOTALL)

if count > 0:
    print(f"Replaced {count} instances.")
    with open("components/landing/ConnectPage.tsx", "w", encoding="utf-8") as f:
        f.write(new_content)
else:
    print("Failed to replace!")