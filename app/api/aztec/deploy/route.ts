import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: false,
    message: 'Deployer route is currently disabled pending Aztec SDK update.'
  });
}
