//  Enterprise ADMIN REGISTRY 
// SECURITY: Uses server-only ADMIN_WALLET_ADDRESS env var (no NEXT_PUBLIC_ prefix).
// The NEXT_PUBLIC_ prefix would expose admin wallet to the client-side bundle,
// making admin identity enumeration trivial for any attacker.
// Set ADMIN_WALLET_ADDRESS in your Railway/Vercel dashboard secrets.
export const ADMIN_WALLETS = [
  (process.env.ADMIN_WALLET_ADDRESS || '').toLowerCase(),
].filter(Boolean);

if (ADMIN_WALLETS.length === 0) {
  // Logged as info-level so Railway shows it in blue. Admin routes are simply disabled.
  console.log('[System] ️  ADMIN_WALLET_ADDRESS not set  admin routes disabled (non-critical for public deployment).');
}

export function isAdmin(walletAddress?: string): boolean {
  if (!walletAddress) return false;
  return ADMIN_WALLETS.includes(walletAddress.toLowerCase());
}
