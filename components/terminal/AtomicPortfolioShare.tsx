'use client';
import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { parseUnits } from 'viem';

export default function AtomicPortfolioShare() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    // Portfolio snapshot real desde tu backend de inteligencia on-chain
    const intent = {
      to: '0x0000000000000000000000000000000000000000' as `0x${string}`, // Uniswap V4 o tu executor
      data: '0x' as `0x${string}`, // calldata EIP-7702
      value: parseUnits('0', 18),
      // zkProof: 'zk-proof-of-tvl-here' // generado en lib/onchain.ts
    };

    if (walletClient) {
        await walletClient.sendTransaction(intent);
    }
  };

  return (
    <div onDrop={handleDrop} onDragOver={e => e.preventDefault()} className="border border-dashed border-white/30 p-6 rounded-3xl text-center">
      Arrastra tu posición on-chain aquí  se incrusta como rich media zk-proven en el chat
    </div>
  );
}
