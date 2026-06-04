/**
 * CWI (Custom Wallet Interface) - SirDeggen Edition Substrate
 * 10000% Compatibility Layer for BSV-Browser dApps
 */

export interface CwiExternalApi {
  /** Returns the public key of the identity key (m/0'/0') */
  getPublicKey(): Promise<string>;
  
  /** Signs a transaction or a set of actions */
  createAction(params: any): Promise<any>;
  
  /** Encrypts data for a counterparty */
  encrypt(params: { data: string | Uint8Array, counterparty?: string, protocolID?: string }): Promise<string>;
  
  /** Decrypts data from a counterparty */
  decrypt(params: { data: string, counterparty?: string, protocolID?: string }): Promise<string | Uint8Array>;
  
  /** Returns the current identity information */
  getIdentity?(): Promise<{ name: string, publicKey: string }>;
  
  /** List previously authorized actions */
  listActions?(params: any): Promise<any[]>;
}

export const CWI_PROTOCOL_VERSION = '1.42.0';
