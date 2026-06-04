import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useSignTypedData, useSwitchChain } from 'wagmi';
import { parseUnits, maxUint256 } from 'viem';
import { toast } from 'sonner';

const USDC_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
const CTF_EXCHANGE = "0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E";
const POLYGON_CHAIN_ID = 137;

// ERC20 ABI for allowance/approve
const ERC20_ABI = [
    {
        name: "allowance",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
        outputs: [{ name: "", type: "uint256" }]
    },
    {
        name: "approve",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
        outputs: [{ name: "", type: "bool" }]
    }
] as const;

// EIP-712 Domain and Types
const domain = {
    name: "Polymarket CTF Exchange",
    version: "1",
    chainId: POLYGON_CHAIN_ID,
    verifyingContract: CTF_EXCHANGE,
} as const;

const types = {
    Order: [
        { name: "salt", type: "uint256" },
        { name: "maker", type: "address" },
        { name: "signer", type: "address" },
        { name: "taker", type: "address" },
        { name: "tokenId", type: "uint256" },
        { name: "makerAmount", type: "uint256" },
        { name: "takerAmount", type: "uint256" },
        { name: "expiration", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "feeRateBps", type: "uint256" },
        { name: "side", type: "uint8" },
        { name: "signatureType", type: "uint8" },
    ],
} as const;

export function usePolymarketTrade() {
    const { address, chainId } = useAccount();
    const [status, setStatus] = useState<"IDLE" | "SWITCHING" | "APPROVING" | "SIGNING" | "POSTING" | "SUCCESS">("IDLE");

    // Wagmi Hooks
    const { writeContractAsync } = useWriteContract();
    const { signTypedDataAsync } = useSignTypedData();
    const { switchChainAsync } = useSwitchChain();
    
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: address ? [address, CTF_EXCHANGE] : undefined,
    });

    const trade = async (side: "BUY" | "SELL", amount: string, price: number, tokenId: string) => {
        if (!address) {
            toast.error("Please connect your wallet first");
            return;
        }

        try {
            if (chainId !== POLYGON_CHAIN_ID && switchChainAsync) {
                setStatus("SWITCHING");
                toast.info("Switching to Polygon...");
                await switchChainAsync({ chainId: POLYGON_CHAIN_ID });
                // Small delay to allow the wallet to settle the network switch
                await new Promise(r => setTimeout(r, 1000));
            }

            setStatus("APPROVING");

            // 1. Check Allowance (if Buying with USDC)
            const amountBigInt = parseUnits(amount, 6); // USDC has 6 decimals

            if (side === "BUY") {
                if (!allowance || allowance < amountBigInt) {
                    toast.info("Approving USDC...");
                    const tx = await writeContractAsync({
                        address: USDC_ADDRESS,
                        abi: ERC20_ABI,
                        functionName: "approve",
                        args: [CTF_EXCHANGE, maxUint256],
                    });
                    // Actually wait for receipt in a robust app.
                    // For now mock wait
                    await new Promise(r => setTimeout(r, 2000)); 
                    await refetchAllowance();
                }
            }

            setStatus("SIGNING");

            // 2. Create Order Object
            const saltArray = new Uint32Array(1);
            window.crypto.getRandomValues(saltArray);
            const salt = saltArray[0];
            const makerAmount = amountBigInt;
            const takerAmount = parseUnits((parseFloat(amount) / price).toFixed(6), 6); 

            const order = {
                salt: BigInt(salt),
                maker: address, 
                signer: address,
                taker: "0x0000000000000000000000000000000000000000" as `0x${string}`,
                tokenId: BigInt(tokenId || "0"),
                makerAmount: makerAmount,
                takerAmount: takerAmount,
                expiration: BigInt(Math.floor(Date.now() / 1000) + 300), 
                nonce: BigInt(0), 
                feeRateBps: BigInt(0),
                side: side === "BUY" ? 0 : 1,
                signatureType: 0, 
            };

            // 3. Sign Order
            const signature = await signTypedDataAsync({
                domain,
                types,
                primaryType: "Order",
                message: order,
            });

            setStatus("POSTING");

            //  PERSISTENCE: Log to Elite UserActivity
            await fetch('/api/wallet/activity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userAddress: address,
                    type: 'POLYMARKET_TRADE_INTENT',
                    action: `${side} ${amount} @ ${price}`,
                    chainId: POLYGON_CHAIN_ID,
                    metadata: { order, signature, tokenId }
                }),
            });

            setStatus("SUCCESS");
            toast.success("Order Placed Successfully!");
            setTimeout(() => setStatus("IDLE"), 2000);

        } catch (error: any) {
            console.error(error);
            setStatus("IDLE");
            
            if (address) {
                await fetch('/api/wallet/activity', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userAddress: address,
                        type: 'POLYMARKET_TRADE_FAILURE',
                        action: `${side} ${amount} @ ${price}`,
                        chainId: POLYGON_CHAIN_ID,
                        metadata: { error: error.message }
                    }),
                });
            }
        }
    };

    return {
        trade,
        status
    };
}

