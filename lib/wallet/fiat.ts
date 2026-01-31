/**
 * Fiat On-Ramp Service (MoonPay Integration)
 * Buy crypto with credit card/bank transfer
 */

// In production, fetch this from API/env
const MOONPAY_API_KEY = process.env.NEXT_PUBLIC_MOONPAY_KEY || 'pk_test_123';
const MOONPAY_BASE_URL = 'https://buy.moonpay.com';

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
 */
export function getMoonPayUrl(
  walletAddress: string,
  currencyCode: string = 'eth',
  baseCurrencyAmount: number = 100
): string {
  const params = new URLSearchParams({
    apiKey: MOONPAY_API_KEY,
    currencyCode,
    walletAddress,
    baseCurrencyAmount: baseCurrencyAmount.toString(),
    baseCurrencyCode: 'usd',
    redirectURL: window.location.origin + '/wallet/success',
  });

  return `${MOONPAY_BASE_URL}?${params.toString()}`;
}

/**
 * Get quote for fiat purchase (Mocked for Phase 3 dev)
 */
export async function getFiatQuote(
  amountUSD: number,
  cryptoSymbol: string
): Promise<FiatQuote> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock pricing logic
  const mockPrices: Record<string, number> = {
    'ETH': 3000,
    'USDC': 1,
    'MATIC': 0.8,
  };

  const price = mockPrices[cryptoSymbol.toUpperCase()] || 100;
  const cryptoAmount = amountUSD / price;
  const netAmount = cryptoAmount * 0.98; // 2% fee simulation

  return {
    baseCurrencyCode: 'usd',
    baseCurrencyAmount: amountUSD,
    quoteCurrencyCode: cryptoSymbol.toLowerCase(),
    quoteCurrencyAmount: netAmount,
    quoteCurrencyPrice: price,
    feeAmount: amountUSD * 0.01, // 1%
    extraFeeAmount: amountUSD * 0.005, // 0.5%
    networkFeeAmount: 5, // Flat $5
    totalAmount: amountUSD,
  };
}
