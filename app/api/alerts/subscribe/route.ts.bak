import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { email, walletAddress } = await req.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        console.log(`[SubscriptionAPI] Registering VIP alerts for: ${email}`);

        // Update user if walletAddress provided, or just log if guest
        if (walletAddress) {
            await prisma.user.update({
                where: { walletAddress },
                data: { email }
            });
        }

        // Persist email in EmailSubscriber for Cron Jobs
        await prisma.emailSubscriber.upsert({
            where: { email },
            update: {
                subscribed: true,
                frequency: 'hourly',
                topics: {
                    push: 'supply-dilution'
                }
            },
            create: {
                email,
                subscribed: true,
                frequency: 'hourly',
                topics: ['supply-dilution']
            }
        });

        // Potential integration with a newsletter service like Mailchimp/ConvertKit could go here

        return NextResponse.json({ 
            success: true, 
            message: 'VIP Subscription confirmed. You will receive alerts before each drop.' 
        });
    } catch (err) {
        console.error('[SubscriptionAPI] Error:', err);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

