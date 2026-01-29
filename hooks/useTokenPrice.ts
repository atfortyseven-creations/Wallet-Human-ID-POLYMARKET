import useSWR from 'swr';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=worldcoin-wld,ethereum,usd-coin&vs_currencies=usd&include_24hr_change=true';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useTokenPrice() {
    const { data, error, isLoading } = useSWR(COINGECKO_API_URL, fetcher, {
        refreshInterval: 60000, // Refresh every minute
        dedupingInterval: 60000,
    });

    return {
        prices: {
            WLD: data ? data['worldcoin-wld']?.usd : 0,
            ETH: data ? data['ethereum']?.usd : 0,
            USDC: data ? data['usd-coin']?.usd : 1,
        },
        changes: {
            WLD: data ? data['worldcoin-wld']?.usd_24h_change : 0,
            ETH: data ? data['ethereum']?.usd_24h_change : 0,
            USDC: data ? data['usd-coin']?.usd_24h_change : 0,
        },
        // Legacy support equivalent
        price: data ? data['worldcoin-wld']?.usd : 0,
        isLoading,
        error,
    };
}
