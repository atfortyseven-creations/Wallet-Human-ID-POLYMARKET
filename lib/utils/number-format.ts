/**
 * Safe number formatting utilities to prevent crashes from null/undefined values
 */

/**
 * Safely converts a number to a fixed decimal string
 * @param value - The value to format (can be null, undefined, or NaN)
 * @param decimals - Number of decimal places (default: 2)
 * @param fallback - Fallback value when input is invalid (default: "0")
 * @returns Formatted string or fallback
 */
export function safeToFixed(
  value: number | string | null | undefined,
  decimals: number = 2,
  fallback: string = "0"
): string {
  if (value === null || value === undefined) {
    return fallback;
  }

  // Handle Prisma Decimal or other objects with toString()
  let valToParse = value;
  if (value && typeof value === 'object' && 'toString' in value) {
    valToParse = (value as any).toString();
  }

  const num = typeof valToParse === 'string' ? parseFloat(valToParse) : valToParse as number;

  if (isNaN(num) || !isFinite(num)) {
    return fallback;
  }

  if (num === 0) return "0";

  let formatted = num.toFixed(decimals);
  if (decimals > 2 && formatted.includes('.')) {
    formatted = formatted.replace(/0+$/, '');
    if (formatted.endsWith('.')) {
      formatted = formatted.slice(0, -1);
    }
  }

  return formatted;
}

/**
 * Safely converts a number to a locale string
 * @param value - The value to format (can be null, undefined, or NaN)
 * @param options - Intl.NumberFormatOptions
 * @param fallback - Fallback value when input is invalid (default: "")
 * @returns Formatted string or fallback
 */
export function safeToLocaleString(
  value: number | string | null | undefined,
  options?: Intl.NumberFormatOptions,
  fallback: string = ""
): string {
  if (value === null || value === undefined) {
    return fallback;
  }

  // Handle Prisma Decimal or other objects with toString()
  let valToParse = value;
  if (value && typeof value === 'object' && 'toString' in value) {
    valToParse = (value as any).toString();
  }

  const num = typeof valToParse === 'string' ? parseFloat(valToParse) : valToParse as number;

  if (isNaN(num) || !isFinite(num)) {
    return fallback;
  }

  return num.toLocaleString('en-US', options);
}

/**
 * Formats a currency value safely
 * @param value - The value to format
 * @param decimals - Number of decimal places (default: 2)
 * @param prefix - Currency prefix (default: "$")
 * @param fallback - Fallback when invalid (default: "$0.00")
 * @returns Formatted currency string
 */
export function safeCurrency(
  value: number | string | null | undefined,
  decimals: number = 2,
  prefix: string = "$",
  fallback: string = `${prefix}0.${"0".repeat(decimals)}`
): string {
  const formatted = safeToFixed(value, decimals, null as any);
  if (formatted === null) {
    return fallback;
  }
  return `${prefix}${formatted}`;
}

/**
 * Formats a percentage safely
 * @param value - The value to format (as decimal, e.g., 0.05 = 5%)
 * @param decimals - Number of decimal places (default: 2)
 * @param fallback - Fallback when invalid (default: "0%")
 * @returns Formatted percentage string
 */
export function safePercentage(
  value: number | string | null | undefined,
  decimals: number = 2,
  fallback: string = "0%"
): string {
  const formatted = safeToFixed(value, decimals, null as any);
  if (formatted === null) {
    return fallback;
  }
  return `${formatted}%`;
}

/**
 * Formats a compact number (e.g., 1.2K, 3.4M)
 * @param value - The value to format
 * @param decimals - Number of decimal places (default: 1)
 * @param fallback - Fallback when invalid (default: "")
 * @returns Formatted compact string
 */
export function safeCompact(
  value: number | string | null | undefined,
  decimals: number = 1,
  fallback: string = ""
): string {
  if (value === null || value === undefined) {
    return fallback;
  }

  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num) || !isFinite(num)) {
    return fallback;
  }

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absNum >= 1e9) {
    return `${sign}${(absNum / 1e9).toFixed(decimals)}B`;
  } else if (absNum >= 1e6) {
    return `${sign}${(absNum / 1e6).toFixed(decimals)}M`;
  } else if (absNum >= 1e3) {
    return `${sign}${(absNum / 1e3).toFixed(decimals)}K`;
  }

  return `${sign}${absNum.toFixed(decimals)}`;
}

