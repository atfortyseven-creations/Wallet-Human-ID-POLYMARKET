import re

file_path = "d:\\Projects\\Wallet Human Polymarket ID\\components\\terminal\\LedgerChat.tsx"

try:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Comment out the burn timer that uses setMessages
    content = re.sub(
        r"(setMessages\(prev => \{)",
        r"// \1",
        content
    )

    # If he calls setMessages directly anywhere else
    content = re.sub(
        r"(setMessages\()",
        r"// \1",
        content
    )

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    print("LedgerChat.tsx setMessages completely neutralized!")
except Exception as e:
    print(f"Error patching file: {e}")