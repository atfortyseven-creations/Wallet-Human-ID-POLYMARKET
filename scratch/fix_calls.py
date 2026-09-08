file_path = "d:\\Projects\\Wallet Human Polymarket ID\\components\\terminal\\LedgerChat.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace legacy handleStartCall implementation to use Quantum Engine
old_handleStartCall = """const handleStartCall = (type: 'audio' | 'video', targetPeerOverride?: string) => {
    startCall(type, targetPeerOverride);
  };"""

new_handleStartCall = """const handleStartCall = async (type: 'audio' | 'video', targetPeerOverride?: string) => {
    const peer = targetPeerOverride || activePeer;
    if (!peer) return;
    await engineStartCall(peer, type === 'video');
  };"""

content = content.replace(old_handleStartCall, new_handleStartCall)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("LedgerChat patched to use engineStartCall")