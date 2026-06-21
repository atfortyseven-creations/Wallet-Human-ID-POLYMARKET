/**
 * PRISMA BROWSER STUB
 * 
 * This file is aliased to '@prisma/client' in client-side webpack bundles via next.config.js.
 * It prevents the real PrismaClient from being bundled into client-side JS, which would cause:
 * "PrismaClient is unable to run in this browser environment"
 * 
 * Any server-only code that accidentally gets bundled for the client will receive
 * this safe no-op stub instead of crashing the browser.
 */

module.exports = {
  PrismaClient: class PrismaClientBrowserStub {
    constructor() {
      if (typeof window !== 'undefined') {
        console.error('[PRISMA STUB] PrismaClient imported in browser context. This is a server-only module.');
      }
    }
  },
  Prisma: {},
};
