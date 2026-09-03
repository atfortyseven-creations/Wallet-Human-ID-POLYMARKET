import pathlib
path = pathlib.Path('d:/Projects/Wallet Human Polymarket ID/components/terminal/PortfolioDashboard.tsx')
content = path.read_text(encoding='utf-8')

# 1. Import SettingsContext
import_find = 'import { AnimatedCounter } from \"@/components/ui/AnimatedCounter\";'
import_repl = 'import { AnimatedCounter } from \"@/components/ui/AnimatedCounter\";\nimport { useSettings } from \"@/src/context/SettingsContext\";'
content = content.replace(import_find, import_repl)

# 2. Add useSettings inside component
hook_find = 'const totalValue = parseFloat(totalValueStr || \"0\");'
hook_repl = 'const totalValue = parseFloat(totalValueStr || \"0\");\n    const { hideBalances, formatAmount, toggleHideBalances, uiConfig } = useSettings();'
content = content.replace(hook_find, hook_repl)

# 3. Replace isEyesOff with hideBalances
content = content.replace('const [isEyesOff, setIsEyesOff] = useState(false);', '')
content = content.replace('onClick={() => setIsEyesOff(!isEyesOff)}', 'onClick={toggleHideBalances}')
content = content.replace('isEyesOff', 'hideBalances')

# 4. Use formatAmount instead of hardcoded $
fiat_find = '${safeToLocaleString(asset.valueUSD || 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}'
fiat_repl = 'formatAmount(asset.valueUSD || 0)'
content = content.replace(fiat_find, fiat_repl)

# 5. Fix uniqueAssets applying settings:
assets_find = '''    // Deduplicate holdings
    const uniqueAssets = React.useMemo(() => {
        const map = new Map();
        assets.forEach(a => {
            if (!map.has(a.symbol)) {
                map.set(a.symbol, a);
            }
        });
        return Array.from(map.values());
    }, [assets]);'''
    
assets_repl = '''    // Deduplicate holdings and apply settings
    const uniqueAssets = React.useMemo(() => {
        const map = new Map();
        assets.forEach(a => {
            if (!map.has(a.symbol)) {
                map.set(a.symbol, a);
            }
        });
        
        let filtered = Array.from(map.values());
        
        if (uiConfig?.hideZeroBalances) {
            filtered = filtered.filter(a => (a.balanceNumeric || a.balance || 0) > 0);
        }
        
        if (uiConfig?.tokenSort === 'value_asc') {
            filtered.sort((a, b) => (a.valueUSD || 0) - (b.valueUSD || 0));
        } else if (uiConfig?.tokenSort === 'alpha') {
            filtered.sort((a, b) => a.symbol.localeCompare(b.symbol));
        } else {
            filtered.sort((a, b) => (b.valueUSD || 0) - (a.valueUSD || 0));
        }
        
        return filtered;
    }, [assets, uiConfig?.hideZeroBalances, uiConfig?.tokenSort]);'''

content = content.replace(assets_find, assets_repl)

# 6. Apply showTokenLogos
logo_find = '<TokenLogo symbol={asset.symbol} name={asset.name} address={asset.address} logoURI={asset.logoURI} className="w-full h-full object-cover" fallbackClassName="w-full h-full flex items-center justify-center text-[10px]" />'
logo_repl = '{uiConfig?.showTokenLogos !== false ? <TokenLogo symbol={asset.symbol} name={asset.name} address={asset.address} logoURI={asset.logoURI} className="w-full h-full object-cover" fallbackClassName="w-full h-full flex items-center justify-center text-[10px]" /> : <span className="font-mono text-xs">{asset.symbol.slice(0, 1)}</span>}'
content = content.replace(logo_find, logo_repl)

path.write_text(content, encoding='utf-8')
print('SUCCESS DASH')
