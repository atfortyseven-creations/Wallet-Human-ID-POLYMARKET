file_path = "d:\\Projects\\Wallet Human Polymarket ID\\context\\ChatEngineProvider.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

old_startCall = """  const startCall = async (peer: string, isVideo: boolean) => {
    await rtcEngineRef.current?.startCall(peer, isVideo);
  };"""

new_startCall = """  const startCall = async (peer: string, isVideo: boolean) => {
    if (client && address) {
      import('@/lib/engine/CallMetadataEngine').then(m => {
        m.CallMetadataEngine.sendCallOffer(client, peer, isVideo, address).catch(console.error);
      });
    }
    await rtcEngineRef.current?.startCall(peer, isVideo);
  };"""

content = content.replace(old_startCall, new_startCall)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("ChatEngineProvider: CallMetadataEngine patched into startCall")