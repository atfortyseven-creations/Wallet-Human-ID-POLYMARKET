/**
 * ============================================================
 * SMART CONTRACT DEPLOYER ENGINE
 * ============================================================
 * Pure on-chain engine for deploying raw EVM bytecode.
 * Mimics MetaMask's ability to handle transactions where `to: null`
 * and data contains the compiled smart contract bytecode.
 * ============================================================
 */

import { ethers } from 'ethers';

export interface DeploymentResult {
  contractAddress: string | null;
  transactionHash: string;
  blockNumber: number;
  gasUsed: bigint;
}

/**
 * Deploys raw bytecode to the blockchain using the connected wallet.
 * If the contract has constructor arguments, they must be ABI-encoded
 * and appended to the end of the bytecode BEFORE calling this function.
 * 
 * @param wallet The ethers Wallet with provider connected
 * @param bytecode The hex string of the compiled bytecode (with '0x' prefix)
 * @param constructorArgs Optional ABI encoded constructor arguments
 * @param gasPriority 
 */
export async function deploySmartContract(
  wallet: ethers.Wallet,
  bytecode: string,
  constructorArgs: any[] = [],
  abi: any[] = [],
  gasPriority: 'low' | 'medium' | 'high' = 'medium'
): Promise<DeploymentResult> {
  if (!wallet.provider) throw new Error("Wallet provider disconnected.");
  if (!bytecode.startsWith('0x')) bytecode = `0x${bytecode}`;

  let finalBytecode = bytecode;

  // If constructor arguments exist, we must encode them and append them
  if (constructorArgs.length > 0 && abi.length > 0) {
    console.log("[DEPLOY-ENGINE] Encoding constructor arguments...");
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const deployTx = await factory.getDeployTransaction(...constructorArgs);
    finalBytecode = deployTx.data;
  }

  const feeData = await wallet.provider.getFeeData();
  const priorityMultiplier = gasPriority === 'high' ? 2.0 : gasPriority === 'low' ? 0.8 : 1.2;
  const maxPriorityFeePerGas = BigInt(Math.floor(Number(feeData.maxPriorityFeePerGas || 1000000000) * priorityMultiplier));
  let maxFeePerGas = feeData.maxFeePerGas || (maxPriorityFeePerGas * 2n);
  
  if (gasPriority === 'high') {
    maxFeePerGas = maxFeePerGas * 3n / 2n;
  }

  // A contract deployment transaction is simply a transaction with `to: null`
  // and `data: bytecode`.
  const txRequest: ethers.TransactionRequest = {
    data: finalBytecode,
    type: 2,
    maxPriorityFeePerGas,
    maxFeePerGas,
  };

  console.log("[DEPLOY-ENGINE] Estimating deployment gas...");
  try {
    const gasEstimate = await wallet.estimateGas(txRequest);
    txRequest.gasLimit = gasEstimate * 120n / 100n; // 20% buffer for complex constructors
  } catch (e: any) {
    console.error("[DEPLOY-ENGINE] Gas estimation failed. Bytecode may be invalid or constructor reverts.", e);
    throw new Error(`Deployment failed during gas estimation: ${e.message}`);
  }

  console.log("[DEPLOY-ENGINE] Broadcasting deployment transaction...");
  const tx = await wallet.sendTransaction(txRequest);
  
  console.log(`[DEPLOY-ENGINE] Tx Hash: ${tx.hash}`);
  const receipt = await tx.wait(1);

  if (!receipt || receipt.status === 0) {
    throw new Error("Transaction reverted by the EVM.");
  }

  return {
    contractAddress: receipt.contractAddress,
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed,
  };
}

/**
 * Validates if a string is valid EVM bytecode.
 * Checks for 0x prefix and hex character validity.
 */
export function isValidBytecode(bytecode: string): boolean {
  if (!bytecode) return false;
  const cleaned = bytecode.startsWith('0x') ? bytecode.slice(2) : bytecode;
  if (cleaned.length === 0 || cleaned.length % 2 !== 0) return false;
  return /^[0-9a-fA-F]+$/.test(cleaned);
}
