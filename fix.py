import sys

with open("components/landing/ConnectPage.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Fix the SIWE nonce logic
old_nonce_logic = """        const nonce = `HL-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const msg = `Sign in to Humanity Ledger\n\nAddress: ${address}\nNonce: ${nonce}\nChain: Ethereum`;"""

new_nonce_logic = """        const nonceRes = await fetch("/api/auth/nonce", { cache: "no-store" });
        if (!nonceRes.ok) throw new Error("Failed to fetch cryptographic nonce");
        const { nonce } = await nonceRes.json();
        const msg = `Sign in to Humanity Ledger\n\nAddress: ${address}\nNonce: ${nonce}\nChain: Ethereum`;"""

if old_nonce_logic in content:
    content = content.replace(old_nonce_logic, new_nonce_logic)
    print("Nonce logic replaced.")
else:
    print("Could not find old nonce logic!")

# 2. Add the video background to the left panel
old_left_panel = """        {/* LEFT: Branding */}
        <div className="hidden lg:flex flex-col justify-between bg-black text-white p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "linear-gradient(to right,white 1px,transparent 1px),linear-gradient(to bottom,white 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
          <div className="relative z-10">"""

new_left_panel = """        {/* LEFT: Branding */}
        <div className="hidden lg:flex flex-col justify-between bg-black text-white p-12 relative overflow-hidden">
          {/* HIGH-QUALITY VIDEO BACKGROUND */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0"
            src="/system-shots/72298-541981714.mp4"
          />
          {/* OVERLAY TO ENSURE MAX TEXT VISIBILITY */}
          <div className="absolute inset-0 bg-black/60 z-[1] backdrop-blur-[2px]" />
          
          <div className="absolute inset-0 opacity-[0.04] z-[2]"
            style={{ backgroundImage: "linear-gradient(to right,white 1px,transparent 1px),linear-gradient(to bottom,white 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
          
          <div className="relative z-20">"""

if old_left_panel in content:
    content = content.replace(old_left_panel, new_left_panel)
    print("Left panel replaced.")
else:
    print("Could not find old left panel logic!")

# Adjust other z-indexes
content = content.replace('className="relative z-10 flex flex-col gap-6"', 'className="relative z-20 flex flex-col gap-6"')
content = content.replace('className="relative z-10 flex items-center gap-2"', 'className="relative z-20 flex items-center gap-2"')

with open("components/landing/ConnectPage.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Done")