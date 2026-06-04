import { ethers } from 'ethers';
import { KMS } from './KMS';
import { SmartAccountService } from './SmartAccountService';
import { mainnet } from 'viem/chains';

interface WalletAccount {
  index: number;
  address: string;
  smartAddress?: string;
  name: string;
}

/**
 * WalletManager
 * High-level orchestrator for managing HD Wallets and their accounts.
 * Designed for Elite scale and multi-chain expansion.
 */
export class WalletManager {
  private mnemonic: string | null = null;
  private accounts: WalletAccount[] = [];

  constructor(mnemonic?: string) {
    if (mnemonic) {
      if (!KMS.isValidMnemonic(mnemonic)) {
        throw new Error('Provided mnemonic is invalid.');
      }
      this.mnemonic = mnemonic;
    }
  }

  /**
   * Initializes a new wallet with a random mnemonic.
   */
  public static createNew(): WalletManager {
    const mnemonic = KMS.generateMnemonic();
    return new WalletManager(mnemonic);
  }

  /**
   * Loads a wallet from an encrypted state.
   */
  public static async loadFromEncrypted(
    encryptedMnemonic: any,
    password: string
  ): Promise<WalletManager> {
    const mnemonic = await KMS.decrypt(encryptedMnemonic, password);
    return new WalletManager(mnemonic);
  }

  /**
   * Generates the first 'n' accounts for this wallet, including Smart Account addresses.
   */
  public async generateInitialAccounts(count: number = 5): Promise<WalletAccount[]> {
    if (!this.mnemonic) throw new Error('Wallet not initialized.');

    const saService = new SmartAccountService(mainnet, 'https://cloudflare-eth.com'); // Default to mainnet for prediction
    this.accounts = [];

    for (let i = 0; i < count; i++) {
      const wallet = KMS.deriveAccount(this.mnemonic, i);
      const smartAddress = await saService.predictAddress(wallet); // wallet is ethers Wallet, but compatible with viem account as it has privateKey
      
      this.accounts.push({
        index: i,
        address: wallet.address,
        smartAddress: smartAddress as string,
        name: `Account ${i + 1}`,
      });
    }
    return this.accounts;
  }

  /**
   * Signs a transaction using a specific account index.
   */
  public async signTransaction(
    index: number,
    transaction: ethers.TransactionRequest
  ): Promise<string> {
    if (!this.mnemonic) throw new Error('Wallet not initialized.');
    
    const wallet = KMS.deriveAccount(this.mnemonic, index);
    // Note: In production, the provider would be attached here or passed in.
    return wallet.signTransaction(transaction);
  }

  /**
   * Signs a plaintext message.
   */
  public async signMessage(index: number, message: string): Promise<string> {
    if (!this.mnemonic) throw new Error('Wallet not initialized.');
    
    const wallet = KMS.deriveAccount(this.mnemonic, index);
    return wallet.signMessage(message);
  }

  /**
   * Exports the wallet state in an encrypted format for persistence.
   */
  public async exportEncrypted(password: string) {
    if (!this.mnemonic) throw new Error('No mnemonic to export.');
    return KMS.encrypt(this.mnemonic, password);
  }

  public getAccounts(): WalletAccount[] {
    return this.accounts;
  }

  public getMnemonic(): string | null {
    return this.mnemonic;
  }
}

