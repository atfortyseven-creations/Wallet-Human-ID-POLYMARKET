import { http, createConfig, fallback } from "wagmi";
import { 
    mainnet, polygon, optimism, arbitrum, base, baseSepolia, 
    avalanche, bsc, celo, fantom, zksync, zksyncSepoliaTestnet, 
    gnosis, polygonZkEvm, mantle, blast, mode, manta, 
    taiko, ronin, kava, aurora, metis, zora, sei, 
    rootstock, linea, scroll 
} from "wagmi/chains";
import { injected, metaMask } from "wagmi/connectors";

const infuraKey = process.env.NEXT_PUBLIC_INFURA_API_KEY || "4307fae544b442c2a40443ac491ffb0e";

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
        injected(),
        metaMask({
            infuraAPIKey: infuraKey,
            dappMetadata: {
                name: "Whale Alert",
                url: "https://whalealertid.fi",
            }
        })
    ],
});


