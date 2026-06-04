/**
 * FASE 7  ALERTAS TELEGRAM REALES
 * El usuario guarda su Chat ID y el servidor envía mensajes reales
 * usando el TELEGRAM_BOT_TOKEN ya configurado en Railway.
 * 
 * Flujo:
 *   1. Usuario abre @userinfobot en Telegram  obtiene su Chat ID
 *   2. Lo pega en el panel y pulsa "ACTIVAR"
 *   3. El servidor guarda el Chat ID en Prisma (tabla TelegramAlert)
 *   4. Cada vez que una señal EV == 'OVERSOLD' o APY supera el umbral,
 *      el cron llama a Telegram sendMessage con los datos reales.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

//  Rate Limiting 
// Prevents DDoS/bot nets from abusing the Telegram API and getting the
// corporate bot permanently banned by Telegram for flood violations.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX       = 3;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
    const now   = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
        return true;
    }
    if (entry.count >= RATE_LIMIT_MAX) return false;
    entry.count++;
    return true;
}
export async function GET(req: NextRequest) {
    const wallet = req.nextUrl.searchParams.get('wallet');
    if (!wallet) return NextResponse.json({ configured: false });

    try {
        const record = await (prisma as any).telegramAlert.findUnique({
            where: { walletAddress: wallet.toLowerCase() }
        });
        return NextResponse.json({
            configured: !!record,
            chatId: record?.chatId ? `${String(record.chatId).slice(0, 3)}***` : null,
            minApy: record?.minApy ?? 20,
            evSignals: record?.evSignals ?? true,
        });
    } catch (_) {
        return NextResponse.json({ configured: false });
    }
}

// 
// POST /api/telegram/connect
// Body: { wallet, chatId, minApy, evSignals }
// 
export async function POST(req: NextRequest) {
    try {
        //  Rate Limit check 
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { error: 'Too many requests. Please wait 60 seconds before retrying.' },
                { status: 429, headers: { 'Retry-After': '60' } }
            );
        }

        const body = await req.json();
        const { wallet, chatId, minApy = 20, evSignals = true } = body;

        if (!wallet || !chatId) {
            return NextResponse.json({ error: 'wallet y chatId son requeridos' }, { status: 400 });
        }

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
            return NextResponse.json({ error: 'Bot no configurado en el servidor' }, { status: 503 });
        }

        // Verify the chat ID is real by sending a test message
        const testRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                parse_mode: 'HTML',
                text: [
                    ' <b>Private INTELLIGENCE TERMINAL</b>',
                    '',
                    ' Alertas activadas correctamente.',
                    '',
                    ` <b>Configuración:</b>`,
                    ` APY mínimo para alertas: <code>${minApy}%</code>`,
                    ` Señales EV Polymarket: ${evSignals ? 'ACTIVADAS' : 'DESACTIVADAS'}`,
                    '',
                    ' Recibirás notificaciones cuando aparezcan oportunidades reales de mercado.',
                ].join('\n'),
            })
        });

        const testData = await testRes.json();
        if (!testData.ok) {
            return NextResponse.json({ error: `Chat ID inválido: ${testData.description}` }, { status: 400 });
        }

        // Upsert the record in Prisma
        await (prisma as any).telegramAlert.upsert({
            where:  { walletAddress: wallet.toLowerCase() },
            create: { walletAddress: wallet.toLowerCase(), chatId: String(chatId), minApy, evSignals },
            update: { chatId: String(chatId), minApy, evSignals, updatedAt: new Date() },
        });

        return NextResponse.json({ ok: true, message: 'Alertas de Telegram configuradas correctamente.' });

    } catch (err: any) {
        console.error('[TELEGRAM_CONNECT]', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// 
// DELETE /api/telegram/connect
// Body: { wallet }
// Removes alert configuration
// 
export async function DELETE(req: NextRequest) {
    try {
        const { wallet } = await req.json();
        if (!wallet) return NextResponse.json({ error: 'wallet requerido' }, { status: 400 });

        await (prisma as any).telegramAlert.deleteMany({
            where: { walletAddress: wallet.toLowerCase() }
        });

        return NextResponse.json({ ok: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// 
// Exported helper: send a real Telegram message
// Used by cron jobs and signal processors
// 
async function sendTelegramAlert(chatId: string, message: string): Promise<boolean> {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) return false;

    try {
        const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, parse_mode: 'HTML', text: message, disable_web_page_preview: true }),
        });
        const data = await res.json();
        return data.ok;
    } catch (_) {
        return false;
    }
}
