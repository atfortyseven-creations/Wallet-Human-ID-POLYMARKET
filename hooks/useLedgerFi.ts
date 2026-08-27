import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { parseEther, erc20Abi, maxUint256 } from "viem";

// ABIs Mínimos
const MOCK_AUTH_ABI = [
    { name: "faucet", type: "function", stateMutability: "nonpayable", inputs: [], outputs: [] },
    { name: "balanceOf", type: "function", stateMutability: "view", inputs: [{ name: "", type: "address" }], outputs: [{ name: "", type: "uint256" }] }
] as const;

const LEDGERFI_ABI = [
    { name: "zap", type: "function", stateMutability: "nonpayable", inputs: [{ name: "amount", type: "uint256" }], outputs: [] },
    {
        name: "voteWithWorldID", type: "function", stateMutability: "nonpayable", inputs: [
            { name: "root", type: "uint256" },
            { name: "nullifierHash", type: "uint256" },
            { name: "proof", type: "uint256[8]" }
        ], outputs: []
    },
    { name: "votingPower", type: "function", stateMutability: "view", inputs: [{ name: "", type: "address" }], outputs: [{ name: "", type: "uint256" }] }
] as const;

const LEDGERFI_ADDRESS = process.env.NEXT_PUBLIC_LEDGERFI_CONTRACT as `0x${string}`;
const AUTH_TOKEN = process.env.NEXT_PUBLIC_AUTH_TOKEN as `0x${string}`;

export function useLedgerFi() {
    const { address } = useAccount();
    const { writeContract, data: hash, isPending } = useWriteContract();

    // Lecturas de estado
    const { data: wldBalance } = useReadContract({
        address: AUTH_TOKEN, abi: MOCK_AUTH_ABI, functionName: "balanceOf", args: [address!], query: { enabled: !!address }
    });
    const { data: allowance } = useReadContract({
        address: AUTH_TOKEN, abi: erc20Abi, functionName: "allowance", args: [address!, LEDGERFI_ADDRESS], query: { enabled: !!address }
    });
    const { data: votingPower } = useReadContract({
        address: LEDGERFI_ADDRESS, abi: LEDGERFI_ABI, functionName: "votingPower", args: [address!], query: { enabled: !!address }
    });

    // 1. Obtener Fondos (Faucet)
    const claimFaucet = () => {
        writeContract({ address: AUTH_TOKEN, abi: MOCK_AUTH_ABI, functionName: "faucet", args: [] });
    };

    // 2. Ejecutar Zap (Approve automático)
    const executeZap = (amount: string) => {
        const wei = parseEther(amount);
        // Simple logic: if allowance is insufficient, approve. Otherwise, zap.
        if (!allowance || allowance < wei) {
            writeContract({ address: AUTH_TOKEN, abi: erc20Abi, functionName: "approve", args: [LEDGERFI_ADDRESS, maxUint256] });
        } else {
            writeContract({ address: LEDGERFI_ADDRESS, abi: LEDGERFI_ABI, functionName: "zap", args: [wei] });
        }
    };

    // 3. Votar
    const castVote = (proofData: any) => {
        const root = BigInt(proofData.merkle_root);
        const nullifier = BigInt(proofData.nullifier_hash);
        const proof = proofData.proof.map((p: string) => BigInt(p));

        writeContract({
            address: LEDGERFI_ADDRESS, abi: LEDGERFI_ABI, functionName: "voteWithWorldID",
            args: [root, nullifier, proof],
        });
    };

    return { claimFaucet, executeZap, castVote, votingPower, wldBalance, isPending, txHash: hash };
}

