import { useEnsName, useEnsAvatar } from 'wagmi';
import { mainnet } from 'wagmi/chains';

/**
 * System ENS Hook
 * -------------------
 * Resolves ENS names and avatars strictly via Mainnet (chain ID 1).
 * Includes built-in caching via Wagmi to avoid redundant RPC calls.
 * 
 * @param address The raw 0x address
 * @returns { name, avatar, isLoading, isError }
 */
export function useSystemENS(address?: `0x${string}`) {
    const { data: ensName, isLoading: isNameLoading, isError: isNameError } = useEnsName({
        address,
        chainId: mainnet.id,
        query: {
            staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
        }
    });

    const { data: ensAvatar, isLoading: isAvatarLoading } = useEnsAvatar({
        name: ensName || undefined,
        chainId: mainnet.id,
        query: {
            staleTime: 1000 * 60 * 60 * 24,
            enabled: !!ensName,
        }
    });

    return {
        ensName,
        ensAvatar,
        displayName: ensName || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '0x...'),
        isLoading: isNameLoading || isAvatarLoading,
        isError: isNameError
    };
}
