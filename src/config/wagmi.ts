import { http, createConfig, cookieStorage, createStorage } from 'wagmi'
import { 
    mainnet, polygon, optimism, arbitrum, base, baseSepolia, 
    avalanche, bsc, celo, fantom, zksync, zksyncSepoliaTestnet, 
    gnosis, polygonZkEvm, mantle, blast, mode, manta, 
    taiko, ronin, kava, aurora, metis, zora, sei, 
    rootstock, linea, scroll, optimismSepolia 
} from "wagmi/chains";
import { injected, walletConnect } from 'wagmi/connectors'

export const config = createConfig({
    chains: [
        mainnet, polygon, optimism, arbitrum, base, baseSepolia,
        avalanche, bsc, celo, fantom, zksync, zksyncSepoliaTestnet,
        gnosis, polygonZkEvm, mantle, blast, mode, manta,
        taiko, ronin, kava, aurora, metis, zora, sei,
        rootstock, linea, scroll, optimismSepolia
    ],
    ssr: true,
    storage: createStorage({
        storage: cookieStorage,
    }),
    transports: {
        [mainnet.id]: http(),
        [polygon.id]: http(`https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
        [zksync.id]: http(),
        [optimism.id]: http(),
        [arbitrum.id]: http(),
        [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || "https://sepolia.base.org"),
        [optimismSepolia.id]: http(process.env.NEXT_PUBLIC_OPTIMISM_SEPOLIA_RPC || "https://sepolia.optimism.io"),
        [base.id]: http(),
        [avalanche.id]: http(),
        [bsc.id]: http(),
        [celo.id]: http(),
        [fantom.id]: http(),
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
        walletConnect({
            projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'bf1083a298e7222c838266166b12b2ba'
        }),
    ],
})
