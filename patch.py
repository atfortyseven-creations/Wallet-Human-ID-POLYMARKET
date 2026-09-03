import pathlib
path = pathlib.Path('d:/Projects/Wallet Human Polymarket ID/components/terminal/TokenPortfolio.tsx')
content = path.read_text(encoding='utf-8')

content = content.replace(
    'const { strictMode, contacts } = useSettings();',
    'const { strictMode, contacts, uiConfig, hideBalances, formatAmount, currency } = useSettings();'
)

data_find = '''    // --- DATA TRANSFORMATION ---
    const assets = useMemo(() => {
        if (!address) return [];
        const ethVal = ethBalance ? parseFloat(ethBalance.formatted) : 0;
        const usdcVal = tokenBalances?.[0]?.result ? parseFloat(formatUnits(tokenBalances[0].result as bigint, 6)) : 0;
        const wldVal = tokenBalances?.[1]?.result ? parseFloat(formatEther(tokenBalances[1].result as bigint)) : 0;

        return [
            { id: 'eth', symbol: 'ETH', name: 'Ethereum', balance: ethVal, price: prices.ETH || 0, change: changes.ETH || 0, icon: '', network: 'Base Sepolia', decimals: 18, isNative: true },
            { id: 'usdc', symbol: 'USDC', name: 'USD Coin', balance: usdcVal, price: prices.USDC || 1, change: changes.USDC || 0, icon: '', network: 'Base Sepolia', decimals: 6, address: usdcAddress },
            { id: 'wld', symbol: 'AUTH', name: 'Identity', balance: wldVal, price: prices.AUTH || 0, change: changes.AUTH || 0, icon: '', network: 'Optimism / Base', decimals: 18, address: AUTH_TOKEN_ADDRESS }
        ];
    }, [ethBalance, tokenBalances, prices, changes, address, usdcAddress]);'''

data_repl = '''    // --- DATA TRANSFORMATION & SETTINGS APPLIED ---
    const assets = useMemo(() => {
        if (!address) return [];
        const ethVal = ethBalance ? parseFloat(ethBalance.formatted) : 0;
        const usdcVal = tokenBalances?.[0]?.result ? parseFloat(formatUnits(tokenBalances[0].result as bigint, 6)) : 0;
        const wldVal = tokenBalances?.[1]?.result ? parseFloat(formatEther(tokenBalances[1].result as bigint)) : 0;

        let rawAssets = [
            { id: 'eth', symbol: 'ETH', name: 'Ethereum', balance: ethVal, price: prices.ETH || 0, change: changes.ETH || 0, icon: '', network: 'Base Sepolia', decimals: 18, isNative: true },
            { id: 'usdc', symbol: 'USDC', name: 'USD Coin', balance: usdcVal, price: prices.USDC || 1, change: changes.USDC || 0, icon: '', network: 'Base Sepolia', decimals: 6, address: usdcAddress },
            { id: 'wld', symbol: 'AUTH', name: 'Identity', balance: wldVal, price: prices.AUTH || 0, change: changes.AUTH || 0, icon: '', network: 'Optimism / Base', decimals: 18, address: AUTH_TOKEN_ADDRESS }
        ];

        if (uiConfig?.hideZeroBalances) {
            rawAssets = rawAssets.filter(a => a.balance > 0);
        }

        if (uiConfig?.hideSpamTokens) {
            rawAssets = rawAssets.filter(a => !(a.balance > 0 && a.balance < 0.0001 && a.symbol !== 'ETH'));
        }

        if (uiConfig?.tokenSort === 'value_asc') {
            rawAssets.sort((a, b) => (a.balance * a.price) - (b.balance * b.price));
        } else if (uiConfig?.tokenSort === 'alpha') {
            rawAssets.sort((a, b) => a.symbol.localeCompare(b.symbol));
        } else {
            rawAssets.sort((a, b) => (b.balance * b.price) - (a.balance * a.price));
        }

        return rawAssets;
    }, [ethBalance, tokenBalances, prices, changes, address, usdcAddress, uiConfig]);'''

content = content.replace(data_find, data_repl)

format_find = '''const formatUSD = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);'''
format_repl = '''const formatUSD = (val: number) => formatAmount(val); // Wires dynamically to fiat settings & hideBalances'''
content = content.replace(format_find, format_repl)

content = content.replace('{safeToFixed(token.balance, 4)}</span>', '{hideBalances ? "****" : safeToFixed(token.balance, 4)}</span>')
content = content.replace('{safeToFixed(selectedToken.balance, 4)} <span', '{hideBalances ? "****" : safeToFixed(selectedToken.balance, 4)} <span')

avatar_find = '<TokenLogo symbol={token.symbol} address={token.address} className="w-full h-full rounded-full" fallbackClassName="w-full h-full rounded-full text-[10px]" />'
avatar_repl = '{uiConfig?.showTokenLogos !== false ? <TokenLogo symbol={token.symbol} address={token.address} className="w-full h-full rounded-full" fallbackClassName="w-full h-full rounded-full text-[10px]" /> : <div className="w-full h-full rounded-full bg-white/10" />}'
content = content.replace(avatar_find, avatar_repl)

selected_logo_find = '<TokenLogo symbol={selectedToken.symbol} address={selectedToken.address} className="w-full h-full rounded-full" fallbackClassName="w-full h-full rounded-full text-[14px]" />'
selected_logo_repl = '{uiConfig?.showTokenLogos !== false ? <TokenLogo symbol={selectedToken.symbol} address={selectedToken.address} className="w-full h-full rounded-full" fallbackClassName="w-full h-full rounded-full text-[14px]" /> : <div className="w-full h-full rounded-full bg-white/10" />}'
content = content.replace(selected_logo_find, selected_logo_repl)

path.write_text(content, encoding='utf-8')
print('SUCCESS')
