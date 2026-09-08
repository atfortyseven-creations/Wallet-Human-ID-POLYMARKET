import re

file_path = "d:\\Projects\\Wallet Human Polymarket ID\\components\\terminal\\LedgerChat.tsx"

try:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Replace sendMessage(client, peer, content, address) with engineSendMessage(peer, content)
    # The regex needs to handle optional address parameter.
    content = re.sub(
        r"sendMessage\(\s*client\s*,\s*([^,]+)\s*,\s*([^,]+)(?:\s*,\s*[^)]+)?\s*\)",
        r"engineSendMessage(\1, \2)",
        content
    )

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    print("LedgerChat.tsx successfully patched to use engineSendMessage!")
except Exception as e:
    print(f"Error patching file: {e}")