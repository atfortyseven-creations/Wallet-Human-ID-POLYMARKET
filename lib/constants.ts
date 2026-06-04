/**
 * WHALE ALERT NETWORK - INSTITUTIONAL CONSTANTS
 * 
 * Centralized registry for visual assets, identities, and system parameters.
 */

export const VISUAL_ASSETS = {
    WALLPAPER: '/patron-cosmico-4k.png',
    WAVES: '/olas-hokusai-4k.png',
    LOGO_MONOCHROME: '/official-whale-monochrome.png',
    LOGO_LEGENDARY: '/official-whale-legendary.png',
    WALLETS: {
        METAMASK: '/wallets/metamask.svg',
        COINBASE: '/wallets/coinbase.png',
        RAINBOW: '/wallets/rainbow.png',
        GENERIC: '/official-whale-monochrome.png', // Fallback
    }
};

export const SYSTEM_THEME = {
    BG: '#FFFFFF', // Institutional Ivory-and-Ink Standard
    INK: '#0A0A0A',
    MUTED: 'rgba(10, 10, 10, 0.60)',
    ACCENT: '#0044CC', // Blue highlight
};

export const OWNER_EMAILS = [
    'humanityledger@gmail.com',
    'josemanx2000@gmail.com',
    'admin@polymarketwallet.com'
];

/**
 * [SECURITY] Whitelisted wallet addresses for administrative functions.
 * Universal connection is enabled, but these addresses retain elevated privileges.
 */
export const OWNER_WALLETS = [
    '0x66c5D65f7560e90967F57e753e19E92e62BC2390', // Primary Owner
];
