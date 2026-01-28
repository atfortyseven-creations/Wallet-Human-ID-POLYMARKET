import { ethers } from "ethers";

/**
 * ComplianceMiddleware
 * 
 * Simulates a server-side signer ensuring users are not from restricted jurisdictions (OFAC/AML).
 * In production this would run on a secure server (e.g., AWS Lambda) with geo-ip checks.
 */
export class ComplianceMiddleware {
    private signer: ethers.Wallet;

    constructor(privateKey: string) {
        this.signer = new ethers.Wallet(privateKey);
    }

    /**
     * Checks if a user is compliant and returns a signature if so.
     * @param userAddress The EVM address of the user.
     * @param countryCode ISO-3166-1 alpha-2 code (e.g., 'US', 'DE').
     */
    async getComplianceProof(userAddress: string, countryCode: string): Promise<string | null> {
        // 1. Check Blacklist (Mock)
        if (this.isRestricted(countryCode)) {
            console.warn(`BLOCKED: User ${userAddress} is from restricted country ${countryCode}`);
            return null;
        }

        // 2. Generate Signature
        // Structure: keccak256(abi.encodePacked(userAddress, "COMPLIANT"))
        const messageHash = ethers.solidityPackedKeccak256(
            ["address", "string"],
            [userAddress, "COMPLIANT"]
        );

        // Ethers v6 signMessage handles the "\x19Ethereum Signed Message:\n" prefix automatically
        const signature = await this.signer.signMessage(ethers.getBytes(messageHash));

        return signature;
    }

    private isRestricted(countryCode: string): boolean {
        // Mock Restricted List (OFAC + Crypto Ban list examples)
        const RESTRICTED_COUNTRIES = ['US', 'KP', 'IR', 'CU', 'SY', 'RU'];
        return RESTRICTED_COUNTRIES.includes(countryCode);
    }
}

// Sandbox test execution
async function test() {
    // Random wallet for signer
    const mockSigner = ethers.Wallet.createRandom();
    const middleware = new ComplianceMiddleware(mockSigner.privateKey);

    const user = "0x1234567890123456789012345678901234567890";

    console.log("Testing Allowed Country (DE):", await middleware.getComplianceProof(user, "DE"));
    console.log("Testing Restricted Country (US):", await middleware.getComplianceProof(user, "US"));
}
