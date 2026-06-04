
import { parseUnits, formatUnits } from 'viem';

/**
 * [LEGENDARY] Real Swap Quote Service
 * Fetches actionable swap calldata from 0x API (or fallback).
 */

const ZERO_EX_API_KEY = process.env.NEXT_PUBLIC_ZERO_EX_API_KEY || ''; // Optional: User might not have one
const ZERO_EX_API_URL = 'https://api.0x.org/swap/v1/quote';

export interface SwapQuote {
    price: string;
    to: string;
    data: string;
    value: string;
    buyAmount: string;
    sellAmount: string;
    allowanceTarget?: string; // If approval needed
    estimatedGas: string;
}

export const swapService = {
    async getQuote(
        chainId: number, 
        buyToken: string, 
        sellToken: string, 
        sellAmount: string, // in ether units (e.g. "1.5")
        decimals: number = 18
    ): Promise<SwapQuote | null> {
        // Mocking Real Quote for "Demo" until API Key is set, 
        // OR fetching if Key exists.
        
        // 1. Base API URL mapping
        let baseUrl = ZERO_EX_API_URL;
        if (chainId === 137) baseUrl = 'https://polygon.api.0x.org/swap/v1/quote';
        if (chainId === 8453) baseUrl = 'https://base.api.0x.org/swap/v1/quote';
        if (chainId === 10) baseUrl = 'https://optimism.api.0x.org/swap/v1/quote';
        
        // 2. Parse Amount
        const sellAmountBaseUnits = parseUnits(sellAmount, decimals).toString();

        // 3. Construct URL
        const params = new URLSearchParams({
            buyToken,
            sellToken,
            sellAmount: sellAmountBaseUnits,
            // recipient: userAddress // Optional
        });

        try {
            // [DEMO MODE] If no API key, we might need a fallback or just fail gracefully.
            // But for "User WANTS REAL", we try the public endpoint which might be rate limited.
            const res = await fetch(`${baseUrl}?${params.toString()}`, {
                headers: {
                    '0x-api-key': ZERO_EX_API_KEY
                }
            });

            if (!res.ok) {
                const err = await res.json();
                console.warn("[SwapService] 0x API Error:", err);
                throw new Error("Swap API Unavailable");
            }

            const data = await res.json();
            return {
                price: data.price,
                to: data.to,
                data: data.data,
                value: data.value,
                buyAmount: data.buyAmount,
                sellAmount: data.sellAmount,
                allowanceTarget: data.allowanceTarget,
                estimatedGas: data.estimatedGas
            };

        } catch (e) {
            console.error("[SwapService] Fetch failed", e);
            // Fallback for Demo: If it's a testnet or API fails, we return null 
            // The UI should handle this by showing standard transfer fallback or error.
            return null; 
        }
    }
}

