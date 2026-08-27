import re

with open('components/terminal/LedgerChat.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: isOnboarded initialization
# Find: const [isOnboarded, setIsOnboarded] = useState(false);
# Replace: const [isOnboarded, setIsOnboarded] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('ledger_onboarded_' + effectiveAddress) === 'true' : false);
content = re.sub(
    r'const \[isOnboarded,\s*setIsOnboarded\] = useState\(false\);',
    r"const [isOnboarded, setIsOnboarded] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('ledger_onboarded_' + (effectiveAddress || '0x0')) === 'true' : false);",
    content
)

# Fix 2: PC Centering Bug
# Currently the top level return is something like:
# return (
#    <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden" ...>
# We need to ensure it's centered and constrained on PC so it's not "bugeado y no ajustado".
# Let's add max-w-4xl mx-auto to the outer container. Wait, I'll search for the first return.

matches = list(re.finditer(r'return \(\s*<div[^>]*className=\"([^\"]*)\"', content))
if matches:
    # We want the one inside export function LedgerChat
    # It's probably the last big return or the first return after "export function LedgerChat("
    func_idx = content.find('export function LedgerChat(')
    if func_idx != -1:
        # Find the return ( ... ) after this index that looks like the main container
        # The main container usually checks if (!isOnboarded) return <Setup.../>
        # The final return is the chat UI.
        
        main_return_match = re.search(r'return \(\s*<div\s+className=\"(flex-1 flex flex-col h-full.*?)\"', content[func_idx:])
        if main_return_match:
            old_class = main_return_match.group(1)
            # Add max-w-5xl mx-auto border-x border-black/10 if not present
            if 'max-w-5xl' not in old_class:
                new_class = old_class + " max-w-5xl mx-auto border-x border-black/10"
                content = content[:func_idx + main_return_match.start(1)] + new_class + content[func_idx + main_return_match.end(1):]
                print("Patched layout classes")

with open('components/terminal/LedgerChat.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done patching LedgerChat.tsx")
