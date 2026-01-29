'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Copy, X, Send, QrCode } from 'lucide-react';
import { useAccount, useBalance, useReadContracts } from 'wagmi';
import { formatEther, formatUnits, erc20Abi } from 'viem';
import { useTokenPrice } from '@/hooks/useTokenPrice';
import { getUsdcAddress, WLD_TOKEN_ADDRESS } from '@/config/tokens';
import { toast } from 'sonner';

export function TokenPortfolio() {
    const { address, chainId } = useAccount();
    const [selectedToken, setSelectedToken] = useState<any>(null);
    const [view, setView] = useState<'details' | 'send' | 'receive'>('details');

    // --- PRICES ---
    const { prices, changes, isLoading: isPricesLoading } = useTokenPrice();

    // --- BALANCES ---
    // 1. Native ETH
    const { data: ethBalance } = useBalance({ address });

    // 2. ERC20s (USDC, WLD)
    const usdcAddress = chainId ? getUsdcAddress(chainId) : undefined;

    const { data: tokenBalances } = useReadContracts({
        contracts: [
            {
                address: usdcAddress,
                abi: erc20Abi,
                functionName: 'balanceOf',
                args: [address as `0x${string}`],
            },
            {
                address: WLD_TOKEN_ADDRESS,
                abi: erc20Abi,
                functionName: 'balanceOf',
                args: [address as `0x${string}`],
            }
        ],
        query: {
            enabled: !!address,
            refetchInterval: 10000
        }
    });

    // --- DATA TRANSFORMATION ---
    const assets = useMemo(() => {
        if (!address) return [];

        const ethVal = ethBalance ? parseFloat(ethBalance.formatted) : 0;
        const usdcVal = tokenBalances?.[0]?.result ? parseFloat(formatUnits(tokenBalances[0].result as bigint, 6)) : 0; // USDC usually 6 decimals
        const wldVal = tokenBalances?.[1]?.result ? parseFloat(formatEther(tokenBalances[1].result as bigint)) : 0; // WLD 18 decimals

        return [
            {
                id: 'eth',
                symbol: 'ETH',
                name: 'Ethereum',
                balance: ethVal,
                price: prices.ETH || 0,
                change: changes.ETH || 0,
                icon: '🔹',
                network: 'Base Sepolia',
                decimals: 18
            },
            {
                id: 'usdc',
                symbol: 'USDC',
                name: 'USD Coin',
                balance: usdcVal,
                price: prices.USDC || 1, // Stablecoin fallback
                change: changes.USDC || 0,
                icon: '💲',
                network: 'Base Sepolia',
                decimals: 6
            },
            {
                id: 'wld',
                symbol: 'WLD',
                name: 'Worldcoin',
                balance: wldVal,
                price: prices.WLD || 0,
                change: changes.WLD || 0,
                icon: '🌍',
                network: 'Optimism / Base',
                decimals: 18
            }
        ];
    }, [ethBalance, tokenBalances, prices, changes, address]);

    // Helpers
    const openToken = (token: any) => { setSelectedToken(token); setView('details'); };
    const closeToken = () => setSelectedToken(null);
    const formatUSD = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    const formatChange = (val: number) => {
        const sign = val >= 0 ? '+' : '';
        return `${sign}${val.toFixed(2)}%`;
    };

    if (!address) return null; // Or return generic skeleton

    return (
        <>
            {/* --- LISTA DE TOKENS (GLASSMORPHISM) --- */}
            <div className="w-full mt-4 bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md">
                <div className="p-4 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-400 tracking-wider">PORTFOLIO ASSETS</h3>
                    <span className="text-xs bg-[#00f2ea]/10 text-[#00f2ea] px-2 py-1 rounded border border-[#00f2ea]/20">
                        {assets.length} TOKENS
                    </span>
                </div>

                <div className="divide-y divide-white/5">
                    {assets.map((token) => (
                        <motion.div
                            key={token.id}
                            onClick={() => openToken(token)}
                            whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                            className="p-4 flex items-center justify-between cursor-pointer group transition-all"
                        >
                            {/* Izquierda: Icono + Nombre */}
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xl shadow-inner border border-white/5 group-hover:border-[#00f2ea]/30 transition-colors">
                                    {token.icon}
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm">{token.name}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 font-mono">{token.balance.toFixed(4)} {token.symbol}</span>
                                        <span className="text-[10px] text-gray-600 bg-white/5 px-1 rounded">{token.network}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Derecha: Valor + Cambio */}
                            <div className="text-right">
                                <p className="text-white font-mono font-medium">{formatUSD(token.balance * token.price)}</p>
                                <p className={`text-xs ${token.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {formatChange(token.change)}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* --- MODAL DETALLE / ENVIAR / RECIBIR --- */}
            <AnimatePresence>
                {selectedToken && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={closeToken}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-[#0D0D12] border border-white/10 rounded-3xl p-6 shadow-2xl z-[51] overflow-hidden"
                        >
                            {/* Header del Modal */}
                            <div className="flex justify-between items-center mb-6">
                                <button onClick={() => view === 'details' ? closeToken() : setView('details')} className="text-gray-400 hover:text-white">
                                    {view === 'details' ? <X size={20} /> : <span className="text-xs">← Back</span>}
                                </button>
                                <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">{view} {selectedToken.symbol}</span>
                                <div className="w-5" /> {/* Spacer */}
                            </div>

                            {/* VISTA 1: DETALLES PRINCIPALES */}
                            {view === 'details' && (
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-white/5 to-white/0 border border-white/10 flex items-center justify-center text-4xl mb-4 shadow-[0_0_30px_rgba(0,242,234,0.1)]">
                                        {selectedToken.icon}
                                    </div>
                                    <h2 className="text-3xl font-bold text-white mb-1">{selectedToken.balance.toFixed(4)} <span className="text-lg text-gray-500">{selectedToken.symbol}</span></h2>
                                    <p className="text-gray-400 font-mono mb-8">≈ {formatUSD(selectedToken.balance * selectedToken.price)}</p>

                                    {/* Botones de Acción */}
                                    <div className="grid grid-cols-2 gap-4 w-full">
                                        <button
                                            onClick={() => setView('send')}
                                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
                                        >
                                            <div className="p-2 rounded-full bg-[#00f2ea]/10 text-[#00f2ea] group-hover:scale-110 transition-transform">
                                                <ArrowUpRight size={20} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-300">Enviar</span>
                                        </button>

                                        <button
                                            onClick={() => setView('receive')}
                                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
                                        >
                                            <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                                                <ArrowDownLeft size={20} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-300">Recibir</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* VISTA 2: ENVIAR */}
                            {view === 'send' && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-500 ml-1">Dirección de Destino</label>
                                        <div className="relative">
                                            <input type="text" placeholder="0x..." className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#00f2ea] outline-none font-mono" />
                                            <QrCode size={16} className="absolute right-3 top-3.5 text-gray-500 cursor-pointer hover:text-white" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-500 ml-1">Monto</label>
                                        <div className="relative">
                                            <input type="number" placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#00f2ea] outline-none font-mono" />
                                            <button className="absolute right-3 top-3 text-[10px] bg-[#00f2ea]/20 text-[#00f2ea] px-2 py-1 rounded hover:bg-[#00f2ea]/30">MAX</button>
                                        </div>
                                    </div>
                                    <button className="w-full mt-4 py-3 bg-[#00f2ea] hover:bg-[#00f2ea]/90 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                                        <Send size={16} /> Confirmar Envío
                                    </button>
                                </div>
                            )}

                            {/* VISTA 3: RECIBIR */}
                            {view === 'receive' && (
                                <div className="flex flex-col items-center text-center space-y-6">
                                    <div className="p-4 bg-white rounded-xl">
                                        {/* QR GENERATOR (Real QR logic should go here) */}
                                        <div className="w-40 h-40 bg-gray-900 flex items-center justify-center">
                                            <QrCode size={64} className="text-white opacity-50" />
                                        </div>
                                    </div>
                                    <div className="space-y-2 w-full">
                                        <p className="text-xs text-gray-500">Tu dirección {selectedToken.network}</p>
                                        <div
                                            className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3 cursor-pointer hover:bg-white/10 active:scale-95 transition-all"
                                            onClick={() => {
                                                if (address) {
                                                    navigator.clipboard.writeText(address);
                                                    toast.success("Address copied");
                                                }
                                            }}
                                        >
                                            <code className="text-xs text-[#00f2ea] font-mono truncate mr-2">{address ? `${address.substring(0, 8)}...${address.substring(address.length - 8)}` : '...'}</code>
                                            <Copy size={14} className="text-gray-400" />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-500 max-w-[200px]">
                                        Envía solo {selectedToken.name} ({selectedToken.network}) a esta dirección.
                                    </p>
                                </div>
                            )}

                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
