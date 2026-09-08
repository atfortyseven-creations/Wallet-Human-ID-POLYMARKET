import re
import sys

file_path = "d:\\Projects\\Wallet Human Polymarket ID\\components\\terminal\\LedgerChat.tsx"

try:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Inject imports
    if "useChatEngine" not in content:
        import_stmt = "\nimport { useChatEngine } from '@/context/ChatEngineProvider';\n"
        content = re.sub(r"(import React.*?;\n)", r"\1" + import_stmt, content, count=1)

    # 2. Replace the local useState for messages
    content = re.sub(
        r"const\s+\[messages,\s*setMessages\]\s*=\s*useState<any\[\]>\(\[\]\);",
        "const { messages, sendMessage: engineSendMessage, startCall: engineStartCall, endCall: engineEndCall } = useChatEngine();",
        content
    )

    # 3. Comment out the old XMTP streams
    content = re.sub(r"(const gen = streamMessages\()", r"// \1", content)
    content = re.sub(r"(let raw = await getMessages\()", r"// \1", content)

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    print("LedgerChat.tsx successfully patched with Quantum Engine!")
except Exception as e:
    print(f"Error patching file: {e}")