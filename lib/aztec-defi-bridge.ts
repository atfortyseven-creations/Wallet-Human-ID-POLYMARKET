/**
 * ============================================================
 * AZTEC CONNECT DEFI BRIDGE ENGINE — Pure On-Chain
 * ============================================================
 * Implements the Aztec Connect DeFi Bridge Proxy mechanics.
 * Allows interacting with L1 DeFi protocols (Yearn, Lido, Element, Curve)
 * from within the Aztec ZK rollup or via L1 directly.
 * ============================================================
 */

import { ethers } from 'ethers';

// ─── Aztec DeFi Bridge Proxy ABI ─────────────────────────────────────────────
export const AZTEC_DEFI_BRIDGE_ABI = [
  "function convert(address depositor, uint256 inputAssetId, uint256 outputAssetIdA, uint256 outputAssetIdB, uint256 totalInputValue, uint256 interactionNonce, uint256 auxData) external payable returns (uint256 outputValueA, uint256 outputValueB, bool isAsync)",
  "function processAsyncDefiInteraction(uint256 interactionNonce) external returns (bool)",
  "function canFinalise(uint256 interactionNonce) view returns (bool)",
];

// Typical Aztec Connect Bridge Deployments on Ethereum Mainnet
export const DEFI_BRIDGES = {
  LIDO: "0x39a04f9A4f9b8849b3De0156C697D6f53e34360e",     // Lido wstETH Bridge
  YEARN: "0xEeA391e63aEA038E8614cbdf6194488A0daE62fB",    // Yearn Vault Bridge
  CURVE: "0x2e0618055E8dC90412EceEB3c5ce105d1dcE9E2a",    // Curve StETH Bridge
} as const;

export type AztecDeFiProtocol = keyof typeof DEFI_BRIDGES;

/**
 * Constructs the complex `auxData` bitfield used in Aztec Connect bridges.
 * In Aztec, a bridge address is mapped to an ID. auxData encodes specific
 * instructions for the bridge (e.g., slipage limits, tranche IDs).
 */
export function encodeBridgeAuxData(
  bridgeAddressId: number,
  customParam1: number = 0,
  customParam2: number = 0
): bigint {
  // 64-bit packing representation often used in Aztec Connect
  let auxData = BigInt(bridgeAddressId);
  auxData = (auxData << 64n) | BigInt(customParam1);
  auxData = (auxData << 64n) | BigInt(customParam2);
  return auxData;
}

/**
 * Interacts directly with an Aztec Connect Bridge Proxy on L1.
 * While normally called by the RollupProcessor, we can construct the exact
 * payload to simulate or execute direct integration testing on-chain.
 */
export async function executeDirectBridgeConversion(
  wallet: ethers.Wallet,
  protocol: AztecDeFiProtocol,
  inputAssetId: number,
  outputAssetIdA: number,
  outputAssetIdB: number,
  totalInputValueWei: bigint,
  interactionNonce: number,
  auxData: bigint
): Promise<ethers.TransactionReceipt | null> {
  if (!wallet.provider) throw new Error("Wallet not connected to provider");

  const bridgeAddress = DEFI_BRIDGES[protocol];
  const bridgeContract = new ethers.Contract(bridgeAddress, AZTEC_DEFI_BRIDGE_ABI, wallet);

  // EIP-1559 Fee construction
  const feeData = await wallet.provider.getFeeData();
  const txOptions: ethers.TransactionRequest = {
    maxFeePerGas: feeData.maxFeePerGas,
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
    type: 2,
    // If ETH is the input asset (Asset ID 0), we must attach the value
    value: inputAssetId === 0 ? totalInputValueWei : 0n,
  };

  console.log(`[AZTEC-DEFI] Initiating L1 Conversion to ${protocol} Bridge...`);
  
  // Note: On Mainnet, only the RollupProcessor can call this successfully on most bridges.
  // This is a structural representation of the exact call.
  let gasEstimate: bigint;
  try {
    gasEstimate = await bridgeContract.convert.estimateGas(
      wallet.address,
      inputAssetId,
      outputAssetIdA,
      outputAssetIdB,
      totalInputValueWei,
      interactionNonce,
      auxData,
      txOptions
    );
  } catch (err) {
    console.warn("[AZTEC-DEFI] estimateGas reverted. The bridge may enforce msg.sender == RollupProcessor. Compiling raw payload fallback.");
    gasEstimate = 500000n; // Fallback for complex DeFi execution
  }

  txOptions.gasLimit = gasEstimate * 120n / 100n;

  try {
    const tx = await bridgeContract.convert(
      wallet.address,
      inputAssetId,
      outputAssetIdA,
      outputAssetIdB,
      totalInputValueWei,
      interactionNonce,
      auxData,
      txOptions
    );
    
    console.log(`[AZTEC-DEFI] Bridge Transaction Broadcast: ${tx.hash}`);
    return await tx.wait(1);
  } catch (error: any) {
    console.error("[AZTEC-DEFI] Execution failed:", error);
    throw error;
  }
}

/**
 * Checks if an asynchronous Aztec DeFi interaction is ready to be finalized.
 * Protocols like Element or Lido withdrawals are async and take time.
 */
export async function checkAsyncDefiFinalisation(
  provider: ethers.Provider,
  protocol: AztecDeFiProtocol,
  interactionNonce: number
): Promise<boolean> {
  const bridgeAddress = DEFI_BRIDGES[protocol];
  const bridgeContract = new ethers.Contract(bridgeAddress, AZTEC_DEFI_BRIDGE_ABI, provider);

  try {
    return await bridgeContract.canFinalise(interactionNonce);
  } catch (e) {
    return false;
  }
}

/**
 * Processes an async interaction once it can be finalized.
 */
export async function finalizeAsyncDefiInteraction(
  wallet: ethers.Wallet,
  protocol: AztecDeFiProtocol,
  interactionNonce: number
): Promise<ethers.TransactionReceipt | null> {
  const bridgeAddress = DEFI_BRIDGES[protocol];
  const bridgeContract = new ethers.Contract(bridgeAddress, AZTEC_DEFI_BRIDGE_ABI, wallet);

  const feeData = await wallet.provider!.getFeeData();
  
  const tx = await bridgeContract.processAsyncDefiInteraction(interactionNonce, {
    maxFeePerGas: feeData.maxFeePerGas,
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
    type: 2,
  });

  return await tx.wait(1);
}
