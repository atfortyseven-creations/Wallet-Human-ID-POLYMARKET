import { Address } from "viem";

export const HUMAN_FI_TREASURY_ADDRESS = "0x0cD73Dde2Ba408dEDC1ae19b6F211f0A525B15F8" as Address;
export const HUMAN_FI_GOVERNANCE_ADDRESS = "0xD4CcA25F164Fbf5AFa6ED2a24bEac7bfFED21899" as Address;

// Base Sepolia Chain ID
export const CHAIN_ID = 84532;

// ABI exports can be added here once we need strict typing for wagmi hooks
export const HUMAN_FI_GOVERNANCE_ABI = [
    // ... (Full ABI to be added from artifacts/contracts/HumanFiGovernance.sol/HumanFiGovernance.json)
    "function zap(uint256 amount) external",
    "function voteWithWorldID(uint256 root, uint256 nullifierHash, uint256[8] proof) external",
] as const;

export const HUMAN_FI_TREASURY_ABI = [
    "function depositFees(address token, uint256 amount) external",
    "function claimReward(address token) external",
] as const;
