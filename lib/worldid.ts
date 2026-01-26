/**
 * World ID Verification Utilities (Server-Side)
 * 
 * Replaces @worldcoin/idkit import to avoid React dependencies in API routes.
 * Uses direct REST API calls to Worldcoin Developer Portal.
 */

interface IVerifyResponse {
    success: boolean;
    code?: string;
    detail?: string;
    attribute?: string;
}

interface IVerifyRequest {
    proof: string;
    merkle_root: string;
    nullifier_hash: string;
    verification_level: string;
    signal?: string;
}

/**
 * Verifies a World ID proof using the Worldcoin API
 * @param proof The proof data object
 * @param app_id The app ID (e.g., app_...)
 * @param action The action ID
 * @returns Verification response
 */
export async function verifyWorldIDProof(
    proof: IVerifyRequest,
    app_id: string,
    action: string
): Promise<IVerifyResponse> {
    try {
        const response = await fetch(
            `https://developer.worldcoin.org/api/v1/verify/${app_id}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...proof,
                    action,
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                success: false,
                code: errorData.code || 'server_error',
                detail: errorData.detail || 'Failed to verify proof',
            };
        }

        const data = await response.json();
        return {
            success: true,
            ...data,
        };
    } catch (error) {
        console.error('World ID verification error:', error);
        return {
            success: false,
            code: 'network_error',
            detail: 'Failed to contact Worldcoin API',
        };
    }
}
