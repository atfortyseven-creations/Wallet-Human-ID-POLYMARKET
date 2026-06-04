import { ethers } from 'ethers';
import { ChainId } from './blockchain/BlockchainService';

const SCAN_API_MAP: Record<number, string> = {
  [ChainId.MAINNET]: 'https://api.etherscan.io/api',
  [ChainId.POLYGON]: 'https://api.polygonscan.com/api',
  [ChainId.ARBITRUM]: 'https://api.arbiscan.io/api',
  [ChainId.BASE]: 'https://api.basescan.org/api',
  [ChainId.OPTIMISM]: 'https://api-optimistic.etherscan.io/api',
  [ChainId.BSC]: 'https://api.bscscan.com/api',
  [ChainId.AVALANCHE]: 'https://api.snowtrace.io/api', // Note: Snowtrace moved, check API availability
  [ChainId.WORLDCHAIN]: 'https://api.worldscan.org/api' 
};

const API_KEYS: Record<number, string> = {
  [ChainId.MAINNET]: process.env.ETHERSCAN_API_KEY || '',
  [ChainId.POLYGON]: process.env.POLYGONSCAN_API_KEY || process.env.ETHERSCAN_API_KEY || '',
  [ChainId.ARBITRUM]: process.env.ARBISCAN_API_KEY || process.env.ETHERSCAN_API_KEY || '',
  [ChainId.BASE]: process.env.BASESCAN_API_KEY || process.env.ETHERSCAN_API_KEY || '',
  [ChainId.OPTIMISM]: process.env.OPTIMISM_API_KEY || process.env.ETHERSCAN_API_KEY || '',
  [ChainId.BSC]: process.env.BSCSCAN_API_KEY || '',
  [ChainId.WORLDCHAIN]: '' // Free?
};

interface ScanBalance {
  balance: string;
}

interface ScanTokenBalance {
  contractAddress: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  balance: string;
}

/**
 * Universal Scan API Fetcher
 * Works for Etherscan, Polygonscan, Basescan, etc.
 */
export class ScanApi {

    static getBaseUrl(chainId: number) {
        return SCAN_API_MAP[chainId];
    }

    static getApiKey(chainId: number) {
        return API_KEYS[chainId] || '';
    }

    /**
     * Get Native Balance (ETH, MATIC, BNB)
     */
    static async getNativeBalance(chainId: number, address: string): Promise<string> {
        const baseUrl = this.getBaseUrl(chainId);
        if (!baseUrl) return '0';

        try {
            const url = `${baseUrl}?module=account&action=balance&address=${address}&tag=latest&apikey=${this.getApiKey(chainId)}`;
            const res = await fetch(url);
            const data = await res.json();
            
            if (data.status === '1' && data.result) {
                return data.result; // Wei
            }
            return '0';
        } catch (e) {
            console.error(`[ScanApi] Failed native balance for chain ${chainId}`, e);
            return '0';
        }
    }

    /**
     * Discover tokens via Transaction History (TokenTx)
     * This avoids needing an indexer like Alchemy
     */
    static async getPortfolio(chainId: number, address: string) {
        const baseUrl = this.getBaseUrl(chainId);
        if (!baseUrl) return { tokens: [], nfts: [] };
        
        console.log(`[ScanApi]  Scanning Chain ${chainId} for ${address}...`);

        try {
            // 1. Get Token Transfer History (to find contracts)
            const url = `${baseUrl}?module=account&action=tokentx&address=${address}&startblock=0&endblock=999999999&sort=desc&apikey=${this.getApiKey(chainId)}`;
            const res = await fetch(url);
            const data = await res.json();
            
            if (data.status !== '1' || !Array.isArray(data.result)) {
                return { tokens: [], nfts: [] };
            }

            // 2. Identify unique tokens
            const contracts = new Set<string>();
            data.result.slice(0, 100).forEach((tx: any) => {
                if (tx.contractAddress) contracts.add(tx.contractAddress.toLowerCase());
            });

            // 3. Check balances for discovered contracts
            // Parallelize but limit concurrency to avoid rate limits (5/sec usually)
            const tokens: ScanTokenBalance[] = [];
            
            // Chunk detection
            const contractList = Array.from(contracts);
            const BATCH_SIZE = 3; // Conservative for public APIs
            
            for (let i = 0; i < contractList.length; i += BATCH_SIZE) {
                const batch = contractList.slice(i, i + BATCH_SIZE);
                const results = await Promise.all(batch.map(async (addr) => {
                    try {
                        const balUrl = `${baseUrl}?module=account&action=tokenbalance&contractaddress=${addr}&address=${address}&tag=latest&apikey=${this.getApiKey(chainId)}`;
                        const balRes = await fetch(balUrl);
                        const balData = await balRes.json();
                        
                        if (balData.status === '1' && balData.result && balData.result !== '0') {
                            // Fetch Metadata if balance > 0
                            // Note: 'tokeninfo' might not exist on all clones, so we fallback to history metadata if needed
                            // Optimization: Use metadata from the 'tokentx' list if possible?
                            // Let's try to find metadata from the tx history first to save a call.
                            const txInfo = data.result.find((t: any) => t.contractAddress.toLowerCase() === addr);
                            
                            return {
                                contractAddress: addr,
                                tokenName: txInfo?.tokenName || 'Unknown',
                                tokenSymbol: txInfo?.tokenSymbol || 'UNK',
                                tokenDecimal: txInfo?.tokenDecimal || '18',
                                balance: balData.result
                            };
                        }
                    } catch (e) { return null; }
                    return null;
                }));
                
                results.forEach(r => { if (r) tokens.push(r); });
                
                // Tiny delay to be nice to public APIs
                await new Promise(r => setTimeout(r, 200)); 
            }

            return { tokens, nfts: [] }; // NFTs optional for now on L2
        } catch (e) {
            console.error(`[ScanApi] Error scanning chain ${chainId}:`, e);
            return { tokens: [], nfts: [] };
        }
    }
    
    /**
     * Get History for Activity Feed
     */
    static async getHistory(chainId: number, address: string) {
         const baseUrl = this.getBaseUrl(chainId);
         if (!baseUrl) return [];
         
         try {
             const [tx, tokenTx] = await Promise.all([
                 fetch(`${baseUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=20&sort=desc&apikey=${this.getApiKey(chainId)}`).then(r => r.json()),
                 fetch(`${baseUrl}?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&page=1&offset=20&sort=desc&apikey=${this.getApiKey(chainId)}`).then(r => r.json())
             ]);
             
             const txs = (tx.status === '1' && Array.isArray(tx.result)) ? tx.result : [];
             const tokens = (tokenTx.status === '1' && Array.isArray(tokenTx.result)) ? tokenTx.result : [];
             
             // Normalize
             const nTxs = txs.map((t:any) => ({
                 hash: t.hash,
                 from: t.from,
                 to: t.to,
                 value: parseFloat(ethers.formatEther(t.value)),
                 asset: 'Native',
                 category: 'external',
                 timestamp: new Date(parseInt(t.timeStamp)*1000).toISOString(),
                 chainId
             }));
             
             const nTokens = tokens.map((t:any) => ({
                 hash: t.hash,
                 from: t.from,
                 to: t.to,
                 value: parseFloat(ethers.formatUnits(t.value, t.tokenDecimal)),
                 asset: t.tokenSymbol,
                 category: 'erc20',
                 timestamp: new Date(parseInt(t.timeStamp)*1000).toISOString(),
                 chainId
             }));
             
             return [...nTxs, ...nTokens].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 50);
             
         } catch(e) {
             return [];
         }
    }
}

