"use client";

import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/src/context/LanguageContext";
import { State } from "wagmi";
import { SettingsProvider } from "@/src/context/SettingsContext";
import { AppProvider } from "@/components/AppContext";
import dynamic from 'next/dynamic';

const ClientWeb3Provider = dynamic(() => import('@/components/ClientWeb3Provider'), {
    ssr: true // Enable SSR so context exists during build
});

export default function Providers({ children, initialState }: { children: React.ReactNode, initialState?: State }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <ClientWeb3Provider cookies={null}>
                <AppProvider>
                    <SettingsProvider>
                        <LanguageProvider>
                            {children}
                        </LanguageProvider>
                    </SettingsProvider>
                </AppProvider>
            </ClientWeb3Provider>
        </ThemeProvider>
    );
}
