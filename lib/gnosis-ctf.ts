import { keccak256, encodePacked } from 'viem';

/**
 * Gnosis Conditional Tokens Framework (CTF) Utilities
 */

// 1. Condition ID Generation
// The Condition ID is the key identifier for any question in the CTF.
// It is deterministically generated from:
// - oracle: The address of the oracle (UMA Adapter)
// - questionId: A unique identifier for the question (usually IPFS hash or similar)
// - outcomeSlotCount: Number of outcomes (2 for Binary: YES/NO)
export const getConditionId = (
    oracle: string,
    questionId: `0x${string}`,
    outcomeSlotCount: number = 2
): `0x${string}` => {
    return keccak256(
        encodePacked(
            ['address', 'bytes32', 'uint256'],
            [oracle as `0x${string}`, questionId, BigInt(outcomeSlotCount)]
        )
    );
};

// 2. Collection ID Generation
// A Collection ID represents a specific subset of outcomes (Index Set) for a condition.
// For binary markets, we usually care about:
// - YES (Index Set 1) -> Collection ID for holding "YES" tokens
// - NO (Index Set 2) -> Collection ID for holding "NO" tokens
export const getCollectionId = (
    parentCollectionId: `0x${string}`, // Usually bytes32(0) for base conditions
    conditionId: `0x${string}`,
    indexSet: number
): `0x${string}` => {
    return keccak256(
        encodePacked(
            ['bytes32', 'bytes32', 'uint256'],
            [parentCollectionId, conditionId, BigInt(indexSet)]
        )
    );
};

// 3. Position ID Generation
// The Position ID is the Token ID in the ERC-1155 contract.
// It maps to a specific Collateral Token and a Collection ID.
export const getPositionId = (
    collateralToken: string,
    collectionId: `0x${string}`
): bigint => {
    const hash = keccak256(
        encodePacked(
            ['address', 'bytes32'],
            [collateralToken as `0x${string}`, collectionId]
        )
    );
    return BigInt(hash);
};

// 4. Index Sets (Bitmasks) for Binary Markets (YES/NO)
// Gnosis CTF uses bitmasks to represent outcome sets.
// For 2 outcomes (A and B):
// A is at index 0 -> 1 << 0 = 1 (Binary 01)
// B is at index 1 -> 1 << 1 = 2 (Binary 10)
// Both (Full Set) -> 1 | 2 = 3 (Binary 11)
export const INDEX_SETS = {
    YES: 1,  // 01
    NO: 2,   // 10
    FULL: 3  // 11
};
