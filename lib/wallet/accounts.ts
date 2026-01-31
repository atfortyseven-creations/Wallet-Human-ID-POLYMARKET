/**
 * Accounts Service (Multi-Account & Watch Only)
 * Manages derivation, storage, and switching of wallet accounts
 */

import { mnemonicToAccount } from 'viem/accounts';
import { decryptMnemonic } from './mnemonic'; // Assuming this exists from Phase 1

export type WalletType = 'PRIMARY' | 'DERIVED' | 'IMPORTED' | 'WATCH_ONLY' | 'HARDWARE';

export interface WalletAccount {
  id?: string;
  address: string;
  name: string;
  type: WalletType;
  index?: number;
  color?: string;
  balance?: number; // Mocked for UI
}

/**
 * Derive a new account from the mnemonic
 */
export async function deriveNextAccount(
  mnemonic: string,
  currentIndex: number
): Promise<{ address: string; index: number; path: string }> {
  // Standard Ethereum Path: m/44'/60'/0'/0/X
  const nextIndex = currentIndex + 1;
  const path = `m/44'/60'/0'/0/${nextIndex}`;
  
  const account = mnemonicToAccount(mnemonic, {
    accountIndex: nextIndex,
  });

  return {
    address: account.address,
    index: nextIndex,
    path,
  };
}

/**
 * Mock function to sync accounts with backend
 * In production, this would call DELETE/POST /api/wallet/accounts
 */
export async function syncAccountToBackend(account: WalletAccount) {
  // Simulate API call
  console.log('Syncing account:', account);
  return true;
}

/**
 * Get color for account avatar based on address
 */
export function getAccountColor(address: string): string {
  const colors = [
    'linear-gradient(135deg, #FF6B6B 0%, #EE5253 100%)',
    'linear-gradient(135deg, #4834D4 0%, #686DE0 100%)',
    'linear-gradient(135deg, #6AB04C 0%, #BADC58 100%)',
    'linear-gradient(135deg, #F0932B 0%, #FFBE76 100%)',
    'linear-gradient(135deg, #22A6B3 0%, #7ED6DF 100%)',
  ];
  const index = parseInt(address.slice(2, 4), 16) % colors.length;
  return colors[index];
}
