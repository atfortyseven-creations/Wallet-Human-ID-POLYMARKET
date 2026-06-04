import { NextResponse } from 'next/server';
import { SystemTelemetry } from '@/lib/telemetry/beta-metrics';
import { verifySignedPayload } from '@/lib/crypto/eip191-verify';
import prisma from '@/lib/prisma'; // Using the global instance for DB queries

/**
 * TELEMETRY & NPS SURVEY API
 * 
 * /api/telemetry
 * POST: Accepts client-side latency metrics (e.g., wallet connection time) OR signed NPS surveys.
 * Protected by strict origin checks and signature validation for surveys.
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Route 1: NPS Survey Submission (Requires EIP-191 Signature)
    if (body.type === 'NPS_SURVEY') {
      const { score, feedback, signature, walletAddress, nonce, timestamp } = body;

      if (!score || score < 0 || score > 10 || !signature || !walletAddress || !nonce || !timestamp) {
        return NextResponse.json({ error: 'Missing required survey fields, including signature timestamp' }, { status: 400 });
      }

      // 1. Verify that this wallet is part of the Beta Program (has a Golden Ticket)
      const isBetaTester = await prisma.goldenTicket.findUnique({
        where: { userAddress: walletAddress.toLowerCase() }
      });

      if (!isBetaTester) {
        return NextResponse.json({ error: 'Wallet is not registered in the Beta Program' }, { status: 403 });
      }

      // 2. Cryptographically verify the survey submission
      // The message must precisely match what the user signed on the frontend
      const expectedMessage = `System Network Beta NPS\nScore: ${score}\nFeedback: ${feedback || 'None'}\nNonce: ${nonce}`;
      
      const verification = verifySignedPayload({
        message: expectedMessage,
        signature,
        address: walletAddress,
        timestamp,
        nonce
      });
      
      if (!verification.valid) {
        return NextResponse.json({ error: `Invalid EIP-191 signature: ${verification.error}` }, { status: 401 });
      }

      // 3. Store the survey (Upsert to prevent multiple submissions)
      await prisma.nPSSurvey.upsert({
        where: { walletAddress: walletAddress.toLowerCase() },
        update: {
          score,
          feedback,
          signature,
          timestamp: new Date()
        },
        create: {
          walletAddress: walletAddress.toLowerCase(),
          score,
          feedback,
          signature,
        }
      });

      return NextResponse.json({ success: true, message: 'Survey recorded securely' });
    }

    // Route 2: Anonymous Client-Side Telemetry (e.g., Handshake Latency)
    // Client strictly sends the numeric value. IP addresses are dropped at the edge.
    if (body.type === 'HANDSHAKE_LATENCY') {
      const { latencyMs } = body;
      
      if (typeof latencyMs !== 'number' || latencyMs < 0 || latencyMs > 30000) {
        return NextResponse.json({ error: 'Invalid metric payload' }, { status: 400 });
      }

      // Feed into the memory aggregator (which automatically calculates P95 and flushes)
      SystemTelemetry.recordMetric('HANDSHAKE_LATENCY', latencyMs);
      
      return NextResponse.json({ success: true, status: 'Aggregated' });
    }

    return NextResponse.json({ error: 'Invalid telemetry type' }, { status: 400 });

  } catch (error) {
    console.error('[Telemetry Route Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
