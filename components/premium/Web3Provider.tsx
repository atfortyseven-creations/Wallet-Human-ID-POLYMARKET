"use client";

import { useEffect, useState, ReactNode } from 'react';
import { createConfig, WagmiProvider, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createClient } from 'viem';

// Requires: npm install wagmi viem @tanstack/react-query
export const config = createConfig({
  chains: [mainnet],
  client({ chain }) {
    return createClient({ chain, transport: http() })
  },
});

const queryClient = new QueryClient();

export default function Web3Provider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
     setMounted(true);
  }, []);

  if (!mounted) {
      // Prevent hydration errors by not rendering wagmi context on server
      return <>{children}</>;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
