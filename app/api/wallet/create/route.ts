import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { ethers } from 'ethers';
import { encrypt, isValidPrivateKey } from '@/lib/wallet/encryption';

/**
 * Private WALLET CREATION ENDPOINT
 * Creates a new Ethereum wallet for SIWE-authenticated users.
 * Encrypts and stores private key securely in the AuthUser database.
 *
 * POST /api/wallet/create
 * Returns: { address: string, created: boolean }
 */

export async function POST(req: Request) {
    try {
        // 1. Authenticate via System SIWE Session
        const session = await getSession();
        if (!session || !session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const email = session.email;
        if (!email) {
            return NextResponse.json({ error: 'Session email not found' }, { status: 400 });
        }

        // 2. Check if user already has a wallet
        const existingUser = await prisma.authUser.findUnique({
            where: { email },
            select: { walletAddress: true, encryptedPrivateKey: true }
        });

        if (existingUser?.walletAddress && existingUser?.encryptedPrivateKey) {
            return NextResponse.json({
                address: existingUser.walletAddress,
                created: false,
                message: 'Wallet already exists'
            });
        }

        // 3. Generate new Ethereum wallet
        const wallet = ethers.Wallet.createRandom();
        const address = wallet.address;
        const privateKey = wallet.privateKey;

        // 4. Validate private key
        if (!isValidPrivateKey(privateKey)) {
            throw new Error('Generated invalid private key');
        }

        // 5. Encrypt private key using the System encryption module
        const encryptedPrivateKey = encrypt(privateKey);

        // 6. Persist to AuthUser  only fields that exist in schema.prisma
        await prisma.authUser.upsert({
            where: { email },
            update: {
                walletAddress: address,
                encryptedPrivateKey,
            },
            create: {
                email,
                walletAddress: address,
                encryptedPrivateKey,
            }
        });

        // 7. Log security event  using correct schema field `authUserId`
        const authUser = await prisma.authUser.findUnique({ where: { email }, select: { id: true } });
        await prisma.securityEvent.create({
            data: {
                type: 'WALLET_CREATED',
                authUserId: authUser?.id || null,
                ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
                userAgent: req.headers.get('user-agent') || undefined,
                severity: 'INFO',
                details: JSON.stringify({ address, timestamp: new Date().toISOString() })
            }
        });

        console.log(` System wallet created for ${email}: ${address}`);

        return NextResponse.json({
            success: true,
            address,
            created: true,
            message: 'Wallet created successfully'
        });

    } catch (error: any) {
        console.error(' Wallet creation error:', error);

        // Log error event using correct schema
        try {
            await prisma.securityEvent.create({
                data: {
                    type: 'WALLET_CREATION_FAILED',
                    authUserId: null,
                    ipAddress: 'unknown',
                    severity: 'CRITICAL',
                    details: JSON.stringify({ error: error.message, timestamp: new Date().toISOString() })
                }
            });
        } catch (logError) {
            console.error('Failed to log error event:', logError);
        }

        return NextResponse.json(
            { error: error.message || 'Failed to create wallet' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/wallet/create
 * Check if the SIWE-authenticated user has a wallet
 */
export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session || !session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const email = session.email;
        if (!email) {
            return NextResponse.json({ error: 'Session email not found' }, { status: 400 });
        }

        const authUser = await prisma.authUser.findUnique({
            where: { email },
            select: { walletAddress: true }
        });

        return NextResponse.json({
            hasWallet: !!authUser?.walletAddress,
            address: authUser?.walletAddress || null
        });

    } catch (error: any) {
        console.error('Wallet check error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to check wallet' },
            { status: 500 }
        );
    }
}
