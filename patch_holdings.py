import pathlib
path = pathlib.Path('d:/Projects/Wallet Human Polymarket ID/components/portfolio/QuantumHoldingsEngine.tsx')
content = path.read_text(encoding='utf-8')

import_find = 'import { TokenLogo } from "@/components/ui/TokenLogo";'
import_repl = 'import { TokenLogo } from "@/components/ui/TokenLogo";\nimport { useSettings } from "@/src/context/SettingsContext";'
content = content.replace(import_find, import_repl)

hook_find = 'export const QuantumHoldingsEngine = ({'
hook_repl = '''export const QuantumHoldingsEngine = ({
  address,
  activeNetwork,
  scannerBase,
  userAssets,
  displayCurrency,
  rate,
  symbol,
  onSwapRequest,
  onBridgeRequest,
  onQdsTransfer
}: any) => {
  const { uiConfig, hideBalances } = useSettings();
  
  // Deduplicate and apply settings
  const processedAssets = React.useMemo(() => {
     let map = new Map();
     (userAssets || []).forEach((a: any) => {
        if (!map.has(a.symbol)) { map.set(a.symbol, a); }
     });
     let filtered = Array.from(map.values());
     
     if (uiConfig?.hideZeroBalances) {
         filtered = filtered.filter(a => (a.balanceNumeric || a.balance || 0) > 0);
     }
     if (uiConfig?.hideSpamTokens) {
         filtered = filtered.filter(a => !((a.balanceNumeric || a.balance || 0) > 0 && (a.balanceNumeric || a.balance || 0) < 0.0001 && a.symbol !== 'ETH'));
     }
     
     if (uiConfig?.tokenSort === 'value_asc') {
         filtered.sort((a, b) => (a.valueUSD || 0) - (b.valueUSD || 0));
     } else if (uiConfig?.tokenSort === 'alpha') {
         filtered.sort((a, b) => a.symbol.localeCompare(b.symbol));
     } else {
         filtered.sort((a, b) => (b.valueUSD || 0) - (a.valueUSD || 0));
     }
     return filtered;
  }, [userAssets, uiConfig]);
  
  const assetsToMap = processedAssets;
  
  // OVERRIDE userAssets mapping inline below!
'''

# We need to be careful with string replacements, so let's just do targeted replacements.
