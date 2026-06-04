/**
 * ============================================================
 * LAYERZERO OMNICHAIN MESSAGING ENGINE (V2)
 * ============================================================
 * Omnichain interoperability protocol engine.
 * Allows sending raw payloads and natively querying exact cross-chain
 * message quotes from the LayerZero Endpoint contracts.
 * ============================================================
 */

import { ethers } from 'ethers';

// Global LayerZero V2 Endpoint Address (Consistent across almost all EVM chains)
export const LZ_ENDPOINT_V2 = "0x1a44076050125825900e736c501f859c50fE728c";

// Standard LayerZero V2 Endpoint ABI required for Omnichain Messaging
export const LZ_ENDPOINT_ABI = [
  "function quote(tuple(uint32 dstEid, bytes32 receiver, bytes message, bytes options, bool payInLzToken) _params, address _sender) view returns (tuple(uint256 nativeFee, uint256 lzTokenFee) fee)",
  "function send(tuple(uint32 dstEid, bytes32 receiver, bytes message, bytes options, bool payInLzToken) _params, tuple(uint256 nativeFee, uint256 lzTokenFee) _fee) payable returns (tuple(bytes32 guid, uint64 nonce, tuple(uint256 nativeFee, uint256 lzTokenFee) fee) receipt)"
];

// Mapping of Chain to LayerZero Endpoint IDs (EID)
export const LZ_EIDS: Record<string, number> = {
  ethereum: 30101,
  arbitrum: 30110,
  optimism: 30111,
  polygon: 30109,
  base: 30184,
  avalanche: 30106,
};

export interface LzSendParams {
  dstEid: number;
  receiverHex32: string; // Must be padded to bytes32
  message: string;       // Hex encoded payload
  options: string;       // Execution options (e.g. extra gas on destination)
  payInLzToken: boolean;
}

export interface LzFeeInfo {
  nativeFee: bigint;
  lzTokenFee: bigint;
}

export interface LzReceipt {
  guid: string;
  nonce: bigint;
  fee: LzFeeInfo;
}

/**
 * Calculates the exact native gas fee required to send a cross-chain message.
 */
export async function quoteLayerZeroMessage(
  provider: ethers.Provider,
  sender: string,
  params: LzSendParams
): Promise<LzFeeInfo> {
  const endpoint = new ethers.Contract(LZ_ENDPOINT_V2, LZ_ENDPOINT_ABI, provider);
  
  const payloadTuple = [
    params.dstEid,
    params.receiverHex32,
    params.message,
    params.options,
    params.payInLzToken
  ];

  try {
    const feeQuote = await endpoint.quote(payloadTuple, sender);
    return {
      nativeFee: BigInt(feeQuote.nativeFee),
      lzTokenFee: BigInt(feeQuote.lzTokenFee)
    };
  } catch (error: any) {
    console.error("[LAYERZERO-ENGINE] Quote calculation failed:", error);
    throw new Error(`L0 Quote Failure: ${error.message}`);
  }
}

/**
 * Broadcasts an Omnichain message across the LayerZero network.
 */
export async function sendLayerZeroMessage(
  wallet: ethers.Wallet,
  params: LzSendParams,
  feeQuote: LzFeeInfo
): Promise<{ txHash: string; receipt: LzReceipt | null }> {
  if (!wallet.provider) throw new Error("Wallet not connected to provider");

  const endpoint = new ethers.Contract(LZ_ENDPOINT_V2, LZ_ENDPOINT_ABI, wallet);

  const payloadTuple = [
    params.dstEid,
    params.receiverHex32,
    params.message,
    params.options,
    params.payInLzToken
  ];

  const feeTuple = [
    feeQuote.nativeFee,
    feeQuote.lzTokenFee
  ];

  const networkFeeData = await wallet.provider.getFeeData();

  console.log(`[LAYERZERO-ENGINE] Transmitting Omnichain payload to EID ${params.dstEid}...`);

  const tx = await endpoint.send(payloadTuple, feeTuple, {
    value: feeQuote.nativeFee, // Native ETH/MATIC required to pay relayers
    maxFeePerGas: networkFeeData.maxFeePerGas,
    maxPriorityFeePerGas: networkFeeData.maxPriorityFeePerGas,
    type: 2
  });

  console.log(`[LAYERZERO-ENGINE] Tx Broadcast: ${tx.hash}`);

  // We do not wait for the L0 receipt parsing as it's complex, just return hash for now
  return {
    txHash: tx.hash,
    receipt: null 
  };
}
