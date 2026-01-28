"use client";

import { Web3ModalProvider } from "@/config/appkit";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/src/context/LanguageContext";
import { State } from "wagmi";

export default function Providers({ children, initialState }: { children: React.ReactNode, initialState?: State }) {
    return (
        <Web3ModalProvider cookies={null}>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
                <LanguageProvider>
                    {children}
                </LanguageProvider>
            </ThemeProvider>
        </Web3ModalProvider>
    );
}
