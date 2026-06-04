import { useState, useEffect, useMemo, useRef } from "react";
import { Search, ChevronDown, Check, Loader2, Shield } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useBalance } from "wagmi";
import { TokenLogo } from '@/components/ui/TokenLogo';

interface Token {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
    logoURI?: string;
    balance?: string;
    balanceFormatted?: string;
    valueUSD?: number;
    chainId?: number;
}

interface TokenSelectorProps {
    chainId: number;
    address?: string;
    selectedToken?: Token | null;
    onSelect: (token: Token) => void;
    includeNative?: boolean;
    className?: string;
}

export function TokenSelector({ 
    chainId, 
    address, 
    selectedToken, 
    onSelect, 
    includeNative = true,
    className = ""
}: TokenSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [tokens, setTokens] = useState<Token[]>([]);
    const [isLoadingTokens, setIsLoadingTokens] = useState(false);
    const [searchResults, setSearchResults] = useState<Token[]>([]);
    const [institutionalTokens, setInstitutionalTokens] = useState<Token[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch Institutional Tokens
    useEffect(() => {
        const fetchInstitutional = async () => {
            try {
                // We'll call a dedicated endpoint or the lib directly if in Server Component,
                // but since this is client-side, we can use the same tokens API with a flag
                const res = await fetch(`/api/wallet/tokens/institutional?chainId=${chainId}`);
                if (res.ok) {
                    const data = await res.json();
                    setInstitutionalTokens(data.tokens || []);
                }
            } catch (e) {
                console.error("Failed to fetch institutional tokens:", e);
            }
        };
        fetchInstitutional();
    }, [chainId]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Native Balance
    const { data: nativeBalance } = useBalance({ address: address as `0x${string}` });

    // Available Assets (Native + Owned)
    const availableAssets = useMemo(() => {
        const assets: Token[] = [];
        
        if (includeNative) {
            assets.push({
                symbol: chainId === 137 ? 'POL' : 'ETH', 
                name: chainId === 137 ? 'Polygon ecosystem token' : 'Ethereum',
                address: 'native',
                decimals: 18,
                balanceFormatted: nativeBalance?.formatted || '0.00',
                logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880' // Common ETH logo
            });
        }

        const discovered = tokens.map(t => ({
            ...t,
            logoURI: t.logoURI
        }));

        return [...assets, ...discovered];
    }, [chainId, tokens, nativeBalance, includeNative]);

    // Fetch owned tokens
    useEffect(() => {
        if (!address) return;

        const fetchOwnedTokens = async () => {
            setIsLoadingTokens(true);
            try {
                const res = await fetch(`/api/wallet/tokens?address=${address}&chainId=${chainId}`);
                if (res.ok) {
                    const data = await res.json();
                    setTokens(data.tokens || []);
                }
            } catch (e) {
                console.error("Failed to fetch owned tokens:", e);
            } finally {
                setIsLoadingTokens(false);
            }
        };

        // Only fetch if open to save resources
        if (isOpen) {
            fetchOwnedTokens();
        }
    }, [address, chainId, isOpen]);

    // Search Logic
    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        const throttleSearch = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`/api/wallet/tokens?address=${address}&chainId=${chainId}&query=${searchQuery}`);
                if (res.ok) {
                    const data = await res.json();
                    const filtered = (data.tokens || []).filter((t: any) => 
                        !availableAssets.some(a => a.address.toLowerCase() === t.address.toLowerCase())
                    );
                    setSearchResults(filtered);
                }
            } catch (e) {
                console.error("Search failed:", e);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(throttleSearch);
    }, [searchQuery, chainId, address, availableAssets]);

    // Reset search on close
    useEffect(() => {
        if (!isOpen) {
            setSearchQuery("");
            setSearchResults([]);
        }
    }, [isOpen]);

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="bg-black/5 border border-black/10 rounded-xl px-4 py-2 flex items-center gap-3 cursor-pointer hover:bg-black/10 transition-all select-none min-w-[120px] justify-between"
            >
                <div className="flex items-center gap-2">
                    <TokenLogo 
                        symbol={selectedToken?.symbol || ''} 
                        address={selectedToken?.address} 
                        logoURI={selectedToken?.logoURI} 
                        className="w-5 h-5 rounded-full" 
                        fallbackClassName="w-5 h-5 rounded-full text-[8px]"
                    />
                    <span className="font-black tracking-tight text-[#050505]">{selectedToken?.symbol || 'Select'}</span>
                </div>
                <ChevronDown size={14} className={`text-black/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute left-0 mt-2 w-[320px] bg-white border border-black/10 rounded-2xl shadow-xl overflow-hidden z-[110] p-1 max-h-[400px] flex flex-col origin-top-left text-[#050505]"
                        style={{ top: '100%' }}
                    >
                        {/* Search Bar */}
                        <div className="p-2 border-b border-black/5 mb-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/30" />
                                <input 
                                    autoFocus
                                    placeholder="Search name or paste address..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#FFFFFF] border border-black/5 rounded-lg py-2 pl-9 pr-3 text-xs text-[#050505] outline-none focus:border-black/30 transition-all font-medium placeholder:text-black/30"
                                />
                            </div>
                        </div>

                        <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-black/10 flex-1 min-h-[200px]">
                            {/* Section: Institutional Assets (Expert Curated) */}
                            {!searchQuery && (
                                <>
                                    <div className="px-3 py-1 text-[10px] font-black text-[#050505] uppercase tracking-[0.2em] sticky top-0 bg-white z-10 flex items-center gap-2">
                                        <Shield size={10} className="text-[#050505]" /> Institutional Assets
                                    </div>
                                    <div className="grid grid-cols-2 gap-1 p-2">
                                        {/* This will be populated by a new useEffect or passed via props */}
                                        {institutionalTokens.map((asset, idx) => (
                                            <button
                                                key={`inst-${idx}`}
                                                onClick={() => {
                                                    onSelect(asset);
                                                    setIsOpen(false);
                                                }}
                                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/[0.02] hover:bg-black/[0.05] transition-all border border-black/5 hover:border-black/10 group"
                                            >
                                                <TokenLogo 
                                                    symbol={asset.symbol} 
                                                    address={asset.address} 
                                                    logoURI={asset.logoURI} 
                                                    className="w-4 h-4 rounded-full" 
                                                    fallbackClassName="w-4 h-4 rounded-full text-[8px]"
                                                />
                                                <span className="text-[10px] font-bold text-[#050505]/70 group-hover:text-[#050505] uppercase">{asset.symbol}</span>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}


                            {/* Section: My Assets */}
                            {!searchQuery && (
                                <div className="px-3 py-1 text-[10px] font-black text-black/40 uppercase tracking-[0.2em] sticky top-0 bg-white z-10 border-t border-black/5 pt-2">Active Balances</div>
                            )}
                            
                            {!searchQuery && isLoadingTokens && (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="w-4 h-4 text-black/20 animate-spin" />
                                </div>
                            )}
                            
                            {availableAssets.filter(a => 
                                !searchQuery || a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || a.name.toLowerCase().includes(searchQuery.toLowerCase())
                            ).map((asset, idx) => (
                                <button
                                    key={`owned-${idx}`}
                                    onClick={() => {
                                        onSelect(asset);
                                        setIsOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-black/5 transition-colors flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-3">
                                        <TokenLogo 
                                            symbol={asset.symbol} 
                                            address={asset.address} 
                                            logoURI={asset.logoURI} 
                                            className="w-7 h-7 rounded-full" 
                                            fallbackClassName="w-7 h-7 rounded-full text-[10px]"
                                        />
                                        <div>
                                            <div className="text-[#050505] font-black text-sm tracking-tight">{asset.symbol}</div>
                                            <div className="text-black/40 text-[10px] font-bold max-w-[120px] truncate">{asset.name}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-mono font-black text-[#050505]/60">{parseFloat(asset.balanceFormatted || '0').toFixed(4)}</div>
                                        {selectedToken?.address === asset.address && <Check size={14} className="ml-auto text-emerald-500 mt-1" />}
                                    </div>
                                </button>
                            ))}

                            {/* Section: Search Results */}
                            {searchQuery && (
                                <>
                                    <div className="px-3 py-2 text-[10px] font-black text-[#050505] uppercase tracking-[0.2em] border-t border-black/5 mt-2 sticky top-0 bg-white z-10">Global Search</div>
                                    {isSearching ? (
                                        <div className="py-8 flex flex-col items-center gap-2">
                                            <Loader2 className="w-5 h-5 text-black/40 animate-spin" />
                                            <span className="text-[10px] font-bold text-black/40">Scanning Network...</span>
                                        </div>
                                    ) : searchResults.length > 0 ? (
                                        searchResults.map((asset, idx) => (
                                            <button
                                                key={`search-${idx}`}
                                                onClick={() => {
                                                    onSelect(asset);
                                                    setIsOpen(false);
                                                }}
                                                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-black/5 transition-colors flex items-center gap-3"
                                            >
                                                <TokenLogo 
                                                    symbol={asset.symbol} 
                                                    address={asset.address} 
                                                    logoURI={asset.logoURI} 
                                                    className="w-7 h-7 rounded-full" 
                                                    fallbackClassName="w-7 h-7 rounded-full text-[10px]"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex justify-between">
                                                        <div className="text-[#050505] font-black text-sm tracking-tight">{asset.symbol}</div>
                                                        <div className="text-[9px] bg-black/5 px-1.5 py-0.5 rounded text-black/60 font-mono font-bold self-start">ERC20</div>
                                                    </div>
                                                    <div className="text-black/40 text-[10px] font-bold truncate max-w-[200px]">{asset.name}</div>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center text-black/30 font-bold text-xs uppercase tracking-widest">No tokens found</div>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

