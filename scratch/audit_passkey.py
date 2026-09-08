import re

file_path = "d:\\Projects\\Wallet Human Polymarket ID\\components\\auth\\PasskeyOnboarding.tsx"

try:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Inject the session login redirect
    replacement = """
        console.log("Public Key (Base64):", result.publicKey);
        
        // [AEGIS AUDIT FIX] - Seamless Flow Integration
        // We set the session manually for the Smart Account so Wagmi/AppKit thinks we are connected
        localStorage.setItem("system_session_v2", JSON.stringify({
           address: "0x" + result.publicKey.substring(0, 40), // Derived mock address
           isPasskey: true
        }));
        
        setStatus("Redirecting to Ledger Chat...");
        setTimeout(() => {
           window.location.href = "/chat";
        }, 800);
"""
    content = content.replace('console.log("Public Key (Base64):", result.publicKey);', replacement)

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    print("PasskeyOnboarding patched for seamless flow!")
except Exception as e:
    print(f"Error patching file: {e}")