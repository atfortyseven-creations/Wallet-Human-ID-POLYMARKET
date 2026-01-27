import { http, createConfig } from 'wagmi'
import { optimism } from 'wagmi/chains'
import { walletConnect } from 'wagmi/connectors'

// Contrato Oficial de WLD en Optimism
export const WLD_TOKEN_ADDRESS = '0xdc6f18f83959cd25095c2453192f16d08b496666' as const;

export const config = createConfig({
    chains: [optimism], // Forzamos Optimism para evitar errores de red
    connectors: [
        walletConnect({
            projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
            showQrModal: true
        }),
    ],
    transports: {
        [optimism.id]: http(), // RPC público o privado (Alchemy/Infura)
    },
})
