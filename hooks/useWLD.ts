// hooks/useWLD.ts
import { useAccount, useBalance } from 'wagmi'
import { WLD_TOKEN_ADDRESS } from '../lib/wagmi-config'

export function useWLD() {
    const { address, isConnected, isConnecting } = useAccount()

    const { data, isError, isLoading, refetch } = useBalance({
        address,
        token: WLD_TOKEN_ADDRESS, // Aquí es donde ocurre la magia: pedimos WLD, no ETH
    })

    // Format balance helper
    const balanceVal = data ? data.formatted : '0.00';

    return {
        address,
        balance: balanceVal,
        symbol: data?.symbol || 'WLD',
        status: isConnecting ? 'connecting' : isConnected ? 'connected' : 'disconnected',
        isError,
        isLoading,
        refresh: refetch
    }
}
