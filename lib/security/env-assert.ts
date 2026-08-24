/**
 * Environment Variable Assertion Utilities
 * Enforces FAIL CLOSED security architecture.
 * No hardcoded fallback secrets are permitted.
 */

export function requireEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    // FAIL CLOSED: No fallback secrets allowed in any environment.
    throw new Error(`CRITICAL SECURITY ERROR: Required environment variable ${name} is missing.`);
  }
  return value;
}

export function requireSecret(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`CRITICAL SECURITY ERROR: Required secret ${name} is missing.`);
  }
  // Optional: Add minimum length checks here
  if (value.length < 32) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`CRITICAL SECURITY ERROR: Secret ${name} must be at least 32 characters in production.`);
    }
  }
  return value;
}
