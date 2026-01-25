import { createPublicClient, http } from "viem";
import { polygon } from "viem/chains";

// --------------------------------------------------------------------------
// ACCOUNT ABSTRACTION CONFIG (TEMPLATE)
// --------------------------------------------------------------------------
// This file assumes the use of Alchemy Account Kit or Pimlico.
// Steps to enable:
// 1. Install dependencies: npm install @alchemy/aa-core @alchemy/aa-alchemy
// 2. Set NEXT_PUBLIC_ALCHEMY_API_KEY in .env.local
// --------------------------------------------------------------------------

export const chain = polygon;
export const transport = http(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL);

// Mock function to simulate Smart Account creation/connection
// In production, this would use `createModularAccountAlchemyClient` from @alchemy/aa-alchemy
export const createSmartAccountClient = async (signer: any) => {
    console.log("Initializing Smart Account for signer:", signer);

    // logic to wrap the signer (EOA) into a Smart Account (ERC-4337)
    // const smartAccountClient = await createModularAccountAlchemyClient({ ... });

    return {
        address: "0xSmartAccountAddress...",
        type: "LightAccount",
        sponsorGas: true // Paymaster enabled
    };
};

export const paymasterPolicy = {
    // Define gas sponsorship rules
    sponsorshipPolicyId: "POLYGON_GASLESS_POLICY",
};
