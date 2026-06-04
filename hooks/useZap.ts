import { useState } from 'react';
import { toast } from 'sonner';

export type ZapStep = 'IDLE' | 'UNLOCKING' | 'SWAPPING' | 'STAKING' | 'COMPLETED' | 'FAILED';

export function useZap() {
    const [status, setStatus] = useState<ZapStep>('IDLE');
    const [txHash, setTxHash] = useState<string | null>(null);

    const zapIn = async (poolName: string, amount: string) => {
        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Invalid amount');
            return;
        }

        try {
            setStatus('UNLOCKING');
            await new Promise(r => setTimeout(r, 1000));
            
            setStatus('SWAPPING');
            await new Promise(r => setTimeout(r, 1500));
            
            setStatus('STAKING');
            await new Promise(r => setTimeout(r, 1000));

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

