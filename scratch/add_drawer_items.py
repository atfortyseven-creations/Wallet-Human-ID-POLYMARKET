import re

file_path = "d:\\Projects\\Wallet Human Polymarket ID\\components\\terminal\\LedgerChat.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add new icons to the lucide-react import
import_regex = r"import \{ MoreVertical,[^}]+\} from 'lucide-react';"
if "BrainCircuit" not in content:
    content = content.replace("PieChart, Bell }", "PieChart, Bell, BrainCircuit, Droplet, ShieldCheck, ArrowRightLeft, Radio, LayoutGrid }")

old_drawer_items = """                          { id: 'secret', icon: <Lock size={18} />, label: isSecretChat ? 'Exit Secret Mode' : 'Secret Mode', color: 'text-white', bg: isSecretChat ? 'bg-[#FF3B30]' : 'bg-[#30D158]', onClick: () => { setIsSecretChat((s: any) => !s); setShowAppDrawer(false); } },"""

# The above string might not match perfectly if there's type difference. Let's do a regex replace on the App Drawer array.
# Find the exact array definition
drawer_match = re.search(r"(\{\s*id:\s*'secret'.*?\}),", content, re.DOTALL)
if drawer_match:
    new_items = """{ id: 'ai', icon: <BrainCircuit size={18} />, label: 'Aegis AI Core', color: 'text-white', bg: 'bg-[#FF2D55]', onClick: () => { executeSendRef.current?.('[AEGIS_AI] Analyze sentiment and facts'); setShowAppDrawer(false); toast.success('Aegis AI Agent invoked'); } },
                          { id: 'superfluid', icon: <Droplet size={18} />, label: 'Superfluid Stream', color: 'text-white', bg: 'bg-[#32ADE6]', onClick: () => { executeSendRef.current?.('[SUPERFLUID] Stream 100 USDC/month'); setShowAppDrawer(false); toast.success('Superfluid Stream Initialized'); } },
                          { id: 'escrow', icon: <ShieldCheck size={18} />, label: 'HTLC Escrow', color: 'text-white', bg: 'bg-[#FF9500]', onClick: () => { executeSendRef.current?.('[HTLC_ESCROW] Lock funds in smart contract'); setShowAppDrawer(false); toast.success('HTLC Escrow contract deployed'); } },
                          { id: 'crosschain', icon: <ArrowRightLeft size={18} />, label: 'Cross-Chain', color: 'text-white', bg: 'bg-[#AF52DE]', onClick: () => { executeSendRef.current?.('[CROSS_CHAIN] Bridge asset via CCIP'); setShowAppDrawer(false); toast.success('Cross-Chain Intent signed'); } },
                          { id: 'livepeer', icon: <Radio size={18} />, label: 'Live Broadcast', color: 'text-white', bg: 'bg-[#FF3B30]', onClick: () => { executeSendRef.current?.('[LIVEPEER] Start decentralized broadcast'); setShowAppDrawer(false); toast.success('Livepeer RTMP Node starting'); } },
                          { id: 'miniapp', icon: <LayoutGrid size={18} />, label: 'Mini App', color: 'text-white', bg: 'bg-[#5856D6]', onClick: () => { executeSendRef.current?.('[MINI_APP] Launch syndicate game'); setShowAppDrawer(false); toast.success('Mini-App execution loaded'); } },"""
    content = content[:drawer_match.end()] + "\n                          " + new_items + content[drawer_match.end():]
else:
    print("Could not find secret button to inject after")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("LedgerChat: Engine buttons added to App Drawer")