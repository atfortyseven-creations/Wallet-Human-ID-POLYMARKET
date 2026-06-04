import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { prisma } from '@/lib/prisma';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || 'whsec_placeholder';

export async function POST(req: Request) {
    try {
        // Get the headers
        const headerPayload = await headers();
        const svix_id = headerPayload.get("svix-id");
        const svix_timestamp = headerPayload.get("svix-timestamp");
        const svix_signature = headerPayload.get("svix-signature");

        // If there are no headers, error out
        if (!svix_id || !svix_timestamp || !svix_signature) {
            return new Response('Error occured -- no svix headers', {
                status: 400
            });
        }

        // Get the body
        const payload = await req.json();
        const body = JSON.stringify(payload);

        // Create a new Svix instance with your secret.
        const wh = new Webhook(webhookSecret);

        let evt: any;

        // Verify the payload with the headers
        try {
            evt = wh.verify(body, {
                "svix-id": svix_id,
                "svix-timestamp": svix_timestamp,
                "svix-signature": svix_signature,
            });
        } catch (err) {
            console.error('Error verifying webhook:', err);
            return new Response('Error occured', {
                status: 400
            });
        }

        // Handle the webhook
        const eventType = evt.type;
        
        if (eventType === 'user.created') {
            const { id, primary_email_address_id, email_addresses } = evt.data;
            
            // Get the user's email
            const emailObj = email_addresses?.find((e: any) => e.id === primary_email_address_id);
            const email = emailObj?.email_address;

            console.log(`New user created: ${id}, Email: ${email}`);

            // Note: We can't access localStorage from the server
            // The client will need to send the referral code in the metadata
            // Or we implement a different flow using cookies/session

            // For now, we'll create a placeholder that can be updated
            // when the user connects their wallet and provides the referral code

            return NextResponse.json({ 
                success: true, 
                message: 'User created webhook received',
                userId: id 
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

