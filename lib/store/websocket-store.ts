import { create } from 'zustand';
import { toast } from 'sonner';
import { formatUnits } from 'viem';
import { safeToFixed } from '@/lib/utils/number-format';
import { transactionNotifier } from '@/lib/wallet/transaction-notifier';

// Common Types
export interface WhaleEvent {
  hash: string;
  wallet: string;
  token: string;
  amount: number;
  usdValue: number;
  action: string;
  dex: string;
  tier: string;
  timestamp: string;
  chain?: string;
}

export interface AkashicRecord {
  id: string;
  chain: string;
  amount: string;
  amountUsd: number;
  from: string;
  to: string;
  editorial: string;
  timestamp: string;
  blockNumber: number;
  hash: string;
}

interface WebSocketState {
  ws: WebSocket | null;
  isConnected: boolean;
  reconnectAttempts: number;
  whaleEvents: WhaleEvent[];
  akashicData: { ok: boolean; total: number; records: AkashicRecord[]; nextEntry: string; lastUpdated: string } | null;
  lastAlchemyTx: any;
  
  // Actions
  connectAlchemy: (address: string) => void;
  disconnect: () => void;
  addWhaleEvent: (event: WhaleEvent) => void;
  setWhaleEvents: (events: WhaleEvent[]) => void;
  setAkashicData: (data: any) => void;
}

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  ws: null,
  isConnected: false,
  reconnectAttempts: 0,
  whaleEvents: [],
  akashicData: null,
  lastAlchemyTx: null,

  connectAlchemy: (address: string) => {
    const { ws, reconnectAttempts } = get();
    if (ws && ws.readyState === WebSocket.OPEN) return;

    const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
    if (!apiKey) {
      console.warn('[Zustand WS] NEXT_PUBLIC_ALCHEMY_API_KEY missing');
      return;
    }

    try {
      const newWs = new WebSocket(`wss://eth-mainnet.g.alchemy.com/v2/${apiKey}`);

      newWs.onopen = () => {
        console.log(' [Zustand WS] Global Socket Connected');
        set({ isConnected: true, ws: newWs, reconnectAttempts: 0 });

        newWs.send(JSON.stringify({
          jsonrpc: "2.0", id: 1, method: "eth_subscribe",
          params: ["alchemy_pendingTransactions", { toAddress: [address], hashesOnly: false }]
        }));
      };

      newWs.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.method === 'eth_subscription' && message.params?.result) {
            const tx = message.params.result;
            const isIncoming = tx.to?.toLowerCase() === address.toLowerCase();
            
            if (isIncoming) {
              set({ lastAlchemyTx: tx });
              
              let amount = '0';
              let symbol = 'ETH';
              if (tx.value && tx.value !== '0x0') {
                  const ethValue = formatUnits(BigInt(tx.value), 18);
                  amount = parseFloat(safeToFixed(ethValue, 4)).toString();
              } else if (tx.input && tx.input.length > 10) {
                  symbol = 'Tokens';
              }

              transactionNotifier.notify({
                  hash: tx.hash,
                  amount: amount,
                  symbol,
                  usdValue: parseFloat(amount) * 2500, // mock fallback
                  source: 'wallet', type: 'incoming',
                  timestamp: Date.now(), chainId: 1
              });
            }
          }
          
          // MOCK: If we receive global whale events from another channel in the same WS or custom backend
          if (message.type === 'WHALE_EVENT_STREAM') {
             get().addWhaleEvent(message.data);
          }

        } catch (e) {
          console.error('[Zustand WS] Parse error:', e);
        }
      };

      newWs.onerror = () => set({ isConnected: false });

      newWs.onclose = () => {
        set({ isConnected: false, ws: null });
        const attempts = get().reconnectAttempts;
        if (attempts < 5) {
          set({ reconnectAttempts: attempts + 1 });
          setTimeout(() => get().connectAlchemy(address), 5000 * (attempts + 1));
        }
      };

    } catch (e) {
      console.error('[Zustand WS] Connection failed:', e);
    }
  },

  disconnect: () => {
    const { ws } = get();
    if (ws) {
      ws.close();
      set({ ws: null, isConnected: false });
    }
  },
  
  addWhaleEvent: (event: WhaleEvent) => {
    set((state) => ({ whaleEvents: [event, ...state.whaleEvents].slice(0, 500) }));
  },
  
  setWhaleEvents: (events: WhaleEvent[]) => {
    set({ whaleEvents: events });
  },

  setAkashicData: (data: any) => {
    set({ akashicData: data });
  }

}));
