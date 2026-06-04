import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CurrencyCode = 'USD' | 'EUR' | 'BTC' | 'GBP' | 'CHF' | 'SEK' | 'NOK' | 'DKK' | 'PLN' | 'TRY'

interface CurrencyState {
  currency: CurrencyCode;
  rates: Record<string, number>;
  lastUpdated: number;
  setCurrency: (currency: CurrencyCode) => void;
  updateRates: (newRates: Record<string, number>) => void;
  fetchRates: () => Promise<void>;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: 'USD',
      rates: {
        USD: 1,
        EUR: 0.92,
        GBP: 0.79,
        CHF: 0.90,
        SEK: 10.5,
        NOK: 10.7,
        DKK: 6.9,
        PLN: 4.0,
        TRY: 32.5,
        BTC: 0.000015,
      },
      lastUpdated: 0,
      setCurrency: (currency) => set({ currency }),
      updateRates: (newRates) => set((state) => ({ 
        rates: { ...state.rates, ...newRates },
        lastUpdated: Date.now()
      })),
      fetchRates: async () => {
        try {
          const newRates: Record<string, number> = {};
          
          // 1. Fetch BTC/USD from existing market ticker
          try {
            const tickerRes = await fetch('/api/market/ticker');
            const tickerData = await tickerRes.json();
            if (tickerData.BTC?.price) {
              newRates.BTC = 1 / tickerData.BTC.price;
            }
          } catch (e) {}

          // 2. Fetch European currencies from a public API
          const forexRes = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
          const forexData = await forexRes.json();
          if (forexData?.rates) {
            const codes: CurrencyCode[] = ['EUR', 'GBP', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN', 'TRY'];
            codes.forEach(code => {
              if (forexData.rates[code]) {
                newRates[code] = forexData.rates[code];
              }
            });
          }

          set((state) => ({
            rates: { ...state.rates, ...newRates },
            lastUpdated: Date.now()
          }));
        } catch (e) {
          console.error('[CurrencyStore] Failed to fetch live rates:', e);
        }
      }
    }),
    {
      name: 'whale-currency-storage',
    }
  )
)
