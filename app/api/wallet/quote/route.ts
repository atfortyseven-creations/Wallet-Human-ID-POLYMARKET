import { NextRequest, NextResponse } from 'next/server';
import { lifiService } from '@/lib/wallet/lifi-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const quote = await lifiService.getQuote(body);
    return NextResponse.json(quote);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

