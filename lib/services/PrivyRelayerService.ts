import * as jose from 'jose';

/**
 * Privy.io API Relayer
 * Automates fallback between multiple Privy App IDs for maximum precision and uptime.
 */

export interface PrivyAppConfig {
    appId: string;
    jwksUrl: string;
}

const PRIVY_APPS: PrivyAppConfig[] = [
    //  Original Apps 
    {
        appId: 'cmpefwexw00b00cjvngj1bmzs',
        jwksUrl: 'https://auth.privy.io/api/v1/apps/cmpefwexw00b00cjvngj1bmzs/jwks.json'
    },
    {
        appId: 'cmpefrvwr006q0dibyqg1hp4n',
        jwksUrl: 'https://auth.privy.io/api/v1/apps/cmpefrvwr006q0dibyqg1hp4n/jwks.json'
    },
    {
        appId: 'cmpefovkg008o0bl7ddzo3bhj',
        jwksUrl: 'https://auth.privy.io/api/v1/apps/cmpefovkg008o0bl7ddzo3bhj/jwks.json'
    },
    //  Expansion Apps (500 MAU each) 
    {
        appId: 'cmpftp6px00ip0cl47m7nuqvg',
        jwksUrl: 'https://auth.privy.io/api/v1/apps/cmpftp6px00ip0cl47m7nuqvg/jwks.json'
    },
    {
        appId: 'cmpfwxqz3004g0cl2pt3df3kh',
        jwksUrl: 'https://auth.privy.io/api/v1/apps/cmpfwxqz3004g0cl2pt3df3kh/jwks.json'
    },
    {
        appId: 'cmpfx0mdv00z50dl5e00bgu9t',
        jwksUrl: 'https://auth.privy.io/api/v1/apps/cmpfx0mdv00z50dl5e00bgu9t/jwks.json'
    },
    {
        appId: 'cmpfy1p4o00jl0cjvwlt2ezoi',
        jwksUrl: 'https://auth.privy.io/api/v1/apps/cmpfy1p4o00jl0cjvwlt2ezoi/jwks.json'
    },
    {
        appId: 'cmpfy4c9s00o80djp38jb5ag9',
        jwksUrl: 'https://auth.privy.io/api/v1/apps/cmpfy4c9s00o80djp38jb5ag9/jwks.json'
    },
    {
        appId: 'cmpfy6dcv00ph0cl5178i52tj',
        jwksUrl: 'https://auth.privy.io/api/v1/apps/cmpfy6dcv00ph0cl5178i52tj/jwks.json'
    },
];

export class PrivyRelayerService {
    // Cache the JWKS instances to avoid fetching the JSON repeatedly
    private jwksClients: Map<string, ReturnType<typeof jose.createRemoteJWKSet>> = new Map();

    constructor() {
        PRIVY_APPS.forEach(app => {
            this.jwksClients.set(app.appId, jose.createRemoteJWKSet(new URL(app.jwksUrl)));
        });
    }

    /**
     * Verifies a Privy JWT by iterating through the available App IDs.
     * Returns the decoded payload if successful.
     */
    public async verifyToken(token: string): Promise<jose.JWTPayload | null> {
        let lastError: any = null;

        for (const app of PRIVY_APPS) {
            try {
                const JWKS = this.jwksClients.get(app.appId);
                if (!JWKS) continue;

                const { payload } = await jose.jwtVerify(token, JWKS, {
                    issuer: 'privy.io',
                    audience: app.appId
                });

                console.log(`[PrivyRelayer] JWT verified successfully using App ID: ${app.appId}`);
                return payload;
            } catch (err: any) {
                // If it's a verification failure, it might belong to another app ID.
                // We just record the error and try the next app ID.
                lastError = err;
            }
        }

        console.error('[PrivyRelayer] JWT verification failed across all configured Privy App IDs.', lastError?.message);
        return null;
    }

    /**
     * Extracts the primary wallet address from the Privy JWT payload.
     */
    public getWalletAddress(payload: jose.JWTPayload): string | null {
        // Privy typically embeds linked accounts or the primary wallet in the token payload
        // Alternatively, the user id (did:privy:...) can be used to query the API for wallets.
        // We look for 'linked_accounts' or similar fields if present, or just the subject.
        
        // As a fallback for "everything on chain", we check if the wallet address is passed in the request
        // and only authorize if the token is valid.
        
        return null; // Will refine based on exact payload structure, or we just use it for auth guard.
    }

    /**
     * Privy also provides RPC nodes. This relayer returns a valid Privy RPC URL.
     * It uses the App ID as the auth parameter.
     */
    public getRpcUrl(chainId: number): string | null {
        // Privy currently supports select networks on its RPC.
        // Assuming the app id is passed via query param or headers.
        // For standard EVM RPC, Privy uses `rpc.privy.io` or similar per-app endpoints.
        // E.g. https://rpc.privy.io/v1/chain/{chainId}?privy-app-id={appId}
        const app = PRIVY_APPS[0]; // Can implement round-robin if needed
        return `https://rpc.privy.io?privyAppId=${app.appId}`;
    }

    /**
     * Fetch on-chain balances from Privy API, rotating keys if one is exhausted (429 or 401).
     * Note: Privy REST API usually requires App ID and App Secret. We use App ID as username.
     * We pull the App Secret from ENV vars dynamically if available, otherwise just use the App ID.
     */
    public async fetchBalances(address: string, chain: string): Promise<any> {
        let lastError: any = null;

        for (const app of PRIVY_APPS) {
            try {
                // Determine the secret from env: e.g., PRIVY_SECRET_cmpefwexw00b00cjvngj1bmzs
                const secret = process.env[`PRIVY_SECRET_${app.appId}`] || process.env.PRIVY_APP_SECRET || '';
                const authString = Buffer.from(`${app.appId}:${secret}`).toString('base64');

                const response = await fetch(`https://api.privy.io/v1/wallets/${address}/balance?chain=${chain}&include_currency=usd`, {
                    headers: {
                        'Authorization': `Basic ${authString}`,
                        'privy-app-id': app.appId,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 429) {
                    console.warn(`[PrivyRelayer] Rate limited (429) for App ID: ${app.appId}. Rotating to next key...`);
                    continue; // Exhausted, rotate
                }

                if (!response.ok) {
                    throw new Error(`Privy API Error: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                console.log(`[PrivyRelayer] Successfully fetched balances using App ID: ${app.appId}`);
                return data;
            } catch (err: any) {
                lastError = err;
                console.warn(`[PrivyRelayer] Failed to fetch balances for App ID ${app.appId}:`, err.message);
            }
        }

        console.error('[PrivyRelayer] All Privy APIs exhausted or failed for portfolio fetch.');
        return null;
    }
}

export const privyRelayer = new PrivyRelayerService();
