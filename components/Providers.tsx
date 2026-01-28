"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, State } from "wagmi";
import { config } from "@/lib/wagmi-config";
import { useState } from "react";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/src/context/LanguageContext";
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { voidGlassTheme } from '@/components/theme/RainbowVoidTheme';
import '@rainbow-me/rainbowkit/styles.css';

export default function Providers({ children, initialState }: { children: React.ReactNode, initialState?: State }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000, // Datos frescos por 1 minuto
                refetchOnWindowFocus: false,
            },
        },
    }));

    return (
        <WagmiProvider config={config} initialState={initialState}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={voidGlassTheme} modalSize="compact">
                    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
                        <LanguageProvider>
                            {children}
                        </LanguageProvider>
                    </ThemeProvider>
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
