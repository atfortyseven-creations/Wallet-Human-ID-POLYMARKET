/**
 * ============================================================
 * ERC-4337 ACCOUNT ABSTRACTION ENGINE
 * ============================================================
 * Construct, hash, sign, and broadcast UserOperations for 
 * Smart Contract Wallets (Account Abstraction).
 * Bypasses standard EOA transactions by targeting the global
 * EntryPoint contract via decentralized Bundler networks.
 * ============================================================
 */

import { ethers } from 'ethers';

// Standard ERC-4337 EntryPoint Contract (v0.6)
export const ENTRY_POINT_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";

// UserOperation struct defined by ERC-4337
export interface UserOperation {
  sender: string;
  nonce: bigint;
  initCode: string;
  callData: string;
  callGasLimit: bigint;
  verificationGasLimit: bigint;
  preVerificationGas: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  paymasterAndData: string;
  signature: string;
}

/**
 * ABI Types used for encoding the UserOperation for the `getUserOpHash` calculation.
 * According to EIP-4337, the hash is: 
 * keccak256(abi.encode(keccak256(abi.encode(userOp)), entryPoint, chainId))
 */
const PACKED_USEROP_TYPE = [
  "address",
  "uint256",
  "bytes32",
  "bytes32",
  "uint256",
  "uint256",
  "uint256",
  "uint256",
  "uint256",
  "bytes32",
];

/**
 * Packs a UserOperation into the exact cryptographic format required by the EntryPoint
 * for signature validation.
 */
export function packUserOp(op: UserOperation): string {
  return ethers.AbiCoder.defaultAbiCoder().encode(PACKED_USEROP_TYPE, [
    op.sender,
    op.nonce,
    ethers.keccak256(op.initCode),
    ethers.keccak256(op.callData),
    op.callGasLimit,
    op.verificationGasLimit,
    op.preVerificationGas,
    op.maxFeePerGas,
    op.maxPriorityFeePerGas,
    ethers.keccak256(op.paymasterAndData),
  ]);
}

/**
 * Calculates the canonical ERC-4337 UserOperation Hash.
 * This is the exact hash that the smart contract wallet must verify inside `validateUserOp`.
 */
export function getUserOpHash(op: UserOperation, entryPoint: string, chainId: bigint): string {
  const packed = packUserOp(op);
  const hashPacked = ethers.keccak256(packed);
  
  return ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["bytes32", "address", "uint256"],
      [hashPacked, entryPoint, chainId]
    )
  );
}

/**
 * Signs a UserOperation with the owner's EOA key.
 */
export async function signUserOp(
  op: UserOperation,
  signer: ethers.Wallet,
  chainId: bigint,
  entryPoint: string = ENTRY_POINT_ADDRESS
): Promise<UserOperation> {
  const opHash = getUserOpHash(op, entryPoint, chainId);
  const signature = await signer.signMessage(ethers.getBytes(opHash));
  return { ...op, signature };
}

/**
 * Submits the fully constructed and signed UserOperation to an ERC-4337 Bundler node.
 * Uses the standard `eth_sendUserOperation` JSON-RPC method.
 */
export async function submitToBundler(
  op: UserOperation,
  bundlerRpcUrl: string,
  entryPoint: string = ENTRY_POINT_ADDRESS
): Promise<string> {
  const provider = new ethers.JsonRpcProvider(bundlerRpcUrl);
  
  // Format BigInts to hex strings as required by JSON-RPC
  const formattedOp = {
    sender: op.sender,
    nonce: ethers.toBeHex(op.nonce),
    initCode: op.initCode,
    callData: op.callData,
    callGasLimit: ethers.toBeHex(op.callGasLimit),
    verificationGasLimit: ethers.toBeHex(op.verificationGasLimit),
    preVerificationGas: ethers.toBeHex(op.preVerificationGas),
    maxFeePerGas: ethers.toBeHex(op.maxFeePerGas),
    maxPriorityFeePerGas: ethers.toBeHex(op.maxPriorityFeePerGas),
    paymasterAndData: op.paymasterAndData,
    signature: op.signature,
  };

  try {
    const userOpHash = await provider.send("eth_sendUserOperation", [
      formattedOp,
      entryPoint
    ]);
    return userOpHash;
  } catch (error: any) {
    console.error("[ERC4337-ENGINE] Bundler rejected UserOperation:", error);
    throw new Error(`Bundler Rejection: ${error.message}`);
  }
}
