import { Address, TypedDataDomain } from 'viem';

/**
 * 1inch Limit Order Protocol V3 Typed Data Definition (EIP-712)
 */
export const ONEINCH_LIMIT_ORDER_V3_TYPE = {
  Order: [
    { name: 'salt', type: 'uint256' },
    { name: 'makerAsset', type: 'address' },
    { name: 'takerAsset', type: 'address' },
    { name: 'maker', type: 'address' },
    { name: 'receiver', type: 'address' },
    { name: 'allowedSender', type: 'address' },
    { name: 'makingAmount', type: 'uint256' },
    { name: 'takingAmount', type: 'uint256' },
    { name: 'offsets', type: 'uint256' },
    { name: 'interactions', type: 'bytes' },
  ],
} as const;

export function get1inchOrderDomain(chainId: number): TypedDataDomain {
  return {
    name: '1inch Limit Order Protocol',
    version: '3',
    chainId: chainId,
    verifyingContract: '0x1111111254EEB25477B68fb85Ed929f73A960582', // Standard 1inch V3 Contract
  };
}

/**
 * Flashbots Protect RPC Endpoints
 */
export const FLASHBOTS_RPC = {
    1: 'https://rpc.flashbots.net',
    // Fallback or others can be added here
};
