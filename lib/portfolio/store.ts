import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Helper function to convert chainId to readable name
function getChainName(chainId: number): string {
  const chainNames: Record<number, string> = {
    1: 'Ethereum',
    137: 'Polygon',
    8453: 'Base',
    42161: 'Arbitrum',
    10: 'Optimism',
    43114: 'Avalanche',
    56: 'BSC',
    480: 'World Chain',
    0: 'Bitcoin'
  };
  return chainNames[chainId] || `Chain ${chainId}`;
}

export interface Asset {
  symbol: string;
  name: string;
  balance: number;
  price: number;
  value: number;
  change24h: number;
  allocation: number; // Percentage
  network: string;
}



export interface PortfolioData {
  totalValue: number;
  totalChange24h: number;
  assets: Asset[];
  isLoading: boolean;
  lastUpdated: number;
}

interface PortfolioState {
  // Global Price Map (Shared across all accounts)
  prices: Record<string, number>;
  
  // Per-Address Cache
  wallets: Record<string, PortfolioData>;

  // Actions
  fetchPortfolio: (address: string) => Promise<void>;
  updatePrices: (tickers: Record<string, number>) => void;
  
  // Selectors
  getPortfolio: (address: string) => PortfolioData;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      prices: {},
      wallets: {},

      getPortfolio: (address: string) => {
        const state = get();
        return state.wallets[address.toLowerCase()] || {
            totalValue: 0,
            totalChange24h: 0,
            assets: [],
            isLoading: false,
            lastUpdated: 0
        };
      },

      fetchPortfolio: async (address: string) => {
        if (!address) return;
        const normalizedAddr = address.toLowerCase();
        
        // Optimistic Loading State
        set(state => ({
            wallets: {
                ...state.wallets,
                [normalizedAddr]: {
                    ...(state.wallets[normalizedAddr] || { totalValue: 0, totalChange24h: 0, assets: [], lastUpdated: 0 }),
                    isLoading: true
                }
            }
        }));

        try {
            const res = await fetch(`/api/user/portfolio?address=${address}`);
            if (res.ok) {
                const data = await res.json();
                
                // Map API response to Asset interface
                const assets: Asset[] = (data.tokens || []).map((t: any) => ({
                    symbol: t.symbol,
                    name: t.name || t.symbol,
                    balance: t.balanceNumeric || parseFloat(t.balance) || 0,
                    price: t.price || 0,
                    value: t.valueUsd || 0,
                    change24h: t.change24h || 0,
                    allocation: 0, 
                    network: getChainName(t.chainId)
                }));

                const totalValue = data.totalValueUsd || 0;
                
                // Calculate allocations
                assets.forEach(a => {
                    a.allocation = totalValue > 0 ? (a.value / totalValue) * 100 : 0;
                });

                // Update shared prices map
                const newPrices: Record<string, number> = {};
                assets.forEach(a => {
                    if (a.price) newPrices[a.symbol] = a.price;
                });

                set(state => ({
                    prices: { ...state.prices, ...newPrices },
                    wallets: {
                        ...state.wallets,
                        [normalizedAddr]: {
                            assets,
                            totalValue,
                            totalChange24h: data.change24hPercent || 0,
                            isLoading: false,
                            lastUpdated: Date.now()
                        }
                    }
                }));
                
                console.log(`[Portfolio Store] Updated cache for ${normalizedAddr}`);

            } else {
                console.error('[Portfolio Store] Failed fetch:', res.status);
                // Reset loading state but keep old data if available
                set(state => ({
                    wallets: {
                        ...state.wallets,
                        [normalizedAddr]: {
                            ...(state.wallets[normalizedAddr] || { totalValue: 0, totalChange24h: 0, assets: [] }),
                            isLoading: false
                        }
                    }
                }));
            }
        } catch (error) {
            console.error('[Portfolio Store] Error:', error);
            set(state => ({
                wallets: {
                    ...state.wallets,
                    [normalizedAddr]: {
                        ...(state.wallets[normalizedAddr] || { totalValue: 0, totalChange24h: 0, assets: [] }),
                        isLoading: false
                    }
                }
            }));
        }
      },
      
      updatePrices: (tickers: Record<string, number>) => {
          const state = get();
          const newPrices = { ...state.prices, ...tickers };
          
          // Re-calculate values for ALL wallets in cache
          const newWallets: Record<string, PortfolioData> = {};
          
          Object.entries(state.wallets).forEach(([addr, wallet]) => {
              let updated = false;
              let newTotalValue = 0;
              
              const newAssets = wallet.assets.map(asset => {
                  const newPrice = tickers[asset.symbol] || tickers[`${asset.symbol}USDT`];
                  if (newPrice && newPrice !== asset.price) {
                      updated = true;
                      const newValue = asset.balance * newPrice;
                      return { ...asset, price: newPrice, value: newValue };
                  }
                  return asset;
              });

              if (updated) {
                  newTotalValue = newAssets.reduce((acc, curr) => acc + curr.value, 0);
                  newAssets.forEach(a => {
                       a.allocation = newTotalValue > 0 ? (a.value / newTotalValue) * 100 : 0;
                  });
                  
                  newWallets[addr] = {
                      ...wallet,
                      assets: newAssets,
                      totalValue: newTotalValue
                  };
              } else {
                  newWallets[addr] = wallet;
              }
          });
          
          set({ prices: newPrices, wallets: newWallets });
      }
    }),
    {
      name: 'portfolio-storage-v2', // Bump version to force fresh cache
      partialize: (state) => ({ wallets: state.wallets }), // Only persist wallet data
    }
  )
);

