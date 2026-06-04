/**
 * ============================================================
 * EIP-1193 PROVIDER INJECTION ENGINE
 * ============================================================
 * Emulates the exact architecture of `window.ethereum` (MetaMask).
 * Bridges raw JSON-RPC requests from generic dApps to our secure
 * internal wallet store. Supports signing, transaction mapping, 
 * and network switching natively.
 * ============================================================
 */

import { ethers } from 'ethers';
import { useWalletStore } from './store/wallet-store';

type EIP1193RequestArgs = {
  method: string;
  params?: unknown[] | object;
};

interface EIP1193Provider {
  request(args: EIP1193RequestArgs): Promise<unknown>;
  on(eventName: string, handler: (...args: any[]) => void): void;
  removeListener(eventName: string, handler: (...args: any[]) => void): void;
  isMetaMask: boolean;
  isConnected(): boolean;
}

/**
 * A highly structural class that mimics the standard EIP-1193 Provider API.
 * This class translates RPC methods to the internal `useWalletStore` logic,
 * allowing this wallet to theoretically be injected into a WebView or 
 * extension context as `window.ethereum`.
 */
export class HumanityLedgerProvider implements EIP1193Provider {
  public isMetaMask = true; // Spoof MetaMask for dApp compatibility
  private listeners: Map<string, Set<Function>> = new Map();

  constructor() {
    // Listen to our internal store changes to emit standard events
    useWalletStore.subscribe((state, prevState) => {
      if (state.address !== prevState.address) {
        this.emit('accountsChanged', state.address ? [state.address] : []);
      }
      if (state.activeNetwork !== prevState.activeNetwork) {
        const chainId = this._getChainIdFromNetwork(state.activeNetwork);
        this.emit('chainChanged', chainId);
      }
    });
  }

  public isConnected(): boolean {
    return true; // We assume the internal provider layer is always active
  }

  public on(eventName: string, handler: (...args: any[]) => void): void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName)!.add(handler);
  }

  public removeListener(eventName: string, handler: (...args: any[]) => void): void {
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      eventListeners.delete(handler);
    }
  }

  private emit(eventName: string, ...args: any[]): void {
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      eventListeners.forEach(handler => handler(...args));
    }
  }

  private _getChainIdFromNetwork(network: string): string {
    const map: Record<string, string> = {
      ethereum: '0x1',
      polygon: '0x89',
      arbitrum: '0xa4b1',
      optimism: '0xa',
      base: '0x2105',
    };
    return map[network] || '0x1';
  }

  /**
   * The core JSON-RPC routing mechanism.
   * Translates standard RPC methods to our strictly on-chain handlers.
   */
  public async request({ method, params = [] }: EIP1193RequestArgs): Promise<unknown> {
    const state = useWalletStore.getState();
    const argsArray = Array.isArray(params) ? params : [params];

    switch (method) {
      // 1. Account Discovery
      case 'eth_requestAccounts':
      case 'eth_accounts':
        if (!state.address || state.isLocked) {
          throw { code: 4100, message: "The requested account and/or method has not been authorized by the user." };
        }
        return [state.address];

      // 2. Chain Data
      case 'eth_chainId':
        return this._getChainIdFromNetwork(state.activeNetwork);

      // 3. Signing (Standard EIP-191)
      case 'personal_sign': {
        const [messageHex, address] = argsArray as [string, string];
        if (address.toLowerCase() !== state.address?.toLowerCase()) {
          throw { code: 4100, message: "Unauthorized address" };
        }
        const wallet = await state.getConnectedWallet();
        if (!wallet) throw { code: 4100, message: "Wallet locked" };
        
        // Ethers expects bytes or UTF8 for signMessage
        const messageBytes = ethers.getBytes(messageHex);
        return await wallet.signMessage(messageBytes);
      }

      // 4. Signing (EIP-712 Typed Data v4)
      case 'eth_signTypedData_v4': {
        const [address, typedDataJson] = argsArray as [string, string];
        if (address.toLowerCase() !== state.address?.toLowerCase()) {
          throw { code: 4100, message: "Unauthorized address" };
        }
        const wallet = await state.getConnectedWallet();
        if (!wallet) throw { code: 4100, message: "Wallet locked" };

        const typedData = typeof typedDataJson === 'string' ? JSON.parse(typedDataJson) : typedDataJson;
        
        // Remove EIP712Domain from types, as ethers wallet.signTypedData expects it separate
        const { EIP712Domain, ...types } = typedData.types;
        
        return await wallet.signTypedData(typedData.domain, types, typedData.message);
      }

      // 5. Transaction Broadcasting
      case 'eth_sendTransaction': {
        const [txParams] = argsArray as [any];
        if (txParams.from && txParams.from.toLowerCase() !== state.address?.toLowerCase()) {
          throw { code: 4100, message: "Unauthorized address" };
        }
        
        const wallet = await state.getConnectedWallet();
        if (!wallet) throw { code: 4100, message: "Wallet locked" };

        const formattedTx: ethers.TransactionRequest = {
          to: txParams.to,
          value: txParams.value,
          data: txParams.data,
          gasLimit: txParams.gas,
          maxFeePerGas: txParams.maxFeePerGas,
          maxPriorityFeePerGas: txParams.maxPriorityFeePerGas,
          type: 2
        };

        const txResponse = await wallet.sendTransaction(formattedTx);
        return txResponse.hash;
      }

      // 6. Network Switching (EIP-3326)
      case 'wallet_switchEthereumChain': {
        const [paramsObj] = argsArray as [{ chainId: string }];
        const targetNetwork = Object.keys(state).find(
          k => this._getChainIdFromNetwork(k) === paramsObj.chainId.toLowerCase()
        );
        
        if (targetNetwork) {
          state.setNetwork(targetNetwork as any);
          return null; // Return null on success per spec
        }
        throw { code: 4902, message: "Unrecognized chain ID" };
      }

      // Fallback: Read-only methods pass through to the live Provider
      default: {
        const wallet = await state.getConnectedWallet();
        if (!wallet || !wallet.provider) throw { code: 4100, message: "Provider unavailable" };
        return await (wallet.provider as any).send(method, argsArray);
      }
    }
  }
}

/**
 * Helper function that would be injected into the browser window object.
 */
export function injectProviderToWindow() {
  if (typeof window !== 'undefined') {
    (window as any).ethereum = new HumanityLedgerProvider();
    console.log("[EIP-1193] Humanity Ledger Provider Injected as window.ethereum");
  }
}
