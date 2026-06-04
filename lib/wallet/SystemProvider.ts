import { privateKeyToAccount, LocalAccount } from 'viem/accounts';
import { createPublicClient, http, Chain } from 'viem';
import {
  mainnet, base, arbitrum, optimism, polygon, bsc,
  avalanche, zksync, linea, scroll, celo, mantle, blast, gnosis, moonbeam
} from 'viem/chains';
import { injected } from 'wagmi/connectors';

type Listener = (...args: any[]) => void;

interface RequestArguments {
  method: string;
  params?: any;
}

// Chain registry  resolves publicClient per active chain (BUG-05 FIX)
const CHAIN_REGISTRY: Record<number, Chain> = {
  [mainnet.id]:   mainnet,
  [base.id]:      base,
  [arbitrum.id]:  arbitrum,
  [optimism.id]:  optimism,
  [polygon.id]:   polygon,
  [bsc.id]:       bsc,
  [avalanche.id]: avalanche,
  [zksync.id]:    zksync,
  [linea.id]:     linea,
  [scroll.id]:    scroll,
  [celo.id]:      celo,
  [mantle.id]:    mantle,
  [blast.id]:     blast,
  [gnosis.id]:    gnosis,
  [moonbeam.id]:  moonbeam,
};

export class SystemEIP1193Provider {
  private account: LocalAccount | null = null;
  private activeChainId: number = mainnet.id; // BUG-05: track active chain
  private publicClient: any;
  private rpcUrl: string;
  private listeners: Record<string, Listener[]> = {};

  constructor(privateKey?: `0x${string}`) {
    if (privateKey) this.account = privateKeyToAccount(privateKey);
    this.rpcUrl = this._rpcUrlFor(mainnet);
    this.publicClient = this._buildClient(mainnet);
  }

  private _rpcUrlFor(chain: Chain): string {
    const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || 'demo';
    const networkSlug: Record<number, string> = {
      [mainnet.id]:   'eth-mainnet',
      [base.id]:      'base-mainnet',
      [arbitrum.id]:  'arb-mainnet',
      [optimism.id]:  'opt-mainnet',
      [polygon.id]:   'polygon-mainnet',
    };
    const slug = networkSlug[chain.id];
    if (slug) return `https://${slug}.g.alchemy.com/v2/${alchemyKey}`;
    // Fallback to public RPC for chains without Alchemy support
    return chain.rpcUrls.default.http[0] ?? `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`;
  }

  private _buildClient(chain: Chain) {
    return createPublicClient({ chain, transport: http(this._rpcUrlFor(chain)) });
  }

  injectPrivateKey(pk: `0x${string}`) {
    this.account = privateKeyToAccount(pk);
    this.emit('accountsChanged', [this.account.address]);
  }

  on(event: string, listener: Listener) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(listener);
  }

  removeListener(event: string, listener: Listener) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((l) => l !== listener);
    }
  }

  private emit(event: string, ...args: any[]) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((l) => l(...args));
    }
  }

  async request(args: RequestArguments): Promise<any> {
    const { method, params } = args;

    if (method === 'eth_requestAccounts' || method === 'eth_accounts') {
      return this.account ? [this.account.address] : [];
    }

    // BUG-05 FIX: return tracked chainId, not hardcoded '0x1'
    if (method === 'eth_chainId') return `0x${this.activeChainId.toString(16)}`;
    if (method === 'net_version') return String(this.activeChainId);

    if (method === 'wallet_requestPermissions') {
      if (!this.account) throw new Error('Vault locked');
      return [{ invoker: (typeof window !== 'undefined' ? window.location.origin : ''), parentCapability: 'eth_accounts', caveats: [] }];
    }

    // BUG-05 FIX: actual chain switching  rebuild publicClient
    if (method === 'wallet_switchEthereumChain') {
      const targetChainId = parseInt(params?.[0]?.chainId ?? '0x1', 16);
      const chain = CHAIN_REGISTRY[targetChainId];
      if (chain) {
        this.activeChainId = targetChainId;
        this.rpcUrl = this._rpcUrlFor(chain);
        this.publicClient = this._buildClient(chain);
        this.emit('chainChanged', `0x${targetChainId.toString(16)}`);
      }
      return null;
    }

    if (!this.account) {
      throw new Error(`System Vault Locked. Cannot execute ${method}`);
    }

    // BUG-05 FIX: chainId included for EIP-155 replay protection on all networks
    if (method === 'eth_sendTransaction') {
      const tx = params[0];
      const request = await this.publicClient.prepareTransactionRequest({
        account: this.account.address,
        chainId: this.activeChainId,
        to: tx.to,
        value: tx.value ? BigInt(tx.value) : 0n,
        data: tx.data,
        gas: tx.gas ? BigInt(tx.gas) : undefined,
        maxFeePerGas: tx.maxFeePerGas ? BigInt(tx.maxFeePerGas) : undefined,
        maxPriorityFeePerGas: tx.maxPriorityFeePerGas ? BigInt(tx.maxPriorityFeePerGas) : undefined,
        nonce: tx.nonce !== undefined ? Number(tx.nonce) : undefined,
      });
      const serialized = await this.account.signTransaction({
        ...request,
        chainId: this.activeChainId,
      } as any);
      return await this.publicClient.sendRawTransaction({ serializedTransaction: serialized });
    }

    if (method === 'personal_sign') {
      return await this.account.signMessage({ message: { raw: params[0] as `0x${string}` } });
    }

    if (method === 'eth_sign') {
      return await this.account.signMessage({ message: { raw: params[1] as `0x${string}` } });
    }

    if (method === 'eth_signTypedData_v4') {
      const typedData = JSON.parse(params[1]);
      return await this.account.signTypedData({
        domain: typedData.domain,
        types: typedData.types,
        primaryType: typedData.primaryType,
        message: typedData.message,
      } as any);
    }

    // Proxy all read-only methods to current chain RPC
    const response = await fetch(this.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
    });
    const json = await response.json();
    if (json.error) throw new Error(json.error.message);
    return json.result;
  }
}

//  Singleton 
let __systemProviderInstance: SystemEIP1193Provider | null = null;

export function getOrCreateSystemProvider(privateKey?: `0x${string}`) {
  if (!__systemProviderInstance) {
    __systemProviderInstance = new SystemEIP1193Provider(privateKey);
  } else if (privateKey) {
    __systemProviderInstance.injectPrivateKey(privateKey);
  }
  return __systemProviderInstance;
}

export const createSystemConnector = (pk?: `0x${string}`) =>
  injected({
    target: {
      id: 'systemVault',
      name: 'System Vault',
      provider: getOrCreateSystemProvider(pk) as any,
    },
  });
