import re

file_path = "d:\\Projects\\Wallet Human Polymarket ID\\context\\ChatEngineProvider.tsx"

try:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    content = content.replace("await getXMTPClient(address, null);", "await getXMTPClient(address);")

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    print("ChatEngineProvider.tsx patched!")
except Exception as e:
    print(f"Error patching file: {e}")