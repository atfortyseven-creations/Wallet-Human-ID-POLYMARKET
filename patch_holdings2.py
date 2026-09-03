import pathlib
path = pathlib.Path('d:/Projects/Wallet Human Polymarket ID/components/portfolio/QuantumHoldingsEngine.tsx')
content = path.read_text(encoding='utf-8')

# Import settings
import_find = 'import { TokenLogo } from "@/components/ui/TokenLogo";'
import_repl = 'import { TokenLogo } from "@/components/ui/TokenLogo";\nimport { useSettings } from "@/src/context/SettingsContext";'
content = content.replace(import_find, import_repl)

# Hook inject
hook_find = 'const [currentPage, setCurrentPage] = useState(1);'
hook_repl = 'const [currentPage, setCurrentPage] = useState(1);\n    const { hideBalances, uiConfig, formatAmount, currency } = useSettings();'
content = content.replace(hook_find, hook_repl)

# Update Combined Assets to respect sort & filtering
combined_find = 'return combined.sort((a, b) => {'
combined_repl = '''
        if (uiConfig?.hideZeroBalances) {
            combined = combined.filter((a: any) => a.balance > 0);
        }
        if (uiConfig?.hideSpamTokens) {
            combined = combined.filter((a: any) => !(a.balance > 0 && a.balance < 0.0001 && a.symbol !== 'ETH'));
        }
        
        return combined.sort((a, b) => {
            if (uiConfig?.tokenSort === 'value_asc') {
                return (a.value || 0) - (b.value || 0);
            } else if (uiConfig?.tokenSort === 'alpha') {
                return a.symbol.localeCompare(b.symbol);
            }
'''
content = content.replace(combined_find, combined_repl)

# Mask token balance list
content = content.replace('{token.balance > 0 ? Number(token.balance).toFixed(6) : "0.00"}', '{hideBalances ? "****" : (token.balance > 0 ? Number(token.balance).toFixed(6) : "0.00")}')

# Mask token value list
content = content.replace('{symbol}{safeToFixed(token.value, 2)}', '{hideBalances ? "****" : formatAmount(token.value)}')

# Mask detail pane balance
content = content.replace('{token.balance > 0 ? Number(token.balance).toFixed(4) : "0.00"}', '{hideBalances ? "****" : (token.balance > 0 ? Number(token.balance).toFixed(4) : "0.00")}')

# Mask detail pane value
content = content.replace(' USD', '{hideBalances ? "****" : formatAmount(token.value)}')

# Token Logos
logo_find = '<TokenLogo symbol={token.symbol} address={token.address} className="w-6 h-6 object-cover" fallbackClassName="w-6 h-6 flex items-center justify-center text-[8px]" />'
logo_repl = '{uiConfig?.showTokenLogos !== false ? <TokenLogo symbol={token.symbol} address={token.address} className="w-6 h-6 object-cover" fallbackClassName="w-6 h-6 flex items-center justify-center text-[8px]" /> : <div className="w-6 h-6 bg-black/5 rounded-full flex items-center justify-center text-[8px] font-black text-black/50">{token.symbol.charAt(0)}</div>}'
content = content.replace(logo_find, logo_repl)

logo2_find = '<TokenLogo symbol={token.symbol} address={token.address} className="w-12 h-12 object-cover" fallbackClassName="w-12 h-12 flex items-center justify-center text-[10px]" />'
logo2_repl = '{uiConfig?.showTokenLogos !== false ? <TokenLogo symbol={token.symbol} address={token.address} className="w-12 h-12 object-cover" fallbackClassName="w-12 h-12 flex items-center justify-center text-[10px]" /> : <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center text-[12px] font-black text-black/50">{token.symbol.charAt(0)}</div>}'
content = content.replace(logo2_find, logo2_repl)

path.write_text(content, encoding='utf-8')
print("SUCCESS QUANTUM")
