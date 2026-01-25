'use client';

import { useAccount, useSwitchChain } from 'wagmi';
import { useEffect, useState } from 'react';

const REQUIRED_CHAIN_ID = 137; // Polygon Mainnet

export default function NetworkGuard() {
    const { chainId, isConnected } = useAccount();
    const { switchChain } = useSwitchChain();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Solo mostrar si está conectado y en la red incorrecta
    if (!isClient || !isConnected || chainId === REQUIRED_CHAIN_ID) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
            <div className="bg-zinc-900 border border-red-900/50 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
                <div className="mx-auto w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                    <svg
                        className="w-8 h-8 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">Red Incorrecta</h2>
                <p className="text-zinc-400 mb-8">
                    Esta aplicación solo funciona en Polygon Mainnet. Por favor cambia de red para continuar.
                </p>

                <button
                    onClick={() => switchChain({ chainId: REQUIRED_CHAIN_ID })}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <img
                        src="https://cryptologos.cc/logos/polygon-matic-logo.png"
                        alt="Polygon"
                        className="w-5 h-5"
                    />
                    Cambiar a Polygon
                </button>
            </div>
        </div>
    );
}
