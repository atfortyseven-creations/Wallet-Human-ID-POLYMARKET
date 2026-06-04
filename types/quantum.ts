/**
 * Quantum Architecture Type Definitions
 * 
 * Strict cryptographic interfaces for the Aztec Network Shielded State.
 * These types enforce mathematical correctness at compile time for all
 * zero-knowledge state transitions and ledger operations.
 */

export interface ZKStateCommitment {
    readonly entropyHash: `0x${string}`;
    readonly nullifier: `0x${string}`;
    readonly timestampMs: number;
}

export interface ShieldedAssetMetrics {
    readonly label: string;
    readonly value: string | number;
    readonly unit?: string;
    readonly icon?: React.ReactNode;
    readonly privacyLevel: 'PUBLIC' | 'SHIELDED' | 'DARK';
}

export interface CoreDotsProtocolConstraints {
    readonly standard: 'ERC-20 + ERC-2612 (Permit)';
    readonly entropySource: '256-bit CSPRNG';
    readonly metadataEncoding: 'ABI-encoded route + ms-timestamp';
    readonly proofType: 'Keccak-256 payload hash' | 'Noir ZK-SNARK';
}
