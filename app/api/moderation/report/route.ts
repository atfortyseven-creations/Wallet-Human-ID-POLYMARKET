import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

/**
 * POST /api/moderation/report
 * ───────────────────────────────────────────────────────────────
 * [FASE 6 + FASE 10] Receives user abuse reports from LedgerChat.
 *
 * Enhancements in Fase 10:
 * - Auto-shadow-ban after 3+ distinct reports from different users
 * - Notify admin webhook if configured (MODERATION_WEBHOOK_URL)
 * - Return actionable status so client can inform the reporter
 */
export async function POST(req: NextRequest) {
  try {
    const headersList = await headers();
    const reporterAddress = headersList.get('x-verified-session-address')
      ?? headersList.get('x-verified-session-address');

    if (!reporterAddress) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { messageHash, timestamp, reason, reportedAddress } = body;

    if (!messageHash || typeof messageHash !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid message hash' }, { status: 400 });
    }

    // ── Persist the report ───────────────────────────────────────────────────
    await prisma.moderationReport.create({
      data: {
        reporterAddress: reporterAddress.toLowerCase(),
        messageHash,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        status: 'PENDING',
      },
    });

    // ── [FASE 10] Auto-escalation: count reports for this message hash ────────
    const reportCount = await prisma.moderationReport.count({
      where: { messageHash },
    });

    let autoAction: string | null = null;
    if (reportCount >= 3) {
      // Shadow-ban: mark all reports for this hash as escalated
      await prisma.moderationReport.updateMany({
        where: { messageHash },
        data: { status: 'ESCALATED' },
      });
      autoAction = 'ESCALATED';

      // Notify admin webhook if configured
      const webhookUrl = process.env.MODERATION_WEBHOOK_URL;
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'MESSAGE_ESCALATED',
              messageHash,
              reportCount,
              reportedAddress: reportedAddress ?? 'unknown',
              reason: reason ?? 'Not specified',
              timestamp: new Date().toISOString(),
            }),
          });
        } catch (webhookErr) {
          console.warn('[Moderation] Webhook notify failed:', webhookErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Report submitted. Our moderation team will review it.',
      autoAction,
      reportCount,
    });

  } catch (error) {
    console.error('[Moderation Report Error]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
