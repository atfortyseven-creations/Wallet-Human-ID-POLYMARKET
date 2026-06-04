import { NextResponse } from 'next/server';
import { UNIVERSAL_TOKENS } from '@/config/universal-tokens';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol')?.toUpperCase();
    // Use the raw address to try and match Trustwallet's expected casing if possible, 
    // though Ethereum addresses are case-insensitive, Trustwallet assets are checksum-cased.
    const address = searchParams.get('address');
    
    // 1. Check UNIVERSAL_TOKENS local catalog first (Maximum strictness)
    if (symbol) {
        const localToken = UNIVERSAL_TOKENS.find(t => t.symbol.toUpperCase() === symbol);
        if (localToken && localToken.logoPath) {
            return NextResponse.redirect(new URL(localToken.logoPath, req.url).toString(), 302);
        }
    }

    if (address && address !== 'native') {
        const localToken = UNIVERSAL_TOKENS.find(t => t.address.toLowerCase() === address.toLowerCase());
        if (localToken && localToken.logoPath) {
            return NextResponse.redirect(new URL(localToken.logoPath, req.url).toString(), 302);
        }
    }

    if (address === 'native') {
        const nativeEth = UNIVERSAL_TOKENS.find(t => t.symbol === 'ETH');
        if (nativeEth && nativeEth.logoPath) {
            return NextResponse.redirect(new URL(nativeEth.logoPath, req.url).toString(), 302);
        }
    }

    // 2. Fallback to extensive lists (Trustwallet / 1inch / etc)
    if (address && address.startsWith('0x') && address.length === 42) {
        // Attempt to redirect to trustwallet. If it fails (404), the client <img onError> will handle it.
        const trustWalletUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`;
        return NextResponse.redirect(trustWalletUrl, 302);
    }

    // 3. Absolute Fallback: Dynamic SVG generation directly from the server
    const fallbackSymbol = symbol ? symbol.slice(0, 3) : '?';
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
            <rect width="200" height="200" fill="#050505"/>
            <text x="50%" y="55%" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="64" fill="#ffffff" text-anchor="middle" dominant-baseline="middle" letter-spacing="2">
                ${fallbackSymbol}
            </text>
        </svg>
    `;

    return new NextResponse(svg.trim(), {
        status: 200,
        headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=31536000'
        }
    });
}
