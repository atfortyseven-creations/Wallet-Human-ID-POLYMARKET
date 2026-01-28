import { Theme } from '@rainbow-me/rainbowkit';

// HUMANID.FI // VOID GLASS THEME
export const voidGlassTheme: Theme = {
    blurs: {
        modalOverlay: 'blur(20px)',
    },
    colors: {
        accentColor: 'rgba(0, 242, 234, 0.1)', // #00f2ea
        accentColorForeground: '#00f2ea',
        actionButtonBorder: 'rgba(255, 255, 255, 0.1)',
        actionButtonBorderMobile: 'rgba(255, 255, 255, 0.1)',
        actionButtonSecondaryBackground: 'rgba(0, 0, 0, 0.4)',
        closeButton: '#888899',
        closeButtonBackground: 'transparent',
        connectButtonBackground: 'rgba(0, 0, 0, 0.6)',
        connectButtonBackgroundError: '#ff0000',
        connectButtonInnerBackground: 'linear-gradient(0deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1))',
        connectButtonText: '#ffffff',
        connectButtonTextError: '#ffffff',
        connectionIndicator: '#00ff9d',
        downloadBottomCardBackground: '"rgba(255, 255, 255, 0.1)"',
        downloadTopCardBackground: '"rgba(255, 255, 255, 0.1)"',
        error: '#ff0000',
        generalBorder: 'rgba(255, 255, 255, 0.1)',
        generalBorderDim: 'rgba(255, 255, 255, 0.05)',
        menuItemBackground: 'rgba(255, 255, 255, 0.05)',
        modalBackdrop: 'rgba(0, 0, 0, 0.8)',
        modalBackground: '#050510',
        modalBorder: 'rgba(0, 242, 234, 0.3)', // Cyan Border
        modalText: '#ffffff',
        modalTextDim: '#888899',
        modalTextSecondary: '#666666',
        profileAction: 'rgba(0, 0, 0, 0.5)',
        profileActionHover: 'rgba(255, 255, 255, 0.03)',
        profileForeground: 'rgba(0, 0, 0, 0.5)',
        selectedOptionBorder: '#00f2ea',
        standby: '#ffd700',
    },
    fonts: {
        body: 'var(--font-mono)', // JetBrains Mono
    },
    radii: {
        actionButton: '4px',
        connectButton: '8px',
        menuButton: '8px',
        modal: '12px',
        modalMobile: '12px',
    },
    shadows: {
        connectButton: '0 4px 12px rgba(0, 242, 234, 0.1)',
        dialog: '0 8px 32px rgba(0, 0, 0, 0.8)',
        profileDetailsAction: 'none',
        selectedOption: '0 0 0 2px #00f2ea',
        selectedWallet: '0 0 0 2px #00f2ea',
        walletLogo: 'none',
    },
};
