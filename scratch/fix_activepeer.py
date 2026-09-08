import re

file_path = "d:\\Projects\\Wallet Human Polymarket ID\\components\\terminal\\LedgerChat.tsx"

try:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Update the useChatEngine destruction to include setActivePeer
    content = content.replace(
        "const { messages, sendMessage: engineSendMessage, startCall: engineStartCall, endCall: engineEndCall } = useChatEngine();",
        "const { messages, sendMessage: engineSendMessage, startCall: engineStartCall, endCall: engineEndCall, setActivePeer: engineSetActivePeer } = useChatEngine();"
    )

    # 2. Add an effect to sync the local activePeer to the engine
    sync_effect = """
    // [AEGIS AUDIT FIX] Sync local activePeer with Quantum Engine
    useEffect(() => {
        if (activePeer) engineSetActivePeer(activePeer);
    }, [activePeer, engineSetActivePeer]);
"""
    # Insert it right after the useChatEngine call
    content = re.sub(
        r"(const \{ messages[^}]*\} = useChatEngine\(\);)",
        r"\1\n" + sync_effect,
        content
    )

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    print("LedgerChat.tsx activePeer synchronization fixed!")
except Exception as e:
    print(f"Error patching file: {e}")