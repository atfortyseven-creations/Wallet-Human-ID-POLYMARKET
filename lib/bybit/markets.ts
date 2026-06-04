/**
 * Bybit Market Types
 * Defines supported trading symbols for the System Terminal.
 */

export type DisplaySymbol =
  | 'BTC/USDT'
  | 'ETH/USDT'
  | 'SOL/USDT'
  | 'BNB/USDT'
  | 'XRP/USDT'
  | 'ADA/USDT'
  | 'DOGE/USDT'
  | 'MATIC/USDT'
  | 'AVAX/USDT'
  | 'DOT/USDT'
  | 'LINK/USDT'
  | 'UNI/USDT'
  | 'ATOM/USDT'
  | 'LTC/USDT'
  | 'ETC/USDT'
  | 'AUTH/USDT'
  | string; // Allow custom symbols

export interface MarketConfig {
  symbol: DisplaySymbol;
  baseCurrency: string;
  quoteCurrency: string;
  minOrderSize: number;
  tickSize: number;
  contractType: 'linear' | 'inverse';
}

export const SUPPORTED_MARKETS: MarketConfig[] = [
  { symbol: 'BTC/USDT', baseCurrency: 'BTC', quoteCurrency: 'USDT', minOrderSize: 0.001, tickSize: 0.1, contractType: 'linear' },
  { symbol: 'ETH/USDT', baseCurrency: 'ETH', quoteCurrency: 'USDT', minOrderSize: 0.01, tickSize: 0.01, contractType: 'linear' },
  { symbol: 'SOL/USDT', baseCurrency: 'SOL', quoteCurrency: 'USDT', minOrderSize: 0.1, tickSize: 0.001, contractType: 'linear' },
  { symbol: 'AUTH/USDT', baseCurrency: 'AUTH', quoteCurrency: 'USDT', minOrderSize: 1, tickSize: 0.001, contractType: 'linear' },
];

export function toBybitSymbol(display: DisplaySymbol): string {
  return display.replace('/', '');
}

export function toDisplaySymbol(bybit: string): DisplaySymbol {
  // Convert BTCUSDT  BTC/USDT
  if (bybit.endsWith('USDT')) {
    return `${bybit.slice(0, -4)}/USDT` as DisplaySymbol;
  }
  return bybit as DisplaySymbol;
}
