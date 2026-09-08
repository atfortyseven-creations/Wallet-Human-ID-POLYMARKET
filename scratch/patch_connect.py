import re
import sys

file_path = "d:\\Projects\\Wallet Human Polymarket ID\\components\\landing\\ConnectPage.tsx"

try:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Inject import
    if "PasskeyOnboarding" not in content:
        import_stmt = "\nimport { PasskeyOnboarding } from '@/components/auth/PasskeyOnboarding';\n"
        content = re.sub(r"(import React.*?;\n)", r"\1" + import_stmt, content, count=1)

    # 2. Add FaceID to the UI (find the Wallet button and add Passkey below it)
    btn_pattern = r"(<button[^>]*onClick=\{[^}]*open\(\)[^}]*\}[^>]*>.*?<\/button>)"
    
    passkey_ui = """
      <div className="w-full mt-4">
         <PasskeyOnboarding />
      </div>
    """
    
    content = re.sub(btn_pattern, r"\1\n" + passkey_ui, content, count=1)

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    print("ConnectPage patched with Passkey Onboarding!")
except Exception as e:
    print(f"Error patching file: {e}")