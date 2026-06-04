import { useAccount, useReadContract, useChainId } from "wagmi";
import { formatUnits, Address } from "viem";
import { getUsdcAddress } from "@/config/tokens";

const ERC20_ABI = [
    {
        constant: true,
        inputs: [{ name: "_owner", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "balance", type: "uint256" }],
        type: "function",
    },
    {
        constant: true,
        inputs: [],
        name: "decimals",
        outputs: [{ name: "", type: "uint8" }],
        type: "function",
    }
] as const;

export function useTokenBalance(tokenAddress?: Address) {
    const { address } = useAccount();
    const chainId = useChainId();

    // If no address provided, try to get USDC for current chain
    const targetAddress = tokenAddress || getUsdcAddress(chainId);

    const { data: balanceData, isLoading: balanceLoading } = useReadContract({
        address: targetAddress,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
        query: {
            enabled: !!address && !!targetAddress,
            refetchInterval: 10000,
        }
    });

    const { data: decimals } = useReadContract({
        address: targetAddress,
        abi: ERC20_ABI,
        functionName: "decimals",
        query: {
            enabled: !!targetAddress,
        }
    });

    const formatted = (typeof balanceData === 'bigint' && typeof decimals === 'number')
        ? formatUnits(balanceData, decimals)
        : "0.00";

    return {
        balance: balanceData,
        formatted,
        isLoading: balanceLoading,
        symbol: "USDC", // Assuming generic usage for now
        tokenAddress: targetAddress
    };
}

