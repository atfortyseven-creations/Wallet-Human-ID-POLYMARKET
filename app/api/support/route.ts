import { NextRequest, NextResponse } from 'next/server';
import { sendSupportEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // Correctly destructure all fields sent by the support form
        const { name, email, category, message, section } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Map `category` (from form)  `section` (legacy field), fallback to either
        const resolvedSection = section || category || 'general';

        // Forward all fields including name so admin sees full context
        await sendSupportEmail(message, resolvedSection, email, name);

        return NextResponse.json({ success: true, message: 'Message forwarded successfully' });

    } catch (error: any) {
        console.error('[API] Support route error:', error);
        // If Resend fails, log the full error structure to Railway console
        if (error?.name === 'ResendError' || error?.statusCode) {
            console.error('[API] Resend API Failure Details:', JSON.stringify(error, null, 2));
        }
        return NextResponse.json(
            { error: `API Resend Rechazó el correo: ${error?.message || 'Verifica tu API KEY o dominio en Resend.'}` },
            { status: 500 }
        );
    }
}

