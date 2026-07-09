/**
 * lib/aztec/qds-contract.ts
 *
 * QDs math helpers — the canonical unit-conversion layer for the
 * Humanity Ledger QDs token.
 *
 * Denomination:
 *   1 QD = 10^8 base units  (analogous to 1 BTC = 10^8 satoshis)
 *   All on-chain values are stored as raw BigInts in base units.
 *
 * These functions are pure (no side effects) and dependency-free.
 */

/** Number of decimal places (= exponent of the base-unit multiplier). */
const QDS_DECIMALS = 8;
const QDS_SCALE = BigInt(10 ** QDS_DECIMALS); // 100_000_000n

/**
 * Convert raw base-unit BigInt → human-readable QDs string.
 *
 * @example rawToQds(100_000_000n) === '1.00000000'
 * @example rawToQds(0n)           === '0.00000000'
 */
export function rawToQds(raw: bigint): string {
  if (typeof raw !== 'bigint') {
    raw = BigInt(Math.round(Number(raw)));
  }
  const isNegative = raw < 0n;
  const abs = isNegative ? -raw : raw;

  const whole = abs / QDS_SCALE;
  const frac  = abs % QDS_SCALE;

  // Zero-pad fractional part to exactly QDS_DECIMALS digits
  const fracStr = frac.toString().padStart(QDS_DECIMALS, '0');
  const result  = `${whole}.${fracStr}`;
  return isNegative ? `-${result}` : result;
}

/**
 * Convert human-readable QDs string → raw base-unit BigInt.
 *
 * @example qdsToRaw('1')    === 100_000_000n
 * @example qdsToRaw('1.5')  === 150_000_000n
 * @example qdsToRaw('')     === 0n  (safe fallback)
 */
export function qdsToRaw(qds: string): bigint {
  if (!qds || typeof qds !== 'string') return 0n;

  const trimmed = qds.trim();
  if (!trimmed || trimmed === '.') return 0n;

  const isNegative = trimmed.startsWith('-');
  const abs = isNegative ? trimmed.slice(1) : trimmed;

  const dotIndex = abs.indexOf('.');
  let wholePart: string;
  let fracPart: string;

  if (dotIndex === -1) {
    // No decimal point — treat as integer QDs
    wholePart = abs;
    fracPart  = '';
  } else {
    wholePart = abs.slice(0, dotIndex);
    fracPart  = abs.slice(dotIndex + 1);
  }

  // Guard: empty parts
  if (!wholePart) wholePart = '0';

  // Truncate or pad fractional part to exactly QDS_DECIMALS digits
  const fracPadded = fracPart
    .slice(0, QDS_DECIMALS)
    .padEnd(QDS_DECIMALS, '0');

  let raw: bigint;
  try {
    raw = BigInt(wholePart) * QDS_SCALE + BigInt(fracPadded);
  } catch {
    return 0n;
  }

  return isNegative ? -raw : raw;
}

/**
 * Format a raw BigInt amount as a short display string (up to 6 decimals,
 * trailing zeros stripped). Useful for UI labels.
 *
 * @example formatQds(100_000_000n) === '1'
 * @example formatQds(150_000_000n) === '1.5'
 */
export function formatQds(raw: bigint, maxDecimals = 6): string {
  const full = rawToQds(raw); // e.g. "1.50000000"
  const [whole, frac] = full.split('.');
  const trimmedFrac = (frac ?? '').slice(0, maxDecimals).replace(/0+$/, '');
  return trimmedFrac ? `${whole}.${trimmedFrac}` : whole;
}
