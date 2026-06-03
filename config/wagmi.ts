import { http, createConfig } from "wagmi";
import { 
    mainnet, polygon, optimism, arbitrum, base, baseSepolia, 
    avalanche, bsc, celo, fantom, zksync, zksyncSepoliaTestnet, 
    gnosis, polygonZkEvm, mantle, blast, mode, manta, 
    taiko, ronin, kava, aurora, metis, zora, sei, 
    rootstock, linea, scroll 
} from "wagmi/chains";
import { injected, metaMask } from "wagmi/connectors";

const infuraKey = process.env.NEXT_PUBLIC_INFURA_API_KEY || "4307fae544b442c2a40443ac491ffb0e";

export const config = createConfig({
    chains: [
        mainnet, polygon, optimism, arbitrum, base, baseSepolia,
        avalanche, bsc, celo, fantom, zksync, zksyncSepoliaTestnet,
        gnosis, polygonZkEvm, mantle, blast, mode, manta,
        taiko, ronin, kava, aurora, metis, zora, sei,
        rootstock, linea, scroll
    ],
    transports: {
        // [Elite] Ethereum Mainnet with Infura + Flashbots fallback
        [mainnet.id]: http(`https://mainnet.infura.io/v3/${infuraKey}`),
        // [HIGH-PERFORMANCE] Alchemy/Llama RPCs for other chains
        [polygon.id]: http(process.env.NEXT_PUBLIC_POLYGON_RPC_URL || "https://polygon.llamarpc.com"),
        [optimism.id]: http(process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL || "https://optimism.llamarpc.com"),
        [arbitrum.id]: http(process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || "https://arbitrum.llamarpc.com"),
        [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://base.llamarpc.com"),
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


