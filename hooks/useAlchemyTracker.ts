import { useEffect, useState } from 'react';
import { Alchemy, Network, AlchemySubscription } from 'alchemy-sdk';

export interface WhaleTransfer {
  hash: string;
  from: string;
  to: string;
  value: string;
  asset: string;
  timestamp: string;
}

export function useAlchemyTracker() {
  const [recentTransfers, setRecentTransfers] = useState<WhaleTransfer[]>([]);

  useEffect(() => {
    // We expect the user to provide an Alchemy API Key in their .env.local
    const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
    
    if (!apiKey) {
      console.warn("️ Alchemy API Key missing. Please add NEXT_PUBLIC_ALCHEMY_API_KEY to your .env.local. On-chain tracker disabled.");
      return;
    }

    const settings = {
        apiKey: apiKey,
        network: Network.ETH_MAINNET,
    };

    const alchemy = new Alchemy(settings);

    // USDC Smart Contract Address for tracking massive elite flows
    const USDC_ADDRESS = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

    // Subscription to pending transactions
    alchemy.ws.on(
      {
        method: AlchemySubscription.PENDING_TRANSACTIONS,
        toAddress: USDC_ADDRESS,
      },
      (tx) => {
        if (tx && tx.hash) {
            setRecentTransfers(prev => {
                const newTx: WhaleTransfer = {
                    hash: tx.hash,
                    from: tx.from,
                    to: tx.to || "Unknown Object",
                    value: "Pending...", // Detailed parsing requires transaction receipt, skipping for basic websocket speed
                    asset: "USDC",
                    timestamp: new Date().toLocaleTimeString()
                };
                
                // Keep only the latest 20 flows to avoid massive rerenders
                return [newTx, ...prev].slice(0, 20);
            });
        }
      }
    );

    return () => {
      // Cleanup WebSocket listeners on unmount
      alchemy.ws.removeAllListeners();
    };
  }, []);

  return { recentTransfers };
}
