import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SignJWT } from 'jose';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { address, ...proof } = body;

        // Pull from Environment for Production Readiness
        const app_id = (process.env.NEXT_PUBLIC_AUTH_APP_ID || "app_affe7470221b57a8edee20b3ac30c484").trim();
        const action = (process.env.NEXT_PUBLIC_AUTH_ACTION || "polymarket-wallet").trim();

        if (!app_id) {
            console.error(" CRITICAL: NEXT_PUBLIC_AUTH_APP_ID is missing in server environment");
            return NextResponse.json({ verified: false, detail: "Server Configuration Error" }, { status: 500 });
        }

        console.log(`[Verify]  Verifying World ID for address: ${address}`);

        const verifyRes = await fetch(`https://developer.identity.org/api/v2/verify/${app_id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...proof, action }),
        });

        const contentType = verifyRes.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
             return NextResponse.json({ verified: false, detail: "Identity API Error: Non-JSON Response" }, { status: 502 });
        }

        const wldResponse = await verifyRes.json();

        if (verifyRes.ok) {
            console.log(`[Verify]  Verification successful for ${address}`);
            
            // Sync with Database
            if (address && prisma) {
                try {
                    await prisma.user.upsert({
                        where: { walletAddress: address.toLowerCase() },
                        update: {
                            worldIdNullifierHash: wldResponse.nullifier_hash,
                            tier: 'HUMAN'
                        },
                        create: {
                            walletAddress: address.toLowerCase(),
                            worldIdNullifierHash: wldResponse.nullifier_hash,
                            tier: 'HUMAN',
                        }
                    });
                    console.log(`[Verify]  User ${address} updated to HUMAN in DB.`);
                } catch (dbError) {
                    console.error("[Verify]  DB Sync Failed:", dbError);
                }
            }

            // 2. Prepare Response with Security Cookies for Middleware
            const response = NextResponse.json({
                verified: true,
                nullifier_hash: wldResponse.nullifier_hash
            });

            // "THE IRON GATE" Bypass: Set cookies that middleware expects
            const cookieOptions = {
                path: '/',
                maxAge: 60 * 60 * 24 * 7,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax' as const
            };
            
            // CRITICAL SECURITY FIX: Hardcoded fallback JWT secret removed.
            // 'WhaleAlert_KYC_MasterKey_2026_Secure' was in plain-text source code.
            // Any attacker with source access could forge KYC tokens and bypass
            // the Iron Gate middleware, gaining full system platform access.
            // In production: server will return 500 rather than issue a forged token.
            const rawSecret = process.env.KYC_SECRET;
            if (!rawSecret) {
                console.error('[Verify]  CRITICAL: KYC_SECRET environment variable is not set.');
                return NextResponse.json({ verified: false, detail: 'Server configuration error: KYC secret missing.' }, { status: 500 });
            }
            const JWT_SECRET = new TextEncoder().encode(rawSecret);
            const token = await new SignJWT({ address: address.toLowerCase(), status: 'APPROVED' })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime('7d')
                .sign(JWT_SECRET);

            response.cookies.set('kyc_token', token, cookieOptions);
            response.cookies.set('kyc_status', 'APPROVED', { ...cookieOptions, httpOnly: false });
            response.cookies.set('human_session', 'true', cookieOptions);

            return response;
        } else {
            console.warn(`[Verify] ️ Verification failed:`, wldResponse);
            return NextResponse.json({
                verified: false,
                code: wldResponse.code,
                detail: wldResponse.detail
            }, { status: 400 });
        }
    } catch (error: any) {
        console.error(" Internal Verification Error:", error);
        return NextResponse.json({ verified: false, detail: error.message || "Internal Server Error" }, { status: 500 });
    }
}

