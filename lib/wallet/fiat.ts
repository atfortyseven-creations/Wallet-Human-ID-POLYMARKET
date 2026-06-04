/**
 * Fiat On-Ramp Service (MoonPay Integration)
 * Buy crypto with credit card/bank transfer
 */

// Production configuration: Keys should be in .env
const MOONPAY_API_KEY = process.env.NEXT_PUBLIC_MOONPAY_KEY || process.env.MOONPAY_API_KEY || 'pk_test_123';
const MOONPAY_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://buy.moonpay.com' 
  : 'https://buy-sandbox.moonpay.com';

export interface FiatQuote {
  baseCurrencyCode: string;
  baseCurrencyAmount: number;
  quoteCurrencyCode: string;
  quoteCurrencyAmount: number;
  quoteCurrencyPrice: number;
  feeAmount: number;
  extraFeeAmount: number;
  networkFeeAmount: number;
  totalAmount: number;
}

/**
 * Generate MoonPay URL for user
 * This is the critical production "Buy" function.
 */
export function getMoonPayUrl(
  walletAddress: string,
  currencyCode: string = 'eth',
  baseCurrencyAmount: number = 100
): string {
  const params = new URLSearchParams({
    apiKey: MOONPAY_API_KEY,
    currencyCode: currencyCode.toLowerCase(),
    walletAddress,
    baseCurrencyAmount: baseCurrencyAmount.toString(),
    baseCurrencyCode: 'usd',
    // Ensure we handle the redirect back to the app
    redirectURL: typeof window !== 'undefined' ? `${window.location.origin}/wallet` : '',
  });

  // Additional security: External URL signature should be handled on server in full production
  return `${MOONPAY_BASE_URL}?${params.toString()}`;
}

import { getRealTimePrice } from '../priceHelper';

/**
 * Get quote for fiat purchase
 * Integrates with live market rates to provide accurate estimated quotes.
 */
export async function getFiatQuote(
  amountUSD: number,
  cryptoSymbol: string
): Promise<FiatQuote> {
  try {
    // [PRODUCTION] Fetch real-time market price
    const price = await getRealTimePrice(cryptoSymbol.toUpperCase());
    
    if (!price || price === 0) {
      throw new Error(`Real-time price unavailable for ${cryptoSymbol}`);
    }

    const cryptoAmount = amountUSD / price;
    
    // MoonPay roughly takes 1% to 4.5% depending on method
    const estimatedFee = amountUSD * 0.035; 
    const networkFee = 2.50; // Flat estimate for Polygon/Base
    const netAmount = (amountUSD - estimatedFee - networkFee) / price;

    return {
      baseCurrencyCode: 'usd',
      baseCurrencyAmount: amountUSD,
      quoteCurrencyCode: cryptoSymbol.toLowerCase(),
      quoteCurrencyAmount: Math.max(0, netAmount),
      quoteCurrencyPrice: price,
      feeAmount: estimatedFee,
      extraFeeAmount: 0,
      networkFeeAmount: networkFee,
      totalAmount: amountUSD,
    };
  } catch (error) {
    console.error('Fiat quote error:', error);
    throw new Error('Failed to retrieve live fiat quote');
  }
}

