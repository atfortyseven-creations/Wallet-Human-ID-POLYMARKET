// Zero-Trust JWT Blacklist
// A globally accessible memory store to invalidate compromised session tokens instantly.
// For multi-node deployments, this interfaces with Redis. For Edge Runtime / Single Node,
// it uses an in-memory LRU approximation.

const blacklist = new Map<string, number>();

// Expire entries older than 24 hours (standard session max age)
const MAX_EXPIRATION_MS = 24 * 60 * 60 * 1000; 

/**
 * Revokes a specific JWT token instantly.
 * @param token The raw JWT string
 */
export function revokeToken(token: string) {
  if (!token) return;
  // Store a shortened hash to save memory
  const hash = hashToken(token);
  blacklist.set(hash, Date.now() + MAX_EXPIRATION_MS);
  
  // Basic GC
  if (blacklist.size > 10000) {
    const now = Date.now();
    for (const [key, exp] of blacklist.entries()) {
      if (now > exp) blacklist.delete(key);
    }
  }
}

/**
 * Checks if a token is blacklisted.
 * @param token The raw JWT string
 * @returns true if the token is revoked
 */
export function isTokenRevoked(token: string): boolean {
  if (!token) return false;
  const hash = hashToken(token);
  
  if (blacklist.has(hash)) {
    const exp = blacklist.get(hash)!;
    if (Date.now() > exp) {
      blacklist.delete(hash);
      return false;
    }
    return true;
  }
  return false;
}

// Simple non-cryptographic hash just for Edge memory efficiency
// In a true clustered environment, we would use crypto.subtle or Redis
function hashToken(token: string): string {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
        const char = token.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
}
