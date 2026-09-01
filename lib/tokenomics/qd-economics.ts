/**
 * QD TOKENOMICS ENGINE v2.0 — MAINNET GENESIS
 * 
 * All economic parameters for the QDs token.
 * These constants define the financial model for the January mainnet launch.
 */

// === SUPPLY & DISTRIBUTION ===
export const QD_TOTAL_SUPPLY_CAP = 1_000_000_000; // 1 billion QDs maximum ever
export const QD_GENESIS_AIRDROP_POOL = 200_000; // 200K reserved for genesis airdrop (200 wallets × 1000 QD)
export const QD_TEAM_ALLOCATION = 50_000_000; // 5% team allocation (4-year vest)
export const QD_ECOSYSTEM_FUND = 100_000_000; // 10% ecosystem fund
export const QD_DEFAULT_BALANCE = 2500; // Every new user starts with 2500 QDs

// === TRANSFER MECHANICS ===
export const QD_MIN_TRANSFER = 0.000001; // Minimum transfer: 1 micro-QD
export const QD_MAX_TRANSFER = 10_000; // Maximum single transfer: 10K QDs
export const QD_TRANSFER_FEE_BPS = 100; // 1% fee
export const QD_MIN_FEE = 1; // Minimum fee is always 1 QD (anti-dust)

// === MESSAGE ECONOMICS ===
export const QD_MSG_COST = 1; // 1 QD per message (when verified)
export const QD_MSG_FREE_DAILY = 50; // First 50 messages/day are free for new users

// === REWARDS ===
export const QD_TRANSFER_REWARD = 50; // 50 QD reward for transfers ≥ 50 QD
export const QD_REWARD_THRESHOLD = 50; // Minimum transfer to earn reward
export const QD_DAILY_REWARD_LIMIT = 1; // Max 1 reward per sender-recipient pair per day (anti-wash)

// === ANTI-SYBIL PARAMETERS ===
export const QD_AIRDROP_CAP = 200; // Max total genesis airdrops ever
export const QD_IP_DAILY_LIMIT = 1; // Max airdrops per IP per day
export const QD_MIN_BALANCE_TO_TRANSFER = 1; // Must have at least 1 QD to send

// === VESTING (for team/ecosystem) ===
export const QD_VEST_CLIFF_MONTHS = 6; // 6-month cliff
export const QD_VEST_TOTAL_MONTHS = 48; // 4-year total vest

/**
 * Calculate the fee for a transfer
 */
export function calculateTransferFee(amount: number): number {
  return Math.max(QD_MIN_FEE, Math.round(amount * (QD_TRANSFER_FEE_BPS / 10000)));
}

/**
 * Validate a transfer amount
 */
export function validateTransferAmount(amount: number, balance: number): { ok: boolean; error?: string } {
  if (amount < QD_MIN_TRANSFER) return { ok: false, error: `Minimum transfer is ${QD_MIN_TRANSFER} QDs.` };
  if (amount > QD_MAX_TRANSFER) return { ok: false, error: `Maximum single transfer is ${QD_MAX_TRANSFER} QDs.` };
  const fee = calculateTransferFee(amount);
  if (balance < amount + fee) return { ok: false, error: `Insufficient balance. Need ${amount + fee} QDs (${amount} + ${fee} fee).` };
  return { ok: true };
}
