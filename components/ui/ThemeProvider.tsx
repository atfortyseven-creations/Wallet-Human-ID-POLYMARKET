"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * SystemThemeProvider (ui/ThemeProvider)
 *
 * Mirror of components/providers/ThemeProvider  both enforce
 * forcedTheme="light" so that whichever import path is used,
 * next-themes always locks to light.
 */
export function ThemeProvider({ children, ...props }: any) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="light"
            forcedTheme="light"
            enableSystem={false}
            disableTransitionOnChange
            {...props}
        >
            {children}
        </NextThemesProvider>
    );
}
