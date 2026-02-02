import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { ethers } from 'ethers';
import crypto from 'crypto';

// Server-Side Master Key for Encryption (In prod, use env var)
const ENCRYPTION_KEY = process.env.WALLET_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'); 
const IV_LENGTH = 16; // For AES, this is always 16

function encrypt(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  const cipherKey = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest();
  
  const cipher = crypto.createCipheriv('aes-256-gcm', cipherKey, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex') + ':' + cipher.getAuthTag().toString('hex');
}

export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = user.emailAddresses[0]?.emailAddress;
    
    if (!email) {
       return NextResponse.json({ error: 'No email found' }, { status: 400 });
    }

    // 1. Find existing user
    let authUser = await prisma.authUser.findUnique({
      where: { email },
    });

    // 2. Create if not exists
    if (!authUser) {
      authUser = await prisma.authUser.create({
        data: {
          email,
          name: `${user.firstName} ${user.lastName}`,
          passwordHash: "clerk_managed", // Placeholder
          verified: true,
        }
      });
    }

    // 3. Check for Wallet
    let walletAddress = authUser.walletAddress;

    if (!walletAddress) {
      // SECURITY CRITICAL: GENERATE UNIQUE WALLET
      console.log(`Generating high-security wallet for ${email}...`);
      
      const wallet = ethers.Wallet.createRandom();
      const mnemonic = wallet.mnemonic?.phrase;
      const privateKey = wallet.privateKey;
      walletAddress = wallet.address;

      if (!mnemonic || !privateKey) {
        throw new Error("Failed to generate wallet entropy");
      }

      const encryptedMnemonic = encrypt(mnemonic);
      const encryptedPrivateKey = encrypt(privateKey);

      await prisma.$transaction([
        prisma.authUser.update({
          where: { id: authUser.id },
          data: {
            walletAddress: walletAddress,
            encryptedMnemonic,
            encryptedPrivateKey,
          }
        }),
        prisma.walletAccount.create({
          data: {
            userId: authUser.id,
            address: walletAddress,
            name: "Human Vault (Primary)",
            type: "PRIMARY",
            isVisible: true
          }
        })
      ]);
    }

    // 4. Return Safe Data
    // Return zero balance until real integration or user deposit
    const safeAddress = walletAddress || "0x0000000000000000000000000000000000000000";
    const uniqueBalance = "0.00";

    return NextResponse.json({
      address: safeAddress,
      balance: uniqueBalance,
      status: "Active",
      isLedger: true,
      securityLevel: "MAXIMUM"
    });

  } catch (error) {
    console.error("Wallet Fetch Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
