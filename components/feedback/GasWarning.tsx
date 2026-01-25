'use client';

import { useBalance, useAccount } from 'wagmi';

export default function GasWarning() {
    const { address } = useAccount();

    const { data: balance } = useBalance({
        address,
    });

    // Si tiene menos de 0.01 MATIC (aprox)
    const isLowGas = balance && balance.value < 10000000000000000n; // 0.01 * 10^18

    if (!isLowGas) return null;

    return (
        <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg flex items-start gap-3">
            <div className="mt-0.5 text-yellow-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            </div>
            <div>
                <p className="text-sm text-yellow-200 font-medium">Bajo saldo de MATIC</p>
                <p className="text-xs text-yellow-400/80 mt-0.5">
                    Podrías no tener suficiente para pagar las comisiones de la red.
                </p>
            </div>
        </div>
    );
}
