import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { ethers } from 'ethers';
import crypto from 'crypto';
import { getChainById, getExplorerTxUrl } from '@/lib/wallet/chains';

// Consistent Encryption/Decryption Key Management
const DEV_FALLBACK_KEY = '0000000000000000000000000000000000000000000000000000000000000000';

const getEncryptionKey = () => {
  const key = process.env.WALLET_ENCRYPTION_KEY;
  if (!key) {
      if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
          console.warn('WARNING: WALLET_ENCRYPTION_KEY missing in production');
      }
      return DEV_FALLBACK_KEY;
  }
  return key;
};

function decrypt(encryptedText: string): string {
    const encryptionKey = getEncryptionKey();
    const [ivHex, encryptedHex, authTagHex] = encryptedText.split(':');
    
    const key = crypto.createHash('sha256').update(String(encryptionKey)).digest();
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

        const { to, amount, token, chainId = 1 } = await req.json();

        // Validate Chain
        const chainConfig = getChainById(Number(chainId));
        if (!chainConfig) {
            return NextResponse.json({ error: 'Unsupported Chain' }, { status: 400 });
        }

        // Initialize Provider for specific chain
        const provider = new ethers.JsonRpcProvider(chainConfig.rpcUrls[0]);

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

        // Check Native Balance
        const balance = await provider.getBalance(wallet.address);
        const valueInWei = ethers.parseEther(amount);
        
        // Build transaction
        const tx: any = {
            to: to,
            value: valueInWei,
            chainId: Number(chainId)
        };

        // Advanced Gas Estimation (EIP-1559 support where available)
        try {
            const feeData = await provider.getFeeData();
            
            if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
                // EIP-1559 Transaction
                tx.maxFeePerGas = feeData.maxFeePerGas;
                tx.maxPriorityFeePerGas = (feeData.maxPriorityFeePerGas * BigInt(12)) / BigInt(10); // 20% priority boost
                tx.type = 2;
            } else if (feeData.gasPrice) {
                // Legacy Transaction
                tx.gasPrice = feeData.gasPrice;
            }

            const gasEstimate = await provider.estimateGas(tx);
            tx.gasLimit = (gasEstimate * BigInt(12)) / BigInt(10); // 20% buffer
        } catch (e) {
            console.warn('Gas estimation failed, using safe fallbacks', e);
            tx.gasLimit = 21000n;
        }

        // Verify total cost (value + gas)
        const totalCost = tx.value + (tx.gasLimit * (tx.maxFeePerGas || tx.gasPrice || 0n));
        if (balance < totalCost) {
            return NextResponse.json({ error: `Insufficient funds. Balance: ${ethers.formatEther(balance)}, Required: ${ethers.formatEther(totalCost)}` }, { status: 400 });
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
                status: 'CONFIRMED', // Set to confirmed if broadcast succeeded, or PENDING if you want to track status
                type: 'SEND',
                chainId: Number(chainId),
                tokenSymbol: token || chainConfig.nativeCurrency.symbol
            },
        });

        return NextResponse.json({
            success: true,
            txHash: signedTx.hash,
            explorerUrl: getExplorerTxUrl(Number(chainId), signedTx.hash),
        });

    } catch (error: any) {
        console.error('Send transaction error:', error);
        return NextResponse.json(
            { error: error.message || 'Transaction failed' },
            { status: 500 }
        );
    }
}
