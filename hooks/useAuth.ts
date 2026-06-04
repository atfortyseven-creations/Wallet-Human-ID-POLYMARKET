// hooks/useAUTH.ts
import { useAccount, useBalance } from 'wagmi'
import { AUTH_TOKEN_ADDRESS } from '../config/tokens'

export function useAUTH() {
    const { address, isConnected, isConnecting } = useAccount()

    const { data, isError, isLoading, refetch } = useBalance({
        address,
        token: AUTH_TOKEN_ADDRESS, // Aquí es donde ocurre la magia: pedimos AUTH, no ETH
    })

    // Format balance helper
    const balanceVal = data ? data.formatted : '0.00';

    return {
        address,
        balance: balanceVal,
        symbol: data?.symbol || 'AUTH',
        status: isConnecting ? 'connecting' : isConnected ? 'connected' : 'disconnected',
        isError,
        isLoading,
        refresh: refetch,
        isAuthenticated: isConnected,
        isPremium: parseFloat(balanceVal) > 0
    }
}

export const useAuth = useAUTH;

