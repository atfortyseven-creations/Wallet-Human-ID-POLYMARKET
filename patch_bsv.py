import pathlib
path = pathlib.Path('d:/Projects/Wallet Human Polymarket ID/components/bsv/InstitutionalPortfolioView.tsx')
content = path.read_text(encoding='utf-8')

import_find = 'import { useRealWalletData } from "@/hooks/useRealWalletData";'
import_repl = 'import { useRealWalletData } from "@/hooks/useRealWalletData";\nimport { useSettings } from "@/src/context/SettingsContext";'
content = content.replace(import_find, import_repl)

hook_find = 'const liveEurRate = useLiveEurRate(); // AUDIT FIX: live ECB rate'
hook_repl = 'const liveEurRate = useLiveEurRate(); // AUDIT FIX: live ECB rate\n    const { hideBalances, currency: settingsCurrency, toggleHideBalances } = useSettings();\n    const displayCurrency = settingsCurrency || "USD";'
content = content.replace(hook_find, hook_repl)

old_currency_find = "const displayCurrency = useWalletStore(s => s.displayCurrency || 'EUR');"
content = content.replace(old_currency_find, "")

hero_find = '''                        {((parseFloat(totalBalance) || 0) * rate).toFixed(2).split('.')[0]}
                        <span className="text-2xl md:text-4xl opacity-50 font-serif">.{((parseFloat(totalBalance) || 0) * rate).toFixed(2).split('.')[1] || '00'}</span>'''

hero_repl = '''                        {hideBalances ? "****" : ((parseFloat(totalBalance) || 0) * rate).toFixed(2).split('.')[0]}
                        <span className="text-2xl md:text-4xl opacity-50 font-serif">
                           {hideBalances ? "" : "." + (((parseFloat(totalBalance) || 0) * rate).toFixed(2).split('.')[1] || '00')}
                        </span>'''
content = content.replace(hero_find, hero_repl)

hero2_find = '{balance} {networkInfo.currency} ({symbol}{balanceFiat})'
hero2_repl = '{hideBalances ? "****" : balance} {networkInfo.currency} ({symbol}{hideBalances ? "****" : balanceFiat})'
content = content.replace(hero2_find, hero2_repl)

portfolio_value_find = '<span className="text-[10px] uppercase font-black tracking-[0.3em] text-zinc-900/40 mb-3">Portfolio Value</span>'
portfolio_value_repl = '<span onClick={toggleHideBalances} className="text-[10px] uppercase font-black tracking-[0.3em] text-zinc-900/40 mb-3 cursor-pointer hover:text-zinc-900 transition-colors">Portfolio Value {hideBalances ? "(Hidden)" : ""}</span>'
content = content.replace(portfolio_value_find, portfolio_value_repl)

path.write_text(content, encoding='utf-8')
print("SUCCESS BSV")
