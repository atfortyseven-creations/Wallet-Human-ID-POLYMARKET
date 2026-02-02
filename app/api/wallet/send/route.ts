import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { ethers } from 'ethers';
import crypto from 'crypto';

// Initialize Alchemy provider
const provider = new ethers.AlchemyProvider(
    'mainnet',
    process.env.ALCHEMY_API_KEY || ''
);

// Decryption function (mirrors encryption in wallet/route.ts)
function decrypt(encryptedText: string): string {
    if (!process.env.WALLET_ENCRYPTION_KEY || process.env.WALLET_ENCRYPTION_KEY.length < 32) {
        throw new Error('Critical Security Error: Wallet encryption key is missing or weak. Please configure a 32-character key in environment variables.');
    }

    const [ivHex, encryptedHex, authTagHex] = encryptedText.split(':');
    const key = crypto.createHash('sha256').update(String(process.env.WALLET_ENCRYPTION_KEY)).digest();
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

export async function POST(req: Request) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { to, amount, token } = await req.json();

        // Validate inputs
        if (!ethers.isAddress(to)) {
            return NextResponse.json({ error: 'Invalid recipient address' }, { status: 400 });
        }

        if (!amount || parseFloat(amount) <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        // Get user's wallet from database
        const email = user.emailAddresses[0]?.emailAddress;
        const authUser = await prisma.authUser.findUnique({
            where: { email },
        });

        if (!authUser || !authUser.encryptedPrivateKey) {
            return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
        }

        // Decrypt private key
        const privateKey = decrypt(authUser.encryptedPrivateKey);
        const wallet = new ethers.Wallet(privateKey, provider);

        // Build transaction
        const tx = {
            to: to,
            value: ethers.parseEther(amount),
            gasLimit: 21000,
        };

        // Get current gas price
        const feeData = await provider.getFeeData();
        if (feeData.gasPrice) {
            (tx as any).gasPrice = feeData.gasPrice;
        }

        // Sign and send transaction
        const signedTx = await wallet.sendTransaction(tx);
        
        // Save transaction to database
        await prisma.transaction.create({
            data: {
                authUserId: authUser.id,
                hash: signedTx.hash,
                from: wallet.address,
                to: to,
                value: amount,
                status: 'CONFIRMED',
                type: 'SEND',
                chainId: 1, // Default to Ethereum Mainnet
                tokenSymbol: 'ETH'
            },
        });

        return NextResponse.json({
            success: true,
            txHash: signedTx.hash,
            explorerUrl: `https://etherscan.io/tx/${signedTx.hash}`,
        });

    } catch (error: any) {
        console.error('Send transaction error:', error);
        return NextResponse.json(
            { error: error.message || 'Transaction failed' },
            { status: 500 }
        );
    }
}
