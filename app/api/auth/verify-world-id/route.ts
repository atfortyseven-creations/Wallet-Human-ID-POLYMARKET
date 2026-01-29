import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyWorldIDProof } from "@/lib/worldid";
import { cookies } from "next/headers";
import { SignJWT } from "jose";

const prisma = new PrismaClient();

// Secret para JWT (Debería estar en env, usamos un fallback seguro para dev)
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key-change-in-prod";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { proof, walletAddress } = body;

        // 1. Validar input básico
        if (!proof || !proof.nullifier_hash) {
            return NextResponse.json(
                { error: "Missing proof data" },
                { status: 400 }
            );
        }

        // 2. Verificar la prueba con Worldcoin
        const app_id = process.env.NEXT_PUBLIC_WLD_APP_ID || process.env.WLD_APP_ID || "app_d2014c58bb084dcb09e1f3c1c1144287";
        const action = "login";

        console.log("Verifying World ID with:", { app_id, action, hasProof: !!proof });

        const verifyRes = await verifyWorldIDProof(
            {
                proof: proof.proof,
                merkle_root: proof.merkle_root,
                nullifier_hash: proof.nullifier_hash,
                verification_level: proof.verification_level,
            },
            app_id,
            action
        );

        if (!verifyRes.success) {
            console.error("World ID Verification failed:", verifyRes);
            return NextResponse.json(
                { error: "Invalid World ID proof", detail: verifyRes.detail },
                { status: 401 }
            );
        }

        const nullifierHash = proof.nullifier_hash;

        // 3. Lógica de Usuario y Base de Datos
        let user = await prisma.user.findUnique({
            where: { worldIdNullifierHash: nullifierHash },
        });

        if (!user) {
            if (walletAddress) {
                const existingUserByWallet = await prisma.user.findUnique({
                    where: { walletAddress: walletAddress },
                });

                if (existingUserByWallet) {
                    if (existingUserByWallet.worldIdNullifierHash && existingUserByWallet.worldIdNullifierHash !== nullifierHash) {
                        return NextResponse.json(
                            { error: "Wallet already linked to another World ID" },
                            { status: 409 }
                        );
                    }

                    user = await prisma.user.update({
                        where: { walletAddress: walletAddress },
                        data: { worldIdNullifierHash: nullifierHash },
                    });
                } else {
                    user = await prisma.user.create({
                        data: {
                            walletAddress: walletAddress,
                            worldIdNullifierHash: nullifierHash,
                        },
                    });

                    await prisma.userMetrics.create({
                        data: { userAddress: walletAddress }
                    });
                }
            } else {
                const tempWalletAddress = `worldid_${nullifierHash.slice(0, 16)}`;

                user = await prisma.user.create({
                    data: {
                        walletAddress: tempWalletAddress,
                        worldIdNullifierHash: nullifierHash,
                    },
                });

                await prisma.userMetrics.create({
                    data: { userAddress: tempWalletAddress }
                });
            }
        }

        // 4. [NEW] Create Session in Database
        const sessionToken = crypto.randomUUID(); // Secure random session ID
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

        // Get optional request info for security tracking
        const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        // Create session record
        const session = await prisma.session.create({
            data: {
                userId: user.walletAddress,
                sessionToken,
                expiresAt,
                ipAddress,
                userAgent,
            }
        });

        // 5. [UPDATED] Generate JWT with session token (1 hour expiration)
        const token = await new SignJWT({
            sub: user.walletAddress,
            nullifier: user.worldIdNullifierHash,
            sessionId: session.id, // Link to database session
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('1h') // Changed from 24h to 1h
            .sign(new TextEncoder().encode(JWT_SECRET));

        // 6. [UPDATED] Set SESSION cookie (expires when browser closes)
        cookies().set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            // NO maxAge = session cookie, expires when browser closes
            sameSite: 'lax', // CSRF protection
            path: "/",
        });

        return NextResponse.json({
            success: true,
            token: token,
            user: {
                address: user.walletAddress,
                verified: true
            }
        });

    } catch (error) {
        console.error("Auth Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
