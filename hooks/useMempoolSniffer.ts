import { useEffect, useState } from 'react';

export interface PendingWhaleTx {
    hash: string;
    from: string;
    to: string;
    valueEth: number;
    timestamp: number;
}

export function useMempoolSniffer() {
    const [pendingTxs, setPendingTxs] = useState<PendingWhaleTx[]>([]);
    const [status, setStatus] = useState<'CONNECTING' | 'CONNECTED' | 'ERROR'>('CONNECTING');

    useEffect(() => {
        const eventSource = new EventSource('/api/whales/mempool-sse');

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'MEMPOOL_CONNECTED') {
                    setStatus('CONNECTED');
                } else if (data.type === 'PENDING_WHALE') {
                    setPendingTxs((prev) => [data, ...prev].slice(0, 50)); // Keep last 50
                } else if (data.type === 'MEMPOOL_ERROR') {
                    setStatus('ERROR');
                }
            } catch (e) {
                console.error('Mempool parse error', e);
            }
        };

        eventSource.onerror = () => {
            setStatus('ERROR');
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, []);

    return { pendingTxs, status };
}
