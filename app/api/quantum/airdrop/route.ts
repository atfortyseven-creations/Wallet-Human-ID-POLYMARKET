import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createWalletClient, createPublicClient, http, parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

export const dynamic = 'force-dynamic';

//  Chain config (reads same RPC as rest of app) 
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545';
const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '1337', 10);

const localChain = {
  id: chainId,
  name: 'System Mainnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: [rpcUrl] } },
} as const;

const AIRDROP_CONTRACT = (process.env.NEXT_PUBLIC_AIRDROP_CONTRACT_ADDRESS || '0x') as `0x${string}`;
const CLAIM_AMOUNT = BigInt('500000000000000000000'); // 500 QDs in wei

/**
 * POST /api/core/airdrop
 * Backend signs the EIP-712 claim and submits it on behalf of the user.
 * This prevents the user from needing ETH gas for their first QD claim.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate  get the user's wallet address from session
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'No autenticado. Conecta tu billetera primero.' }, { status: 401 });
    }
    const userWallet = session.userId as `0x${string}`;

    // 2. Validate that the Airdrop contract address is configured
    if (!AIRDROP_CONTRACT || AIRDROP_CONTRACT === '0x') {
      return NextResponse.json({ error: 'El contrato de Airdrop no está configurado en el servidor.' }, { status: 503 });
    }

    // 3. Load the backend signer (the authority that signs claims)
    const signerPrivateKey = process.env.AIRDROP_SIGNER_PRIVATE_KEY as `0x${string}`;
    if (!signerPrivateKey) {
      return NextResponse.json({ error: 'El firmante del Airdrop no está configurado.' }, { status: 503 });
    }
    const signerAccount = privateKeyToAccount(signerPrivateKey);

    const publicClient = createPublicClient({ chain: localChain, transport: http(rpcUrl) });
    const walletClient = createWalletClient({ account: signerAccount, chain: localChain, transport: http(rpcUrl) });

    // 4. Check if wallet already claimed (read from contract)
    const hasClaimed = await publicClient.readContract({
      address: AIRDROP_CONTRACT,
      abi: parseAbi(['function hasClaimed(address) view returns (bool)']),
      functionName: 'hasClaimed',
      args: [userWallet],
    });

    if (hasClaimed) {
      return NextResponse.json({ error: 'Esta billetera ya ha reclamado los 500 QDs de bienvenida.' }, { status: 409 });
    }

    // 5. Build the EIP-712 signature for the user's claim
    // Must match: keccak256("Claim(address wallet,uint256 amount)")
    const domain = {
      name: 'CoreAirdrop',
      version: '1',
      chainId: BigInt(chainId),
      verifyingContract: AIRDROP_CONTRACT,
    };
    const types = {
      Claim: [
        { name: 'wallet', type: 'address' },
        { name: 'amount', type: 'uint256' },
      ],
    };
    const message = { wallet: userWallet, amount: CLAIM_AMOUNT };

    const signature = await walletClient.signTypedData({ domain, types, primaryType: 'Claim', message });

    // 6. Submit the claim transaction on behalf of the user (gasless for them)
    const txHash = await walletClient.writeContract({
      address: AIRDROP_CONTRACT,
      abi: parseAbi(['function claimWelcomeBonus(bytes calldata signature) external']),
      functionName: 'claimWelcomeBonus',
      args: [signature],
      // Override msg.sender to be the user  NOT possible server-side.
      // Instead we submit signed data that the contract verifies against userWallet.
    });

    // 7. Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    if (receipt.status !== 'success') {
      return NextResponse.json({ error: 'La transacción fue rechazada por la red.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      txHash,
      message: '¡500 QDs acreditados! Tu balance se actualizará en segundos.',
    });

  } catch (err: any) {
    const msg = err?.message || 'Error desconocido';
    console.error('[QUANTUM_AIRDROP]', msg);

    // Translate common contract errors into user-friendly messages
    if (msg.includes('already claimed') || msg.includes('Has already claimed')) {
      return NextResponse.json({ error: 'Esta billetera ya reclamó su bono de bienvenida.' }, { status: 409 });
    }
    if (msg.includes('Invalid server signature')) {
      return NextResponse.json({ error: 'Firma del servidor inválida. Contacta con soporte.' }, { status: 500 });
    }

    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
