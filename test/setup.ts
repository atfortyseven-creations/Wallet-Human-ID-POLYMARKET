// test/setup.ts  Global test setup for System test suite
// @ts-ignore - Vitest types not fully linked in strict mode
import { vi } from 'vitest';

// Set required environment variables for all tests
(process.env as any).NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-minimum-32-chars-ok';
process.env.NEXTAUTH_SECRET = 'test-nextauth-secret-minimum-32-chars-ok';
process.env.AUDIT_SECRET = 'test-audit-secret-minimum-32-chars-ok';
process.env.KYC_SECRET = 'test-kyc-secret-minimum-32-chars-ok';

// Silence console.warn/error in tests unless explicitly testing logging
// Comment these out to debug test failures
// vi.spyOn(console, 'warn').mockImplementation(() => {});
// vi.spyOn(console, 'error').mockImplementation(() => {});
