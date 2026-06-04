"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";

/**
 * SystemThemeProvider
 *
 * This platform enforces light mode for ALL users  connected or disconnected.
 * `forcedTheme="light"` prevents next-themes from ever injecting the `dark`
 * class on the <html> element, regardless of:
 *   - system OS preference (prefers-color-scheme: dark)
 *   - localStorage persisted theme
 *   - Any upstream provider (AppKit / Wagmi) reconnect/disconnect lifecycle
 *
 * `disableTransitionOnChange` prevents a flash when the forced theme is applied.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="light"
            forcedTheme="light"
            disableTransitionOnChange
            enableSystem={false}
            {...props}
        >
            {children}
        </NextThemesProvider>
    );
}
