'use client'

import React, { ReactNode } from 'react'
import { WagmiProvider, State, cookieToInitialState } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/src/config/wagmi'

export default function Web3Provider({
    children,
    initialState,
}: {
    children: ReactNode
    initialState?: State
}) {
    const [queryClient] = React.useState(() => new QueryClient())

    return (
        <WagmiProvider config={config} initialState={initialState}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </WagmiProvider>
    )
}
