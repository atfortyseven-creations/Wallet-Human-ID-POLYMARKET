import { NextResponse } from 'next/server';

export async function GET() {
  // Generate a realistic base number between 1200 and 3500 that fluctuates slightly based on time of day
  const hour = new Date().getUTCHours();
  const baseCount = 2000 + Math.sin(hour * Math.PI / 12) * 800; // peaks at 2800, troughs at 1200
  const jitter = Math.floor(Math.random() * 50) - 25; // +/- 25
  const count = Math.floor(baseCount + jitter);
  
  return NextResponse.json({ online: true, count, ts: Date.now() });
}
