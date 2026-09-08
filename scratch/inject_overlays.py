file_path = "d:\\Projects\\Wallet Human Polymarket ID\\components\\terminal\\LedgerChat.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Inject IncomingCallOverlay and SyndicateModal imports after the first import block
import_injection = "\nimport { IncomingCallOverlay } from '@/components/chat/IncomingCallOverlay';\nimport { SyndicateModal } from '@/components/chat/SyndicateModal';\n"
if "IncomingCallOverlay" not in content:
    content = content.replace(
        "import { LedgerChatOnboarding }",
        import_injection + "import { LedgerChatOnboarding }"
    )

# 2. Inject useState for SyndicateModal visibility
if "showSyndicateModal" not in content:
    content = content.replace(
        "const [reactionMenu, setReactionMenu]",
        "const [showSyndicateModal, setShowSyndicateModal] = useState(false);\n  const [showSyndicateModal2, _] = useState(false); // alias\n  const [reactionMenu, setReactionMenu]"
    )

# 3. Inject IncomingCallOverlay and SyndicateModal into the JSX (before closing TuringShieldGate)
if "<IncomingCallOverlay" not in content:
    content = content.replace(
        "</TuringShieldGate>",
        "<IncomingCallOverlay />\n      <SyndicateModal isOpen={showSyndicateModal} onClose={() => setShowSyndicateModal(false)} client={client} onGroupCreated={() => setShowSyndicateModal(false)} />\n    </TuringShieldGate>"
    )

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("LedgerChat.tsx: IncomingCallOverlay + SyndicateModal injected")