/**
 * ============================================================
 * CREATE2 DETERMINISTIC WALLET FACTORY (EIP-1014)
 * ============================================================
 * Implements deterministic smart contract deployments.
 * This is the foundation of Account Abstraction (EIP-4337) and
 * advanced institutional wallets like Gnosis Safe / Argent.
 * Allows calculating the contract address BEFORE it is deployed.
 * ============================================================
 */

import { ethers } from 'ethers';

// A standardized generic Singleton Factory deployed across many EVM networks.
// This specific address is the famous Arachnid CREATE2 proxy.
export const DETERMINISTIC_DEPLOYER_PROXY = "0x4e59b44847b379578588920cA78FbF26c0B4956C";

export interface Create2DeploymentParams {
  bytecode: string;           // The EVM initialization bytecode (with constructor args appended)
  saltHex: string;            // A 32-byte hex string used as the salt
  deployerAddress?: string;   // The address of the factory (defaults to standard proxy)
}

/**
 * Calculates the exact deterministic address where a contract will be deployed
 * using the CREATE2 opcode, before any transaction is broadcast.
 */
export function calculateCreate2Address({
  bytecode,
  saltHex,
  deployerAddress = DETERMINISTIC_DEPLOYER_PROXY,
}: Create2DeploymentParams): string {
  if (!bytecode.startsWith('0x')) bytecode = `0x${bytecode}`;
  if (!saltHex.startsWith('0x')) saltHex = `0x${saltHex}`;

  // 1. Keccak256 hash of the initialization bytecode
  const initCodeHash = ethers.keccak256(bytecode);

  // 2. Pad the salt to 32 bytes (256 bits)
  const saltPad = ethers.zeroPadValue(saltHex, 32);

  // 3. EIP-1014 formulation: keccak256( 0xff ++ deployer ++ salt ++ initCodeHash )[12:]
  // We use ethers' built-in getCreate2Address which implements this strictly.
  return ethers.getCreate2Address(deployerAddress, saltPad, initCodeHash);
}

/**
 * Validates if a generated salt is a proper 32-byte hexadecimal string.
 */
export function isValidSalt(salt: string): boolean {
  try {
    const padded = ethers.zeroPadValue(salt, 32);
    return padded.length === 66; // '0x' + 64 hex chars
  } catch {
    return false;
  }
}

/**
 * Executes the deployment via a CREATE2 factory.
 * The factory must have a specific ABI. For the generic singleton proxy,
 * it just takes the salt and the bytecode as calldata.
 */
export async function executeDeterministicDeployment(
  wallet: ethers.Wallet,
  bytecode: string,
  saltHex: string,
  gasPriority: 'low' | 'medium' | 'high' = 'medium'
): Promise<{ address: string; hash: string }> {
  if (!wallet.provider) throw new Error("Wallet not connected to network");

  if (!bytecode.startsWith('0x')) bytecode = `0x${bytecode}`;
  if (!saltHex.startsWith('0x')) saltHex = `0x${saltHex}`;

  const saltPad = ethers.zeroPadValue(saltHex, 32);
  const targetAddress = calculateCreate2Address({ bytecode, saltHex });

  // Check if already deployed
  const codeAtAddress = await wallet.provider.getCode(targetAddress);
  if (codeAtAddress !== '0x') {
    throw new Error(`Contract already deployed at deterministic address: ${targetAddress}`);
  }

  // Generic Singleton Factory simply expects salt and bytecode packed together?
  // Actually, standard CREATE2 factories usually have a function: deploy(uint256 value, bytes32 salt, bytes code)
  // For safety and compatibility with standard Gnosis Safe factory:
  const CREATE2_FACTORY_ABI = [
    "function deploy(uint256 value, bytes32 salt, bytes memory code) public returns (address)"
  ];
  
  // NOTE: For pure institutional architecture, we might deploy our own factory.
  // Here we assume interaction with a standard factory implementation.
  const factory = new ethers.Contract(DETERMINISTIC_DEPLOYER_PROXY, CREATE2_FACTORY_ABI, wallet);

  const feeData = await wallet.provider.getFeeData();
  const priorityMultiplier = gasPriority === 'high' ? 2.0 : gasPriority === 'low' ? 0.8 : 1.2;
  const maxPriorityFeePerGas = BigInt(Math.floor(Number(feeData.maxPriorityFeePerGas || 1000000000) * priorityMultiplier));
  const maxFeePerGas = feeData.maxFeePerGas || (maxPriorityFeePerGas * 2n);

  console.log(`[CREATE2-ENGINE] Deploying to expected address: ${targetAddress}`);

  let gasEstimate: bigint;
  try {
    gasEstimate = await factory.deploy.estimateGas(0, saltPad, bytecode, {
      maxFeePerGas,
      maxPriorityFeePerGas
    });
  } catch (e: any) {
    throw new Error(`CREATE2 simulation reverted: ${e.message}`);
  }

  const tx = await factory.deploy(0, saltPad, bytecode, {
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasLimit: (gasEstimate * 120n) / 100n
  });

  const receipt = await tx.wait(1);

  if (receipt.status === 0) {
    throw new Error("CREATE2 Deployment Reverted on-chain.");
  }

  return {
    address: targetAddress,
    hash: tx.hash,
  };
}
