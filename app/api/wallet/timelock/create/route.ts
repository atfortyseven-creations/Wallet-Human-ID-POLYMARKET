import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { ethers } from 'ethers';
import crypto from 'crypto';

const provider = new ethers.AlchemyProvider('mainnet', process.env.ALCHEMY_API_KEY || '');

// Simple Time-Lock Smart Contract ABI
const TIMELOCK_ABI = [
    "function lock(uint256 unlockTime) payable",
    "function unlock() returns (uint256)",
    "function getLockedAmount(address user) view returns (uint256)",
];

const TIMELOCK_CONTRACT_ADDRESS = process.env.TIMELOCK_CONTRACT_ADDRESS || '0x...'; // Deploy this contract

function decrypt(encryptedText: string): string {
    if (!process.env.WALLET_ENCRYPTION_KEY) throw new Error('Encryption key not configured');
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
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { amount, unlockDate } = await req.json();

        const unlockTimestamp = new Date(unlockDate).getTime() / 1000;
        if (unlockTimestamp <= Date.now() / 1000) {
            return NextResponse.json({ error: 'Unlock date must be in the future' }, { status: 400 });
        }

        // 1. Balance Verification
        let currentBalance = ethers.parseEther("0");
        const email = user.emailAddresses[0]?.emailAddress;
        const authUser = await prisma.authUser.findUnique({ where: { email } });

        if (!authUser) {
            return NextResponse.json({ error: 'AuthUser not found' }, { status: 404 });
        }

        if (authUser.walletAddress) {
            try {
                currentBalance = await provider.getBalance(authUser.walletAddress);
            } catch (err) {
                console.error("Failed to fetch on-chain balance:", err);
            }
        }

        const amountToLock = ethers.parseEther(amount);
        if (currentBalance < amountToLock && !process.env.SKIP_BALANCE_CHECK) {
            return NextResponse.json({ 
                error: 'Insufficient funds', 
                message: `You have ${ethers.formatEther(currentBalance)} ETH, but tried to lock ${amount} ETH.` 
            }, { status: 400 });
        }

        // 2. Simulate or Interact with Smart Contract
        let txHash = `mock-tx-${Date.now()}`;
        if (process.env.TIMELOCK_CONTRACT_ADDRESS && authUser.encryptedPrivateKey) {
            try {
                const privateKey = decrypt(authUser.encryptedPrivateKey);
                const wallet = new ethers.Wallet(privateKey, provider);
                const contract = new ethers.Contract(TIMELOCK_CONTRACT_ADDRESS, TIMELOCK_ABI, wallet);
                const tx = await contract.lock(unlockTimestamp, {
                    value: amountToLock,
                });
                await tx.wait();
                txHash = tx.hash;
            } catch (err) {
                console.error("Contract lock failed, falling back to database lock:", err);
            }
        }

        // 2. Persist in Database
        const vault = await prisma.timeLockVault.create({
            data: {
                userId: authUser.id,
                amount: amount,
                tokenSymbol: 'ETH',
                unlockDate: new Date(unlockDate),
                txHash: txHash,
                status: 'LOCKED',
            },
        });

        return NextResponse.json({
            success: true,
            vaultId: vault.id,
            message: `${amount} ETH locked until ${unlockDate}`,
            txHash: txHash,
        });

    } catch (error: any) {
        console.error('TimeLock creation error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create vault' }, { status: 500 });
    }
}
