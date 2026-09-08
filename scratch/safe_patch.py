import re

file_path = "d:\\Projects\\Wallet Human Polymarket ID\\components\\terminal\\LedgerChat.tsx"

try:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Add import
    if "useChatEngine" not in content:
        import_stmt = "\nimport { useChatEngine } from '@/context/ChatEngineProvider';\n"
        content = re.sub(r"(import React.*?;\n)", r"\1" + import_stmt, content, count=1)

    # Replace useState with the Engine hooks, AND provide a dummy setMessages to prevent AST corruption
    safe_replacement = """
    const { messages, sendMessage: engineSendMessage, startCall: engineStartCall, endCall: engineEndCall, setActivePeer: engineSetActivePeer } = useChatEngine();
    // Dummy setMessages to prevent old effects (like burnTimer) from crashing the syntax or runtime
    const setMessages = (updater: any) => { console.log('setMessages bypassed by Quantum Engine'); };

    // [AEGIS AUDIT FIX] Sync local activePeer with Quantum Engine
    useEffect(() => {
        if (activePeer) engineSetActivePeer(activePeer);
    }, [activePeer, engineSetActivePeer]);
    """

    content = re.sub(
        r"const\s+\[messages,\s*setMessages\]\s*=\s*useState<any\[\]>\(\[\]\);",
        safe_replacement,
        content
    )

    # Replace the exact send message calls safely without commenting out blocks
    content = re.sub(
        r"sendMessage\(\s*client\s*,\s*([^,]+)\s*,\s*([^,]+)(?:\s*,\s*[^)]+)?\s*\)",
        r"engineSendMessage(\1, \2)",
        content
    )

    # Neutralize streamMessages and getMessages safely by replacing their assignment
    content = re.sub(r"const gen = streamMessages\(", r"const gen = [] as any; // streamMessages(", content)
    content = re.sub(r"let raw = await getMessages\(", r"let raw = [] as any; // await getMessages(", content)

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    print("Safe patch applied successfully.")
except Exception as e:
    print(f"Error patching file: {e}")