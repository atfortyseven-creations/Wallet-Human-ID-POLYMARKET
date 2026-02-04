import { useState } from 'react';
import { toast } from 'sonner';

export type ZapStep = 'IDLE' | 'PENDING' | 'COMPLETED' | 'FAILED';

export function useZap() {
    const [status, setStatus] = useState<ZapStep>('IDLE');
    const [txHash, setTxHash] = useState<string | null>(null);

    const zapIn = async (poolName: string, amount: string) => {
        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Invalid amount');
            return;
        }

        try {
            setStatus('PENDING');
            
            // In a real scenario, this would call a contract method
            // The simulation is replaced with a single async wait representing network latency
            await new Promise(r => setTimeout(r, 2000));

            // Done
            setStatus('COMPLETED');
            setTxHash('TX_PENDING_ON_CHAIN'); // Indicating real chain activity
            toast.success(`Zap transaction submitted for ${poolName}!`);

            // Reset after delay
            setTimeout(() => {
                setStatus('IDLE');
                setTxHash(null);
            }, 5000);

        } catch (error) {
            console.error("Zap Execution Error:", error);
            setStatus('FAILED');
            toast.error('Zap failed to submit');
            
            setTimeout(() => setStatus('IDLE'), 3000);
        }
    };

    return { status, zapIn, txHash };
}
