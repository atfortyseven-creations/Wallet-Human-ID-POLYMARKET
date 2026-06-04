import { useCurrencyStore, CurrencyCode } from '../lib/store/currency-store';
import { safeToLocaleString } from '../lib/utils/number-format';

export function useCurrency() {
  const { currency, rates } = useCurrencyStore();

  const formatValue = (usdValue: number, decimals: number = 2) => {
    const rate = rates[currency] || 1;
    const translatedValue = usdValue * rate;

    if (currency === 'BTC') {
      return `${safeToLocaleString(translatedValue, { 
        minimumFractionDigits: 4, 
        maximumFractionDigits: 8 
      })}`;
    }

    if (currency === 'EUR') {
      return `${safeToLocaleString(translatedValue, { 
        minimumFractionDigits: decimals, 
        maximumFractionDigits: decimals 
      })}`;
    }

    // Default USD
    return `$${safeToLocaleString(translatedValue, { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    })}`;
  };

  return {
    currency,
    formatValue,
    rates
  };
}
