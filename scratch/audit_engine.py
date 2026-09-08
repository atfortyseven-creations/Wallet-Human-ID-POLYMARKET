import re

file_path = "d:\\Projects\\Wallet Human Polymarket ID\\context\\ChatEngineProvider.tsx"

try:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # We need to map LocalMessage to add properties required by MessageEngine
    map_logic = """
      const msgs = await chatDB.getMessagesByPeer(activePeer.toLowerCase());
      // [AEGIS AUDIT FIX] Guarantee RenderableMessage compatibility
      const mappedMsgs = msgs.map(m => ({
         ...m,
         reactions: m.reactions || [],
         isPinned: m.isPinned || false,
         isDestructing: m.isDestructing || false
      }));
      setMessages(mappedMsgs as any);
"""
    content = content.replace('const msgs = await chatDB.getMessagesByPeer(activePeer.toLowerCase());\n      setMessages(msgs);', map_logic)

    # Do the same for the handleSync
    sync_logic = """
      const newMsg = e.detail as LocalMessage;
      if (newMsg.peerAddress === activePeer.toLowerCase()) {
        const mappedMsg = {
           ...newMsg,
           reactions: [],
           isPinned: false,
           isDestructing: false
        };
        setMessages(prev => [...prev, mappedMsg as any]);
      }
"""
    
    # We replace the body of handleSync
    content = re.sub(
        r"const newMsg = e\.detail as LocalMessage;\s+if \(newMsg\.peerAddress === activePeer\.toLowerCase\(\)\) \{\s+setMessages\(prev => \[\.\.\.prev, newMsg\]\);\s+\}",
        sync_logic,
        content
    )

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    print("ChatEngineProvider patched for UI compatibility!")
except Exception as e:
    print(f"Error patching file: {e}")