'use client';

import React, { useEffect } from 'react';
import { useWalletConnectStore } from '@/lib/store/wallet-connect-store';
import { createWeb3Wallet } from '@/lib/walletconnect/walletKit';
import { SessionProposalModal } from './SessionProposalModal';
import { SessionRequestModal } from './SessionRequestModal';

export function WalletConnectProvider() {
    const { isInitialized } = useWalletConnectStore();

    useEffect(() => {
        // Initialize the Web3Wallet client asynchronously on mount
        createWeb3Wallet().catch(console.error);
    }, []);

    // If it's not initialized yet, we still render nothing. 
    // The store will trigger re-renders when proposals/requests come in.
    return (
        <>
            <SessionProposalModal />
            <SessionRequestModal />
        </>
    );
}
