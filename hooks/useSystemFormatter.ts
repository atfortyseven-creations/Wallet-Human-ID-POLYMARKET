import { useSettingsStore } from '@/lib/store/useSettingsStore';
import { useMarketStream } from '@/context/MarketStreamContext';

const FIAT_RATES: Record<string, number> = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 153.20,
};

export function useSystemFormatter() {
    const { settings } = useSettingsStore();
    const { markets } = useMarketStream();

    const formatMoney = (usdValue: number, decimals: number = 2) => {
        if (settings?.showBalances === false) return '***';

        const baseUnit = settings?.displayUnit || 'FIAT';
        
        // 1. If displaying in pure cryptocurrency amounts native to the ecosystem
        if (baseUnit === 'BTC') {
            const btcPriceStr = markets.get('BTCUSDT')?.lastPrice || '65000';
            const btcPrice = parseFloat(btcPriceStr);
            const inBtc = usdValue / btcPrice;
            return `${inBtc.toFixed(6)}`;
        }
        if (baseUnit === 'ETH') {
            const ethPriceStr = markets.get('ETHUSDT')?.lastPrice || '3500';
            const ethPrice = parseFloat(ethPriceStr);
            const inEth = usdValue / ethPrice;
            return `Ξ${inEth.toFixed(4)}`;
        }

        // 2. If displaying in FIAT (Default)
        const targetCurrency = settings?.currency || 'USD';
        const rate = FIAT_RATES[targetCurrency] || 1;
        const converted = usdValue * rate;

        const currencyMap: Record<string, string> = {
            USD: '$', EUR: '', GBP: '£', JPY: '¥'
        };
        const symbol = currencyMap[targetCurrency] || '$';

        return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
    };

    const formatLargeMoney = (usdValue: number) => {
        if (settings?.showBalances === false) return '***';

        const baseUnit = settings?.displayUnit || 'FIAT';
        if (baseUnit !== 'FIAT') {
            return formatMoney(usdValue, 2);
        }

        const targetCurrency = settings?.currency || 'USD';
        const rate = FIAT_RATES[targetCurrency] || 1;
        const converted = usdValue * rate;
        
        const currencyMap: Record<string, string> = {
            USD: '$', EUR: '', GBP: '£', JPY: '¥'
        };
        const symbol = currencyMap[targetCurrency] || '$';

        if (converted >= 1e9)  return `${symbol}${(converted / 1e9).toFixed(2)}B`;
        if (converted >= 1e6)  return `${symbol}${(converted / 1e6).toFixed(2)}M`;
        if (converted >= 1e3)  return `${symbol}${(converted / 1e3).toFixed(1)}K`;
        
        return `${symbol}${converted.toFixed(2)}`;
    };

    const formatDate = (date: Date | string | number) => {
        const d = new Date(date);
        const format = settings?.dateFormat || 'DD/MM/YYYY';
        
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();

        if (format === 'MM/DD/YYYY') {
            return `${month}/${day}/${year}`;
        }
        return `${day}/${month}/${year}`;
    };

    const formatTime = (date: Date | string | number) => {
        const d = new Date(date);
        const format = settings?.timeFormat || '24h';
        
        if (format === '12h') {
            let hours = d.getHours();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            const minutes = d.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes} ${ampm}`;
        } else {
            const hours = d.getHours().toString().padStart(2, '0');
            const minutes = d.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        }
    };

    const formatAddress = (addressStr: string) => {
        if (!addressStr) return '';
        const format = settings?.addressFormat || 'truncated';
        
        if (format === 'full') return addressStr;
        
        if (addressStr.length > 10) {
            return `${addressStr.slice(0, 6)}...${addressStr.slice(-4)}`;
        }
        return addressStr;
    };

    return { formatMoney, formatLargeMoney, formatDate, formatTime, formatAddress };
}
