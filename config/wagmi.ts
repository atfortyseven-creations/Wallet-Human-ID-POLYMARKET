import { http, createConfig, fallback } from "wagmi";
import { 
    mainnet, polygon, optimism, arbitrum, base, baseSepolia, 
    avalanche, bsc, celo, fantom, zksync, zksyncSepoliaTestnet, 
    gnosis, polygonZkEvm, mantle, blast, mode, manta, 
    taiko, ronin, kava, aurora, metis, zora, sei, 
    rootstock, linea, scroll 
} from "wagmi/chains";
import { injected, metaMask, walletConnect } from "wagmi/connectors";

const infuraKey = process.env.NEXT_PUBLIC_INFURA_API_KEY || "4307fae544b442c2a40443ac491ffb0e";

// WalletConnect Project ID — must match the one registered on WalletConnect Cloud
const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
    || process.env.NEXT_PUBLIC_WC_PROJECT_ID
    || '47cce4049225582027fdeeecb2868ead';

const CANONICAL_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.humanidfi.com';

const ALCHEMY_KEYS = [
    "eJ8JYm5NbVJXQ6U6rkBgK",
    "WSmHi-tN2D_KMM-wC1qWI",
    "UwKeAtmk7pKtXwfFEUDrx"
];

// Helper to create a highly available fallback array of Alchemy RPCs + public fallback
const getAlchemyFallbacks = (alchemyNetwork: string) => {
    return fallback([
        http(`https://${alchemyNetwork}.g.alchemy.com/v2/${ALCHEMY_KEYS[0]}`),
        http(`https://${alchemyNetwork}.g.alchemy.com/v2/${ALCHEMY_KEYS[1]}`),
        http(`https://${alchemyNetwork}.g.alchemy.com/v2/${ALCHEMY_KEYS[2]}`),
        http() // public fallback
    ]);
};

export const config = createConfig({
    chains: [
        mainnet, polygon, optimism, arbitrum, base, baseSepolia,
        avalanche, bsc, celo, fantom, zksync, zksyncSepoliaTestnet,
        gnosis, polygonZkEvm, mantle, blast, mode, manta,
        taiko, ronin, kava, aurora, metis, zora, sei,
        rootstock, linea, scroll
    ],
    transports: {
        // [Elite] Quantum Capacity Fallback Transports with 3x Alchemy Keys + Infura + Public
        [mainnet.id]: fallback([
            http(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEYS[0]}`),
            http(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEYS[1]}`),
            http(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEYS[2]}`),
            http(`https://mainnet.infura.io/v3/${infuraKey}`),
            http()
        ]),
        // [HIGH-PERFORMANCE] Alchemy Load Balancing for major L2s
        [polygon.id]: getAlchemyFallbacks("polygon-mainnet"),
        [optimism.id]: getAlchemyFallbacks("opt-mainnet"),
        [arbitrum.id]: getAlchemyFallbacks("arb-mainnet"),
        [base.id]: getAlchemyFallbacks("base-mainnet"),
        [baseSepolia.id]: http(),
        [avalanche.id]: http(),
        [bsc.id]: http(),
        [celo.id]: http(),
        [fantom.id]: http(),
        [zksync.id]: http(),
        [zksyncSepoliaTestnet.id]: http(),
        [gnosis.id]: http(),
        [polygonZkEvm.id]: http(),
        [mantle.id]: http(),
        [blast.id]: http(),
        [mode.id]: http(),
        [manta.id]: http(),
        [taiko.id]: http(),
        [ronin.id]: http(),
        [kava.id]: http(),
        [aurora.id]: http(),
        [metis.id]: http(),
        [zora.id]: http(),
        [sei.id]: http(),
        [rootstock.id]: http(),
        [linea.id]: http(),
        [scroll.id]: http(),
    },
    connectors: [
        injected({
            // [MOBILE FIX] EIP-6963: use event-based discovery instead of polling window.ethereum
            shimDisconnect: true,
        }),
        metaMask({
            infuraAPIKey: infuraKey,
            dappMetadata: {
                name: "Human ID",
                url: CANONICAL_APP_URL,
            }
        }),
        // [MOBILE FIX] Explicit WalletConnect connector for reliable mobile deep-link reconnection.
        // Without this, wagmi cannot restore WalletConnect sessions after deep-link redirects.
        walletConnect({
            projectId: WC_PROJECT_ID,
            metadata: {
                name: 'Human ID',
                description: 'Sovereign Grade Blockchain Intelligence',
                url: CANONICAL_APP_URL,
                icons: [`${CANONICAL_APP_URL}/logo-mark.png`],
            },
            showQrModal: false, // AppKit handles the QR modal — avoid double modal
        }),
    ],
    // [MOBILE FIX] Ensure wagmi immediately tries to restore any saved connector on mount.
    // Without this, Android tab-discard events cause a cold-start instead of reconnection.
    multiInjectedProviderDiscovery: true,
});
