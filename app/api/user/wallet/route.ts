import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { ethers } from 'ethers';
import crypto from 'crypto';
import { getPortfolio } from '@/lib/wallet/portfolio';

// Server-Side Master Key for Encryption
// [CRITICAL SECURITY] In production, this MUST be a 32-byte hex string in .env
// For development stability, we use a fixed fallback to prevent data loss on restarts.
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

const IV_LENGTH = 16;

function encrypt(text: string) {
  const encryptionKey = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = Buffer.from(encryptionKey, 'hex');
  const cipherKey = crypto.createHash('sha256').update(String(encryptionKey)).digest();
  
  const cipher = crypto.createCipheriv('aes-256-gcm', cipherKey, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex') + ':' + cipher.getAuthTag().toString('hex');
}

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedAddress = searchParams.get('address');

    // If a specific address is requested, we fetch its public portfolio data
    if (requestedAddress && ethers.isAddress(requestedAddress)) {
        try {
            const portfolio = await getPortfolio(requestedAddress);
            return NextResponse.json({
                address: requestedAddress,
                balance: portfolio.totalValueUSD.toFixed(2),
                assets: portfolio.assets || [],
                perps: portfolio.perps || [],
                predictions: portfolio.predictions || [],
                claimables: portfolio.claimables || [],
                change24hUSD: portfolio.change24hUSD || 0,
                change24hPercent: portfolio.change24hPercent || 0,
                status: "Public",
                isReadOnly: true,
                securityLevel: "WATCH_ONLY"
            });
        } catch (e) {
            console.error(`Failed to fetch portfolio for requested address ${requestedAddress}:`, e);
            return NextResponse.json({ error: 'Failed to fetch public portfolio data' }, { status: 500 });
        }
    }

    // Otherwise, continue with the standard logic for the AUTHENTICATED user's MANAGED wallet
    const email = user.emailAddresses[0]?.emailAddress;
    
    if (!email) {
       return NextResponse.json({ error: 'No email found' }, { status: 400 });
    }

    let authUser = await prisma.authUser.findUnique({
      where: { email },
    });

    if (!authUser) {
      authUser = await prisma.authUser.create({
        data: {
          email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || email.split('@')[0],
          passwordHash: "clerk_managed",
          verified: true,
        }
      });
    }

    // [FIX] Ensure the base 'User' record exists for this wallet address
    // This allows the user to add 'WatchedWallet' since it has a foreign key to 'User'
    if (authUser.walletAddress) {
      await prisma.user.upsert({
        where: { walletAddress: authUser.walletAddress },
        update: {
          email: authUser.email,
          name: authUser.name,
        },
        create: {
          walletAddress: authUser.walletAddress,
          email: authUser.email,
          name: authUser.name,
          tier: 'HUMAN',
        },
      });
    }

    let walletAddress = authUser.walletAddress;

    // [CLEANUP] If the database contains a legacy "Virtual" dummy address, 
    // we disregard it and trigger the generation of a real one below.
    if (walletAddress && (walletAddress.includes('Virtual') || walletAddress.includes('Human'))) {
      console.log(`Regenerating real wallet for ${email} (discarding legacy virtual handle)...`);
      walletAddress = null;
    }

    if (!walletAddress) {
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
        prisma.user.upsert({
          where: { walletAddress },
          update: {
            email: authUser.email,
            name: authUser.name,
          },
          create: {
            walletAddress,
            email: authUser.email,
            name: authUser.name,
            tier: 'HUMAN',
          },
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

    // [PRODUCTION UPGRADE] Fetch real balance from blockchain
    let portfolio;
    let balance = "0.00";
    
    try {
      portfolio = await getPortfolio(walletAddress);
      balance = portfolio.totalValueUSD.toFixed(2);
    } catch (e) {
      console.warn(`Failed to fetch portfolio for ${walletAddress}, falling back to 0`, e);
    }

    // [MULTI-ACCOUNT] Fetch all accounts for this user to return a complete list
    const accounts = await prisma.walletAccount.findMany({
      where: { userId: authUser.id },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({
      address: walletAddress,
      balance: balance,
      assets: portfolio?.assets || [],
      perps: portfolio?.perps || [],
      predictions: portfolio?.predictions || [],
      claimables: portfolio?.claimables || [],
      change24hUSD: portfolio?.change24hUSD || 0,
      change24hPercent: portfolio?.change24hPercent || 0,
      status: "Active",
      isLedger: true,
      securityLevel: "MAXIMUM",
      accounts: accounts.map(acc => ({
        address: acc.address,
        name: acc.name,
        type: acc.type,
        index: acc.index
      }))
    });

  } catch (error) {
    console.error("Wallet Fetch Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) return NextResponse.json({ error: 'No email found' }, { status: 400 });

    const body = await request.json();
    const { address, name, type, index } = body;

    if (!address || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const authUser = await prisma.authUser.findUnique({
      where: { email },
    });

    if (!authUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // [PERSISTENCE] Save the new wallet account to the database using compound unique constraint
    const newAccount = await prisma.walletAccount.upsert({
      where: { 
        userId_address: {
          userId: authUser.id,
          address: address
        }
      },
      update: {
        name,
        type: type || 'DERIVED',
        index: index || 0,
      },
      create: {
        userId: authUser.id,
        address,
        name,
        type: type || 'DERIVED',
        index: index || 0,
      },
    });

    return NextResponse.json(newAccount);
  } catch (error) {
    console.error("Wallet Add Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
