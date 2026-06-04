/**
 * Ambient type stubs for @aztec/aztec.js
 *
 * The Aztec sandbox package (@aztec/aztec.js) requires a non-standard
 * npm registry version not yet available in the public registry.
 * These stubs satisfy the TypeScript compiler so that `lib/aztec/pxeClient.ts`
 * compiles without errors. At runtime, the real package is expected to be
 * available in the Aztec sandbox environment.
 *
 * DO NOT import from this file directly. These types are auto-applied by
 * TypeScript via the `types/` directory ambient declaration pattern.
 */
declare module '@aztec/aztec.js' {
  /** Creates an instance of the PXE HTTP client. */
  export function createPXEClient(url: string): any;

  /** Creates a new Aztec account on the connected PXE. */
  export function createAccount(pxe: any): Promise<any>;

  /** Returns the pre-funded sandbox test wallets. */
  export function getSandboxAccountsWallets(pxe: any): Promise<any[]>;

  /** Returns an interface to an already-deployed Aztec contract. */
  export function getContractAt(address: any, abi: any, wallet: any): Promise<any>;
}
