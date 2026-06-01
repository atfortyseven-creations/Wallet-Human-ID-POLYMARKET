import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ethers } from 'ethers';
import { toast } from 'sonner';
import { getGbRpc, getGbWss } from '@/lib/blockchain/getblock-registry';
import CryptoJS from 'crypto-js';
import { TransactionManager } from '@/lib/tx-manager';
import { sealSessionKey, unsealSessionKey, clearSessionKey } from '@/lib/wallet-persistence';

// 100M-User Scalability & Enterprise Grid Configuration
export type NetworkId = 'ethereum' | 'polygon' | 'arbitrum' | 'optimism' | 'base' | 'avalanche' | 'bitcoin' | 'bsc' | 'zksync' | 'celo' | 'fantom' | 'linea' | 'scroll' | 'blast' | 'gnosis' | 'ronin' | 'kava' | 'mantle' | 'worldchain';
export type ProtocolType = 'RPC' | 'WSS';

export const NETWORKS: Record<NetworkId, { name: string; currency: string; rpc: string; wss: string; color: string; chainId: number }> = {
  ethereum: {
    name: 'Ethereum', currency: 'ETH', color: '#627EEA', chainId: 1,
    rpc: getGbRpc('eth')  || process.env.ETH_RPC_URL  || 'https://cloudflare-eth.com',
    wss: getGbWss('eth')  || 'wss://ethereum-rpc.publicnode.com',
  },
  polygon: {
    name: 'Polygon', currency: 'MATIC', color: '#8247E5', chainId: 137,
    rpc: getGbRpc('polygon') || 'https://polygon-rpc.com',
    wss: getGbWss('polygon') || 'wss://polygon-bor-rpc.publicnode.com',
  },
  arbitrum: {
    name: 'Arbitrum', currency: 'ETH', color: '#28A0F0', chainId: 42161,
    rpc: getGbRpc('arb') || 'https://arb1.arbitrum.io/rpc',
    wss: getGbWss('arb') || 'wss://arbitrum-one-rpc.publicnode.com',
  },
  optimism: {
    name: 'Optimism', currency: 'ETH', color: '#FF0420', chainId: 10,
    rpc: getGbRpc('op') || 'https://mainnet.optimism.io',
    wss: getGbWss('op') || 'wss://optimism-rpc.publicnode.com',
  },
  base: {
    name: 'Base', currency: 'ETH', color: '#0052FF', chainId: 8453,
    rpc: getGbRpc('base') || 'https://mainnet.base.org',
    wss: getGbWss('base') || 'wss://base-rpc.publicnode.com',
  },
  avalanche: {
    name: 'Avalanche', currency: 'AVAX', color: '#E84142', chainId: 43114,
    rpc: getGbRpc('avax') || 'https://api.avax.network/ext/bc/C/rpc',
    wss: getGbWss('avax') || 'wss://avalanche-c-chain-rpc.publicnode.com',
  },
  bitcoin: {
    name: 'Bitcoin', currency: 'BTC', color: '#F7931A', chainId: 0,
    rpc: 'https://blockstream.info/api/', // Rest API for native on-chain lookups
    wss: '',
  },
  bsc: {
    name: 'BNB Smart Chain', currency: 'BNB', color: '#F3BA2F', chainId: 56,
    rpc: 'https://bsc-dataseed.binance.org',
    wss: 'wss://bsc-ws-node.noko.network',
  },
  zksync: {
    name: 'zkSync Era', currency: 'ETH', color: '#8C8DFC', chainId: 324,
    rpc: 'https://mainnet.era.zksync.io',
    wss: 'wss://mainnet.era.zksync.io/ws',
  },
  celo: {
    name: 'Celo', currency: 'CELO', color: '#35D07F', chainId: 42220,
    rpc: 'https://forno.celo.org',
    wss: '',
  },
  fantom: {
    name: 'Fantom', currency: 'FTM', color: '#1969FF', chainId: 250,
    rpc: 'https://rpc.ftm.tools',
    wss: '',
  },
  linea: {
    name: 'Linea', currency: 'ETH', color: '#121212', chainId: 59144,
    rpc: 'https://rpc.linea.build',
    wss: '',
  },
  scroll: {
    name: 'Scroll', currency: 'ETH', color: '#FFE0AA', chainId: 534352,
    rpc: 'https://rpc.scroll.io',
    wss: '',
  },
  blast: {
    name: 'Blast', currency: 'ETH', color: '#FCFC03', chainId: 81457,
    rpc: 'https://rpc.blast.io',
    wss: '',
  },
  gnosis: {
    name: 'Gnosis', currency: 'XDAI', color: '#04795B', chainId: 100,
    rpc: 'https://rpc.gnosischain.com',
    wss: '',
  },
  ronin: {
    name: 'Ronin', currency: 'RON', color: '#1273EA', chainId: 2020,
    rpc: 'https://api.roninchain.com/rpc',
    wss: '',
  },
  kava: {
    name: 'Kava', currency: 'KAVA', color: '#FF433E', chainId: 2222,
    rpc: 'https://evm.kava.io',
    wss: '',
  },
  mantle: {
    name: 'Mantle', currency: 'MNT', color: '#65b3ae', chainId: 5000,
    rpc: 'https://rpc.mantle.xyz',
    wss: '',
  },
  worldchain: {
    name: 'World Chain', currency: 'ETH', color: '#000000', chainId: 480,
    rpc: 'https://worldchain-mainnet.g.alchemy.com/public',
    wss: '',
  }
};

export const CORE_TOKENS: CustomToken[] = [
  // MetaMask Defaults
  { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT", decimals: 6, logoURI: "https://cryptologos.cc/logos/tether-usdt-logo.png" },
  { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC", decimals: 6, logoURI: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png" },
  { address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", symbol: "DAI", decimals: 18, logoURI: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png" },
  { address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", symbol: "WBTC", decimals: 8, logoURI: "https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png" },
  { address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", symbol: "WETH", decimals: 18, logoURI: "https://cryptologos.cc/logos/ethereum-eth-logo.png" },
  { address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", symbol: "LINK", decimals: 18, logoURI: "https://cryptologos.cc/logos/chainlink-link-logo.png" },
  { address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", symbol: "UNI", decimals: 18, logoURI: "https://cryptologos.cc/logos/uniswap-uni-logo.png" },
  // Aztec Vision & Privacy/ZK Ecosystem
  { address: "0x0000000000000000000000000000000000000000", symbol: "AZTEC", decimals: 18, logoURI: "https://avatars.githubusercontent.com/u/55368309?v=4" }, // Placeholder Native AZTEC L2
  { address: "0x5A7d6b2F92C77FAD6CCaBd7EE0624E64907Eaf3E", symbol: "ZK", decimals: 18, logoURI: "https://cryptologos.cc/logos/zksync-zk-logo.png" },
  { address: "0xCa14007Eff0dB1C8135f4C25B34De49AB0d42766", symbol: "STRK", decimals: 18, logoURI: "https://cryptologos.cc/logos/starknet-strk-logo.png" },
  { address: "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32", symbol: "LDO", decimals: 18, logoURI: "https://cryptologos.cc/logos/lido-dao-ldo-logo.png" },
  { address: "0xc944E90C64B2c07662A292be6244BDf05Cae44CE", symbol: "GRT", decimals: 18, logoURI: "https://cryptologos.cc/logos/the-graph-grt-logo.png" },
  { address: "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72", symbol: "ENS", decimals: 18, logoURI: "https://cryptologos.cc/logos/ethereum-name-service-ens-logo.png" },
  { address: "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2", symbol: "MKR", decimals: 18, logoURI: "https://cryptologos.cc/logos/maker-mkr-logo.png" }
];

interface WalletAccount {
  address: string;
  privateKey: string | null;
  mnemonic?: string | null;
  label: string;
  isCustom: boolean;
}

// In-memory strictly local encryption key. Never leaves JS context.
let sessionEncryptionKey: string | null = null;

interface Contact {
  name: string;
  address: string;
}

interface CustomToken {
  address: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
}

interface TokenBalance extends CustomToken {
  balance: string;
}

interface WalletState {
  address: string | null;
  privateKey: string | null;
  mnemonic: string | null;
  btcAddress: string | null;
  btcPrivateKey: string | null;
  btcBalance: string;
  accounts: WalletAccount[];
  balance: string;
  isCustom: boolean;
  activeNetwork: NetworkId;
  activeProtocol: ProtocolType;
  isUpdatingBalance: boolean;
  transactions: any[];
  contacts: Contact[];
  customRpcUrl: string | null;
  customTokens: CustomToken[];
  tokenBalances: TokenBalance[];

  // Vault Security
  isLocked: boolean;
  passwordHash: string | null;
  encryptedVault: string | null;
  
  createWallet: () => void;
  importWallet: (privateKey: string, label?: string) => boolean;
  switchAccount: (address: string) => void;
  removeAccount: (address: string) => void;
  clearWallet: () => void; // Purges all accounts
  updateBalance: () => Promise<void>;
  sendTransaction: (to: string, amount: string, gasPriority?: 'low'|'medium'|'high') => Promise<string | null>;
  setNetwork: (network: NetworkId) => void;
  setProtocol: (protocol: ProtocolType) => void;
  setCustomRpcUrl: (url: string | null) => void;
  addContact: (name: string, address: string) => void;
  removeContact: (address: string) => void;
  addCustomToken: (address: string, symbol: string, decimals: number) => void;
  syncAddress: (address: string | null) => void;
  cloudSync: () => Promise<void>;
  restoreFromCloud: () => Promise<void>;

  // Security Operations
  setupPassword: (password: string) => void;
  unlockVault: (password: string) => boolean;
  autoUnlockVault: () => Promise<boolean>;
  lockVault: () => void;
  _encryptAndSave: () => void;
  getConnectedWallet: () => Promise<ethers.Wallet | null>;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      address: null,
      privateKey: null,
      mnemonic: null,
      btcAddress: null,
      btcPrivateKey: null,
      btcBalance: "0.0",
      accounts: [],
      balance: "0.0",
      isCustom: false,
      activeNetwork: 'polygon',
      activeProtocol: 'RPC',
      isUpdatingBalance: false,
      transactions: [],
      contacts: [],
      customRpcUrl: null,
      customTokens: [],
      tokenBalances: [],

      isLocked: false, // Initially false, but set to true on hydrate if passwordHash exists
      passwordHash: null,
      encryptedVault: null,

      setupPassword: (password: string) => {
          const cleanPassword = password.trim();
          const hash = CryptoJS.SHA256(cleanPassword).toString();
          sessionEncryptionKey = cleanPassword;
          set({ passwordHash: hash, isLocked: false });
          get()._encryptAndSave();
          sealSessionKey(cleanPassword);
          toast.success("Security Vault Initialized");
      },

      unlockVault: (password: string) => {
          const cleanPassword = password.trim();
          const { passwordHash, encryptedVault } = get();
          if (!passwordHash) return true;
          const hash = CryptoJS.SHA256(cleanPassword).toString();
          if (hash !== passwordHash) {
              toast.error("Decryption Failed", { description: "Invalid password provided." });
              return false;
          }
          sessionEncryptionKey = cleanPassword;
          sealSessionKey(cleanPassword);
          
          if (encryptedVault) {
              try {
                  const bytes = CryptoJS.AES.decrypt(encryptedVault, sessionEncryptionKey);
                  const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                  set({
                      accounts: decrypted.accounts || [],
                      address: decrypted.address || null,
                      privateKey: decrypted.privateKey || null,
                      mnemonic: decrypted.mnemonic || null,
                      isLocked: false,
                  });
                  get().updateBalance();
                  toast.success("Vault Unlocked");
                  return true;
              } catch (e) {
                  toast.error("Vault Corrupted", { description: "Could not decrypt vault data." });
                  return false;
              }
          }
          set({ isLocked: false });

          // [BRIDGE] wallet-store has a password hash but no encrypted vault.
          // This happens when the user created via CoreAuthGate (Portfolio) and
          // we later called storeSetupPassword() to sync — but _encryptAndSave()
          // ran before importWallet() populated the accounts array.
          // Attempt to load from system_accounts localStorage and re-seal.
          try {
              const raw = localStorage.getItem('system_accounts');
              if (raw) {
                  const accs = JSON.parse(raw);
                  if (Array.isArray(accs) && accs.length > 0) {
                      // We cannot decrypt AES-GCM here (async, no await in sync Zustand).
                      // Signal the login UI to fall through to System B by returning false
                      // only when no accounts are loaded at all.
                      const loaded = get().accounts;
                      if (!loaded || loaded.length === 0) {
                          console.warn('[vault-store] Vault empty — system_accounts present. Login page will handle via System B.');
                          return false; // Tell login page to try system_accounts
                      }
                  }
              }
          } catch {}

          return true;
      },

      autoUnlockVault: async () => {
          const { passwordHash, encryptedVault } = get();
          if (!passwordHash || !encryptedVault) return false;

          try {
              const storedSessionKey = await unsealSessionKey();
              if (!storedSessionKey) return false;

              const hash = CryptoJS.SHA256(storedSessionKey).toString();
              if (hash !== passwordHash) {
                  await clearSessionKey();
                  return false;
              }

              sessionEncryptionKey = storedSessionKey;
              const bytes = CryptoJS.AES.decrypt(encryptedVault, sessionEncryptionKey);
              const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
              
              set({
                  accounts: decrypted.accounts || [],
                  address: decrypted.address || null,
                  privateKey: decrypted.privateKey || null,
                  mnemonic: decrypted.mnemonic || null,
                  isLocked: false,
              });
              
              get().updateBalance();
              console.log("[Vault] Auto-unlocked via hardware-bound session.");
              return true;
          } catch (e) {
              console.error("[Vault] Auto-unlock failed:", e);
              await clearSessionKey();
              return false;
          }
      },

      lockVault: () => {
          const { passwordHash } = get();
          if (passwordHash) {
              sessionEncryptionKey = null;
              // REVOLUT-STYLE: We clear the private key from RAM (security),
              // but do NOT call clearSessionKey() here. The hardware-bound token
              // in IndexedDB survives the lock so autoUnlockVault() can restore
              // the session on the next page load without asking for a password.
              // clearSessionKey() is ONLY called in clearWallet() (explicit deletion).
              set({
                  isLocked: true,
                  privateKey: null,
                  mnemonic: null,
                  // We mask the private keys in the accounts array in memory when locked
                  accounts: get().accounts.map(a => ({ ...a, privateKey: null, mnemonic: null }))
              });
              toast.info("Vault Locked", { description: "Cryptographic memory wiped." });
          }
      },


      _encryptAndSave: () => {
          const state = get();
          if (state.passwordHash && sessionEncryptionKey) {
              const payload = {
                  accounts: state.accounts,
                  address: state.address,
                  privateKey: state.privateKey,
                  mnemonic: state.mnemonic
              };
              const encrypted = CryptoJS.AES.encrypt(JSON.stringify(payload), sessionEncryptionKey).toString();
              set({ encryptedVault: encrypted });
          }
      },

      setNetwork: (network: NetworkId) => {
        set({ activeNetwork: network, balance: "0.0" });
        get().updateBalance();
        toast.info(`Network Locked: ${NETWORKS[network].name}`);
      },

      setProtocol: (protocol: ProtocolType) => {
        set({ activeProtocol: protocol });
        toast.info(`Protocol Switch: ${protocol}`);
        get().updateBalance();
      },

      setCustomRpcUrl: (url: string | null) => {
        set({ customRpcUrl: url });
        if (url) {
           toast.info("Custom RPC Connected");
        } else {
           toast.info("Reset to Default RPC");
        }
        get().updateBalance();
      },

      addContact: (name: string, address: string) => {
        set(state => ({
           contacts: [...state.contacts.filter(c => c.address !== address), { name, address }]
        }));
        toast.success("Contact Saved");
        get()._encryptAndSave();
      },

      removeContact: (address: string) => {
        set(state => ({
           contacts: state.contacts.filter(c => c.address !== address)
        }));
        toast.info("Contact Removed");
        get()._encryptAndSave();
      },

      addCustomToken: (address: string, symbol: string, decimals: number) => {
        set(state => ({
          customTokens: [...state.customTokens.filter(t => t.address !== address), { address, symbol, decimals }]
        }));
        toast.success(`Token ${symbol} Tracked`);
        get()._encryptAndSave();
        get().updateBalance();
      },

      createWallet: () => {
        try {
          const wallet = ethers.Wallet.createRandom();
          const newAccount: WalletAccount = {
            address: wallet.address,
            privateKey: wallet.privateKey,
            mnemonic: wallet.mnemonic?.phrase || null,
            label: `System ${get().accounts.length + 1}`,
            isCustom: false,
          };

          set(state => ({
            accounts: [...state.accounts, newAccount],
            address: wallet.address,
            privateKey: wallet.privateKey,
            mnemonic: wallet.mnemonic?.phrase || null,
            btcAddress: `bc1q${wallet.address.toLowerCase().substring(2, 22)}`, // Simulated native P2WPKH
            btcPrivateKey: wallet.privateKey,
            btcBalance: "0.0",
            balance: "0.0",
            isCustom: false,
          }));

          toast.success("Secure Wallet Generated", {
            description: `Address: ${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
          });
          get()._encryptAndSave();
          get().updateBalance();
          get().cloudSync();
        } catch (error) {
          console.error("Failed to generate wallet:", error);
          toast.error("Generation Failed", { description: "Cryptographic entropy creation failed." });
        }
      },

      importWallet: (pk: string, label?: string) => {
        try {
          const formattedPk = pk.startsWith('0x') ? pk : `0x${pk}`;
          const wallet = new ethers.Wallet(formattedPk);
          
          const existingIndex = get().accounts.findIndex(a => a.address.toLowerCase() === wallet.address.toLowerCase());
          if (existingIndex !== -1) {
            set(state => {
              const updatedAccounts = [...state.accounts];
              updatedAccounts[existingIndex] = {
                ...updatedAccounts[existingIndex],
                privateKey: wallet.privateKey
              };
              return {
                accounts: updatedAccounts,
                address: wallet.address,
                privateKey: wallet.privateKey,
                mnemonic: null,
                isCustom: updatedAccounts[existingIndex].isCustom,
                balance: "0.0"
              };
            });
            get()._encryptAndSave();
            get().updateBalance();
            toast.success("Identity Unlocked", {
              description: `Active: ${get().accounts[existingIndex].label}`
            });
            return true;
          }

          const newAccount: WalletAccount = {
            address: wallet.address,
            privateKey: wallet.privateKey,
            mnemonic: null,
            label: label || `Imported ${get().accounts.length + 1}`,
            isCustom: true,
          };

          set(state => ({
            accounts: [...state.accounts, newAccount],
            address: wallet.address,
            privateKey: wallet.privateKey,
            mnemonic: null,
            btcAddress: `bc1q${wallet.address.toLowerCase().substring(2, 22)}`,
            btcPrivateKey: wallet.privateKey,
            btcBalance: "0.0",
            balance: "0.0",
            isCustom: true,
          }));
          
          toast.success("Identity Imported", {
            description: `Recovered: ${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
          });
          get()._encryptAndSave();
          get().updateBalance();
          return true;
        } catch (error) {
          console.error("Invalid private key during import:", error);
          toast.error("Import Rejected", { description: "Invalid institutional private key format." });
          return false;
        }
      },

      switchAccount: (address: string) => {
        const account = get().accounts.find(a => a.address.toLowerCase() === address.toLowerCase());
        if (account) {
          set({
            address: account.address,
            privateKey: account.privateKey,
            mnemonic: account.mnemonic || null,
            isCustom: account.isCustom,
            balance: "0.0"
          });
          get()._encryptAndSave();
          get().updateBalance();
          toast.success("Identity Switched", { description: `Active: ${account.label}` });
        }
      },

      removeAccount: (address: string) => {
        set(state => {
          const newAccounts = state.accounts.filter(a => a.address.toLowerCase() !== address.toLowerCase());
          let nextState: Partial<WalletState> = { accounts: newAccounts };
          
          if (state.address?.toLowerCase() === address.toLowerCase()) {
            const nextAccount = newAccounts[0] || null;
            nextState.address = nextAccount?.address || null;
            nextState.privateKey = nextAccount?.privateKey || null;
            nextState.mnemonic = nextAccount?.mnemonic || null;
            nextState.isCustom = nextAccount?.isCustom || false;
            nextState.balance = "0.0";
          }
          
          return nextState as WalletState;
        });
        get()._encryptAndSave();
        toast.info("Account Removed");
      },

      clearWallet: () => {
        set({ address: null, privateKey: null, mnemonic: null, accounts: [], balance: "0.0", isCustom: false, encryptedVault: null, passwordHash: null, isLocked: false });
        sessionEncryptionKey = null;
        clearSessionKey();
        toast.info("Registry Purged", { description: "All secure keys removed from local memory." });
      },

      updateBalance: async () => {
        const { address, activeNetwork, isUpdatingBalance } = get();
        if (!address || isUpdatingBalance) return;
        
        set({ isUpdatingBalance: true });

        try {
          const networkData = NETWORKS[activeNetwork];
          const provider = new ethers.JsonRpcProvider(networkData.rpc);

          let rawBalance = await provider.getBalance(address);
          const oldBalanceValue = parseFloat(get().balance || "0");
          let numericBalance = parseFloat(ethers.formatEther(rawBalance));
          
          if (oldBalanceValue > 0.0001 && numericBalance === 0) {
              await new Promise(r => setTimeout(r, 3000));
              try {
                  const retryBalance = await provider.getBalance(address);
                  numericBalance = parseFloat(ethers.formatEther(retryBalance));
              } catch(e) {}
          }
          
          const displayBalance = numericBalance === 0 ? "0.0" : numericBalance < 0.0001 ? "<0.0001" : numericBalance.toFixed(4);

          // Fetch Native BTC Balance (On-Chain Blockstream API)
          if (get().btcAddress) {
              try {
                  const btcRes = await fetch(`https://blockstream.info/api/address/${get().btcAddress}`);
                  if (btcRes.ok) {
                      const data = await btcRes.json();
                      const satoshis = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
                      set({ btcBalance: (satoshis / 100000000).toFixed(8) });
                  }
              } catch (e) {
                  // Fallback
              }
          }

          // We no longer spam the RPC for ERC20 tokens here. The portfolio API handles it.
          set({ balance: displayBalance });


        } catch (error) {
          console.error("Failed to sync balance:", error);
        } finally {
          set({ isUpdatingBalance: false });
        }
      },

      sendTransaction: async (to: string, amount: string, gasPriority: 'low'|'medium'|'high' = 'medium') => {
        const { privateKey, activeNetwork, activeProtocol, isLocked } = get();
        if (isLocked || !privateKey) {
          toast.error("READ-ONLY NODE ACTIVE", { description: "Cryptographic private key not found. Please initialize your Quantum Vault to sign transactions." });
          return null;
        }

        try {
          const networkData = NETWORKS[activeNetwork];
          let rpcUrl = get().customRpcUrl || networkData.rpc;
          
          const provider = activeProtocol === 'WSS' 
            ? new ethers.WebSocketProvider(networkData.wss)
            : new ethers.JsonRpcProvider(rpcUrl);

          const wallet = new ethers.Wallet(privateKey, provider);
          if (!ethers.isAddress(to)) {
            toast.error("Invalid Target", { description: "Invalid address format." });
            return null;
          }

          const value = ethers.parseEther(amount);
          const currentBalance = await provider.getBalance(wallet.address);
          
          let gasCost = 0n;
          let txParams: ethers.TransactionRequest = { to, value };

          try {
             const feeData = await provider.getFeeData();
             const gasEstimate = await wallet.estimateGas({ to, value });
             
             // EIP-1559 Calculation
             if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
                 const priorityMultiplier = gasPriority === 'high' ? 2.0 : gasPriority === 'low' ? 0.8 : 1.2;
                 const maxPriorityFeePerGas = BigInt(Math.floor(Number(feeData.maxPriorityFeePerGas) * priorityMultiplier));
                 
                 // If base fee is null, try to derive it or use fallback
                 let maxFeePerGas = feeData.maxFeePerGas;
                 if (gasPriority === 'high') {
                     maxFeePerGas = feeData.maxFeePerGas * 3n / 2n; // 50% increase max
                 }

                 txParams.maxPriorityFeePerGas = maxPriorityFeePerGas;
                 txParams.maxFeePerGas = maxFeePerGas;
                 txParams.type = 2; // EIP-1559
                 
                 gasCost = gasEstimate * maxFeePerGas;
             } else {
                 // Legacy fallback
                 const gasPrice = feeData.gasPrice || 1n;
                 txParams.gasPrice = gasPriority === 'high' ? gasPrice * 120n / 100n : gasPrice;
                 gasCost = gasEstimate * txParams.gasPrice;
             }
             
             txParams.gasLimit = gasEstimate * 110n / 100n; // 10% buffer
          } catch (gasError) {
             console.error("Gas Error:", gasError);
             toast.error("Execution Unviable", { description: "Simulation failed. Check funds or network rules." });
             return null;
          }

          if (currentBalance < (value + gasCost)) {
            toast.error("Capital Depleted", { description: "Insufficient funds for value + gas." });
            return null;
          }

          toast.loading("Broadcasting Transaction...", { id: "tx-broadcast" });
          
          const txManager = new TransactionManager(wallet);
          const safeNonce = await txManager.getSafeNextNonce();
          txParams.nonce = safeNonce;

          const tx = await wallet.sendTransaction(txParams);

          toast.success("Broadcast Successful", { 
            id: "tx-broadcast",
            description: `Hash: ${tx.hash.slice(0, 8)}...${tx.hash.slice(-6)}`
          });

          await get().updateBalance();
          return tx.hash;
        } catch (error: any) {
          console.error("Transaction Error:", error);
          toast.error("Transaction Reverted", { 
            id: "tx-broadcast",
            description: error?.reason || error?.message || "Execution failed."
          });
          return null;
        }
      },

      getConnectedWallet: async () => {
          const { privateKey, activeNetwork, activeProtocol, isLocked } = get();
          if (isLocked || !privateKey) return null;
          const networkData = NETWORKS[activeNetwork];
          let rpcUrl = get().customRpcUrl || networkData.rpc;
          const provider = activeProtocol === 'WSS' 
            ? new ethers.WebSocketProvider(networkData.wss)
            : new ethers.JsonRpcProvider(rpcUrl);
          return new ethers.Wallet(privateKey, provider);
      },
      
      syncAddress: (addr: string | null) => {
        const { address, accounts } = get();
        if (address === addr) return;
        
        if (addr) {
          const existing = accounts.find(a => a.address.toLowerCase() === addr.toLowerCase());
          if (existing) {
            set({
              address: existing.address,
              privateKey: existing.privateKey,
              mnemonic: existing.mnemonic || null,
              isCustom: existing.isCustom,
              balance: "0.0"
            });
          } else {
            set({ address: addr, privateKey: null, mnemonic: null, balance: "0.0", isCustom: false });
          }
          get().updateBalance();
        } else {
          if (!get().privateKey) {
            set({ address: null, balance: "0.0" });
          }
        }
      },

      cloudSync: async () => {
        const { accounts, address } = get();
        if (accounts.length === 0) return;

        try {
          await fetch('/api/wallets/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-web3-address': address || accounts[0].address
            },
            body: JSON.stringify({
              wallets: accounts.map(a => ({ address: a.address, label: a.label }))
            })
          });
        } catch (e) {
          console.error("[CLOUD-SYNC] Error:", e);
        }
      },

      restoreFromCloud: async () => {
        const { address } = get();
        if (!address) return;
        try {
          const res = await fetch('/api/wallets/sync', {
              headers: { 'x-web3-address': address }
          });
          const { wallets } = await res.json();
          if (wallets && wallets.length > 0) {
              const currentAccounts = get().accounts;
              const newAccounts = [...currentAccounts];
              
              wallets.forEach((w: any) => {
                  if (!newAccounts.find(a => a.address.toLowerCase() === w.address.toLowerCase())) {
                      newAccounts.push({
                          address: w.address,
                          privateKey: null, 
                          label: w.label || 'Recovered',
                          isCustom: false
                      });
                  }
              });
              
              set({ accounts: newAccounts });
              if (!get().address && newAccounts.length > 0) {
                  get().switchAccount(newAccounts[0].address);
              }
          }
        } catch (e) {
          console.error("[CLOUD-RESTORE] Error:", e);
        }
      }
    }),
    {
      name: 'whale-system-wallet-registry-v3', // Bumped for encryption
      partialize: (state) => {
        // EXTREMELY CRITICAL: Never serialize privateKey, mnemonic, or plaintext accounts!
        // If passwordHash exists, we ONLY save the encryptedVault.
        if (state.passwordHash) {
             return {
                 address: state.address, // Public address is safe
                 isCustom: state.isCustom,
                 activeNetwork: state.activeNetwork,
                 activeProtocol: state.activeProtocol,
                 passwordHash: state.passwordHash,
                 encryptedVault: state.encryptedVault,
                 // We store masked accounts so the UI knows they exist, but without keys
                 accounts: state.accounts.map(a => ({ ...a, privateKey: null, mnemonic: null })),
                 isLocked: true // Force lock on fresh page load to prevent stuck "unlocked but keyless" UI states
             } as Partial<WalletState>;
        }
        // Legacy fallback if no password is set yet
        return { 
          address: state.address, 
          privateKey: state.privateKey, 
          mnemonic: state.mnemonic,
          accounts: state.accounts,
          isCustom: state.isCustom,
          activeNetwork: state.activeNetwork,
          activeProtocol: state.activeProtocol
        } as Partial<WalletState>;
      },
      onRehydrateStorage: () => (state) => {
          // No direct mutation here since Zustand state is immutable.
          // The isLocked: true in partialize ensures correct hydration.
      }
    }
  )
);

export const useWalletBalance = () => useWalletStore((state) => state.balance);
export const useWalletAddress = () => useWalletStore((state) => state.address);
export const useWalletNetwork = () => useWalletStore((state) => state.activeNetwork);
export const useWalletIsUpdating = () => useWalletStore((state) => state.isUpdatingBalance);
export const useWalletAccounts = () => useWalletStore((state) => state.accounts);
