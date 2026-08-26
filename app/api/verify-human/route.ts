import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

        // [SECURITY PATCH B4]: Enforce Session Ownership
        const { getSession } = await import('@/lib/session');
        const session = await getSession();
        if (!session?.userId || session.userId.toLowerCase() !== address.toLowerCase()) {
             return NextResponse.json({ verified: false, detail: 'Forbidden: Address mismatch with session.' }, { status: 403 });
        }

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
            
            // Only set kyc_status for client UI logic, without overwriting secure sessions
            response.cookies.set('kyc_status', 'APPROVED', { ...cookieOptions, httpOnly: false });

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

