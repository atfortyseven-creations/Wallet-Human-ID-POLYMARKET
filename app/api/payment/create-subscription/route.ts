import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ 
    error: 'DEPRECATED: This API route has been replaced by Institutional Server Actions.',
    migration: 'Please use app/actions/stripe.ts -> createCheckoutSession()'
  }, { status: 410 });
}
