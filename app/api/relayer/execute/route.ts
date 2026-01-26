import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { prisma } from "@/lib/prisma";

/**
 * Relayer API for Gasless Proposal Execution
 */

const GOVERNANCE_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_GOVERNANCE_CONTRACT_ADDRESS!;
const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY!;
const RPC_URL = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";

const GOVERNANCE_ABI = [
    "function executeProposalWithSignature(address executor, bytes32 proposalId, uint256 nonce, uint256 deadline, bytes signature) external",
    "event ProposalExecuted(bytes32 indexed proposalId, address indexed executor)"
];

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { executor, proposalId, nonce, deadline, signature } = body;

        if (!executor || !proposalId || !signature) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }

        console.log(`[Relayer] Executing proposal ${proposalId} for: ${executor}`);

        // Setup provider & signer
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const relayerWallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);
        const governanceContract = new ethers.Contract(GOVERNANCE_CONTRACT_ADDRESS, GOVERNANCE_ABI, relayerWallet);

        // Check relayer balance
        const balance = await provider.getBalance(relayerWallet.address);
        if (balance < ethers.parseEther("0.001")) {
            return NextResponse.json({ error: "Relayer out of funds" }, { status: 503 });
        }

        // Execute transaction
        const tx = await governanceContract.executeProposalWithSignature(
            executor,
            proposalId,
            nonce,
            deadline,
            signature,
            { gasLimit: 500000 }
        );

        console.log(`[Relayer] Execution tx sent: ${tx.hash}`);

        // Wait for confirmation
        const receipt = await tx.wait();

        // Update database
        // @ts-ignore - proposalId is unique but typescript definition might lag in CI
        await prisma.marketProposal.update({
            where: { proposalId },
            data: {
                status: "EXECUTED",
                executedAt: new Date(),
                executionTxHash: tx.hash,
            },
        });

        return NextResponse.json({
            success: true,
            txHash: tx.hash,
            blockNumber: receipt.blockNumber,
        });

    } catch (error: any) {
        console.error("[Relayer] Execution error:", error);
        return NextResponse.json({ error: error.message || "Execution failed" }, { status: 500 });
    }
}
