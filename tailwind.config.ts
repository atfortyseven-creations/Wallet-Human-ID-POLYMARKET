import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    // System: darkMode is intentionally disabled platform-wide.
    // Using a phantom class that is never applied  dark: variants in JSX
    // are inert. The light-mode firewall in globals.css also overrides any
    // accidental .dark injection from AppKit/Wagmi disconnect cycles.
    darkMode: ['class', '.never-trigger-dark-mode-ever'],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Inter", "sans-serif"],
                mono: ["JetBrains Mono", "Fira Code", "monospace"],
            },
            colors: {
                // Sistema Void
                void: "#000000",
                obsidian: "#050505",
                surface: "#0a0a0c",

                // Sistema Glass
                "glass-border": "rgba(255, 255, 255, 0.08)",
                "glass-surface": "rgba(255, 255, 255, 0.03)",
                "glass-highlight": "rgba(255, 255, 255, 0.06)",

                // Semantic Accents
                midgard: { // Monochrome Identity
                    DEFAULT: "#ffffff", // Pure White
                    glow: "rgba(255, 255, 255, 0.5)",
                },
                asgard: { // Monochrome Accent
                    DEFAULT: "#cccccc", // Light Gray
                    glow: "rgba(204, 204, 204, 0.5)",
                }
            },
            backgroundImage: {
                "void-gradient": "none",
                "glass-gradient": "none",
            },
            animation: {
                "fade-in": "fadeIn 0.5s ease-out forwards",
                "slide-up": "slideUp 0.5s ease-out forwards",
                "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "subtle-zoom": "subtleZoom 20s ease-in-out infinite",
                "scan": "scan 8s linear infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                subtleZoom: {
                    "0%, 100%": { transform: "scale(1)" },
                    "50%": { transform: "scale(1.1)" },
                },
                scan: {
                    "0%": { transform: "translateY(-100%)" },
                    "100%": { transform: "translateY(1000%)" },
                },
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
};
export default config;
