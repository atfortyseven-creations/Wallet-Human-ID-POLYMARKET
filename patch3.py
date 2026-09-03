import re

path = r'd:\Projects\Wallet Human Polymarket ID\lib\xmtp\client.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace dynamic viem getAddress with synchronous ethers.getAddress
content = content.replace(
    "const { getAddress } = await import('viem');\n      return getAddress(addr);",
    "const { ethers } = await import('ethers');\n      return ethers.getAddress(addr);"
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
