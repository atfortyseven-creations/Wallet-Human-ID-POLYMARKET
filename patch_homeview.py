import pathlib

path = pathlib.Path('d:/Projects/Wallet Human Polymarket ID/components/bsv/InstitutionalPortfolioView.tsx')
content = path.read_text(encoding='utf-8')

# We'll just add const { hideBalances, toggleHideBalances } = useSettings(); inside HomeView
old_homeview = '''function HomeView({ address, balance, balanceFiat, totalBalance, activeNetwork, loading, onRefresh, onSend, onReceive, onScan, onCreate, onBuy, onSwap, onBridge, onNetworkClick, onSettingsClick, onAccountsClick, scannerBase, onShield, onSecurity, onSmartAccount, onDeploy, onOmnichain, onMempool, onQds, assets, displayCurrency, setDisplayCurrency, rate, symbol, isEmailAuth }: any) {
    const [copied, setCopied] = useState(false);'''

new_homeview = '''function HomeView({ address, balance, balanceFiat, totalBalance, activeNetwork, loading, onRefresh, onSend, onReceive, onScan, onCreate, onBuy, onSwap, onBridge, onNetworkClick, onSettingsClick, onAccountsClick, scannerBase, onShield, onSecurity, onSmartAccount, onDeploy, onOmnichain, onMempool, onQds, assets, displayCurrency, setDisplayCurrency, rate, symbol, isEmailAuth }: any) {
    const { hideBalances, toggleHideBalances } = useSettings();
    const [copied, setCopied] = useState(false);'''

content = content.replace(old_homeview, new_homeview)
path.write_text(content, encoding='utf-8')
print("Patched HomeView")
