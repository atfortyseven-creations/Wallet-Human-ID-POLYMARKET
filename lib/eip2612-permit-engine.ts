/**
 * ============================================================
 * EIP-2612 PERMIT ENGINE — Gasless Token Approvals
 * ============================================================
 * Implements EIP-2612: Permit (off-chain approval via EIP-712 signature).
 * Tokens that support this allow approvals WITHOUT spending gas,
 * the spender submits the signed permit on-chain alongside the transfer.
 * Used by: USDC, DAI, Uniswap UNI, ENS, and most modern DeFi tokens.
 * ============================================================
 */

import { ethers } from 'ethers';

export const EIP2612_ABI = [
  "function name() view returns (string)",
  "function nonces(address owner) view returns (uint256)",
  "function DOMAIN_SEPARATOR() view returns (bytes32)",
  "function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)",
  "function version() view returns (string)",
];

export interface PermitSignature {
  v: number;
  r: string;
  s: string;
  deadline: bigint;
  nonce: bigint;
  owner: string;
  spender: string;
  value: bigint;
  tokenAddress: string;
  chainId: bigint;
}

/**
 * Constructs and signs an EIP-712 Permit payload for gasless token approval.
 * The resulting signature can be passed to permit() by the spender contract.
 */
export async function signEIP2612Permit(
  wallet: ethers.Wallet,
  tokenAddress: string,
  spenderAddress: string,
  value: bigint,
  deadlineSeconds: number = 3600
): Promise<PermitSignature> {
  if (!wallet.provider) throw new Error("Provider required for EIP-2612 permit signing.");

  const token = new ethers.Contract(tokenAddress, EIP2612_ABI, wallet.provider);
  const network = await wallet.provider.getNetwork();
  const chainId = network.chainId;

  // Read on-chain state
  const [tokenName, nonce, version] = await Promise.all([
    token.name(),
    token.nonces(wallet.address),
    token.version().catch(() => '1'), // Some tokens don't expose version()
  ]);

  const deadline = BigInt(Math.floor(Date.now() / 1000) + deadlineSeconds);

  // EIP-712 Domain — must match the token's on-chain DOMAIN_SEPARATOR
  const domain: ethers.TypedDataDomain = {
    name: String(tokenName),
    version: String(version),
    chainId,
    verifyingContract: tokenAddress,
  };

  // EIP-2612 Permit Type
  const types = {
    Permit: [
      { name: 'owner',    type: 'address' },
      { name: 'spender',  type: 'address' },
      { name: 'value',    type: 'uint256' },
      { name: 'nonce',    type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  };

  const message = {
    owner:    wallet.address,
    spender:  spenderAddress,
    value:    value,
    nonce:    nonce as bigint,
    deadline: deadline,
  };

  // Sign strictly via EIP-712 — private key never leaves the wallet context
  const signature = await wallet.signTypedData(domain, types, message);
  const { v, r, s } = ethers.Signature.from(signature);

  return {
    v,
    r,
    s,
    deadline,
    nonce: nonce as bigint,
    owner: wallet.address,
    spender: spenderAddress,
    value,
    tokenAddress,
    chainId,
  };
}

/**
 * Submits a signed EIP-2612 permit on-chain.
 * Called by the spender contract (e.g., Uniswap Router) to atomically
 * approve + swap in a single transaction.
 */
export async function executePermitOnChain(
  wallet: ethers.Wallet,
  permit: PermitSignature
): Promise<ethers.TransactionReceipt | null> {
  const token = new ethers.Contract(permit.tokenAddress, EIP2612_ABI, wallet);

  const feeData = await wallet.provider!.getFeeData();

  const tx = await token.permit(
    permit.owner,
    permit.spender,
    permit.value,
    permit.deadline,
    permit.v,
    permit.r,
    permit.s,
    {
      maxFeePerGas: feeData.maxFeePerGas,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      type: 2,
    }
  );

  console.log(`[EIP-2612] Permit submitted: ${tx.hash}`);
  return tx.wait(1);
}

/**
 * Checks if a token supports EIP-2612 Permit by testing for the nonces() function.
 */
export async function supportsEIP2612(
  provider: ethers.Provider,
  tokenAddress: string
): Promise<boolean> {
  try {
    const token = new ethers.Contract(tokenAddress, EIP2612_ABI, provider);
    await token.nonces(ethers.ZeroAddress);
    return true;
  } catch {
    return false;
  }
}
