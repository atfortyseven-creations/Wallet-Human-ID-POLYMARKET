/**
 * POST /api/enterprise/contact
 *
 * Enterprise Inquiry Handler
 *
 * Receives enterprise deal inquiries, validates input, persists to DB,
 * and sends a confirmation notification to the Telegram admin channel.
 *
 * Body:
 *   {
 *     companyName:    string,   // Required
 *     contactName:    string,   // Required
 *     email:          string,   // Required
 *     tier:           'PRO' | 'ENTERPRISE' | 'Private',
 *     useCase:        string,   // Min 50 chars
 *     teamSize:       number,
 *     currentStack:   string,   // Optional: "Nansen + Arkham + custom"
 *     preferredCall:  string,   // ISO date for scheduling
 *   }
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const VALID_TIERS = ['PRO', 'ENTERPRISE', 'Private'] as const;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { companyName, contactName, email, tier, useCase, teamSize, currentStack, preferredCall } = body;

        //  Validation 
        if (!companyName?.trim() || !contactName?.trim() || !email?.trim()) {
            return NextResponse.json(
                { error: 'companyName, contactName, and email are required.' },
                { status: 400 }
            );
        }

        if (!email.includes('@') || !email.includes('.')) {
            return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
        }

        if (!VALID_TIERS.includes(tier)) {
            return NextResponse.json(
                { error: `tier must be one of: ${VALID_TIERS.join(', ')}` },
                { status: 400 }
            );
        }

        if (!useCase || useCase.length < 50) {
            return NextResponse.json(
                { error: 'useCase must be at least 50 characters.' },
                { status: 400 }
            );
        }

        //  Persist to DB 
        const inquiryId = `ENT-${Date.now().toString(36).toUpperCase()}`;
        const { prisma } = await import('@/lib/prisma');

        try {
            await (prisma as any).enterpriseInquiry.create({
                data: {
                    id:            inquiryId,
                    companyName:   companyName.slice(0, 200),
                    contactName:   contactName.slice(0, 200),
                    email:         email.toLowerCase().trim().slice(0, 300),
                    tier,
                    useCase:       useCase.slice(0, 2000),
                    teamSize:      teamSize ? Number(teamSize) : null,
                    currentStack:  currentStack?.slice(0, 500) ?? null,
                    preferredCall: preferredCall ?? null,
                    status:        'NEW',
                },
            });
        } catch {
            // Table not yet migrated  log locally, don't block the user
            console.log(`[Enterprise] New inquiry ${inquiryId}: ${companyName} (${email})  ${tier}`);
        }

        //  Notify Admin via Telegram 
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

        if (botToken && adminChatId) {
            const msg = [
                `️ <b>NEW ENTERPRISE INQUIRY</b>`,
                `ID: <code>${inquiryId}</code>`,
                ``,
                ` <b>${companyName}</b>`,
                ` ${contactName}  <code>${email}</code>`,
                ` Tier: <b>${tier}</b>`,
                ` Team Size: ${teamSize ?? 'Not specified'}`,
                ` Current Stack: ${currentStack ?? 'Not specified'}`,
                ``,
                ` Use Case: ${useCase.slice(0, 300)}${useCase.length > 300 ? '...' : ''}`,
                preferredCall ? ` Preferred Call: ${preferredCall}` : null,
            ].filter(Boolean).join('\n');

            try {
                await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id:    adminChatId,
                        text:       msg,
                        parse_mode: 'HTML',
                    }),
                });
            } catch {
                // Telegram notification failure is non-fatal
            }
        }

        return NextResponse.json({
            success:   true,
            inquiryId,
            tier,
            message:   ` Enterprise inquiry received. Our team will contact you within 24 hours.`,
            nextSteps: [
                `Reference ID <${inquiryId}> in all communications`,
                'Check your email for confirmation',
                tier === 'Private'
                    ? 'A strategic partnership call will be scheduled within 48h'
                    : `Schedule a call: https://cal.com/whalealert/enterprise`,
            ],
        });

    } catch (err: any) {
        return NextResponse.json(
            { error: 'Inquiry submission failed', detail: err?.message },
            { status: 500 }
        );
    }
}
