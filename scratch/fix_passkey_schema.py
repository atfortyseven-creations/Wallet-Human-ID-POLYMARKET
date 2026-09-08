import re

file_path = "d:\\Projects\\Wallet Human Polymarket ID\\components\\auth\\PasskeyOnboarding.tsx"

try:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Find the localStorage logic and rewrite it to match useSystemAccount's exact schema
    old_logic = """
        localStorage.setItem("system_session_v2", JSON.stringify({
           address: "0x" + result.publicKey.substring(0, 40), // Derived mock address
           isPasskey: true
        }));
"""
    new_logic = """
        // [AEGIS FLOW FIX] - Match useSystemAccount EXACT schema
        // Must contain .wallet (42 chars starting with 0x) and .exp
        const derivedWallet = "0x" + result.publicKey.replace(/[^a-zA-Z0-9]/g, "").substring(0, 40).padEnd(40, '0');
        localStorage.setItem("system_session_v2", JSON.stringify({
           wallet: derivedWallet,
           exp: Date.now() + 86400000 * 7, // 7 days TTL
           isPasskey: true
        }));
"""
    if old_logic in content:
        content = content.replace(old_logic, new_logic)
    else:
        # Fallback regex if spacing is different
        content = re.sub(
            r"localStorage\.setItem\(\"system_session_v2\", JSON\.stringify\(\{[\s\S]*?\}\)\);",
            new_logic.strip(),
            content
        )

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    print("PasskeyOnboarding schema fixed to match useSystemAccount!")
except Exception as e:
    print(f"Error patching file: {e}")