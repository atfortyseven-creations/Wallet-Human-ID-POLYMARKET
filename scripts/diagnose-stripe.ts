import Stripe from 'stripe';

async function diagnose() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    console.log('--- STRIPE DIAGNOSTIC TOOL ---');
    
    if (!secretKey) {
        console.error(' STRIPE_SECRET_KEY is MISSING.');
    } else {
        const prefix = secretKey.split('_')[0];
        console.log(` STRIPE_SECRET_KEY prefix: ${prefix}_... (Length: ${secretKey.length})`);
        
        if (prefix === 'whsec') {
            console.error(' CRITICAL ERROR: KEY SWAP DETECTED! ');
            console.error('   Your STRIPE_SECRET_KEY contains a WEBHOOK SECRET (whsec_...).');
            console.error('   DIAGNOSIS: You have put your Webhook Signing Secret into the Secret Key field in Railway.');
            console.error('   FIX: Exchange these values in your Railway Environment Variables.');
        } else if (prefix === 'sk') {
            console.log(' STRIPE_SECRET_KEY format looks correct (starts with sk_...).');
        } else {
            console.warn('️ STRIPE_SECRET_KEY prefix is unusual. Check it in Stripe Dashboard.');
        }
    }

    if (!webhookSecret) {
        console.error(' STRIPE_WEBHOOK_SECRET is MISSING.');
    } else {
        const prefix = webhookSecret.split('_')[0];
        console.log(` STRIPE_WEBHOOK_SECRET prefix: ${prefix}_... (Length: ${webhookSecret.length})`);
        
        if (prefix === 'sk') {
            console.error(' CRITICAL ERROR: YOUR STRIPE_WEBHOOK_SECRET CONTAINS A SECRET KEY (sk_...).');
            console.error('   This variable MUST contain your Webhook Signing Secret (starting with whsec_...).');
        } else if (prefix === 'whsec') {
            console.log(' STRIPE_WEBHOOK_SECRET format looks correct (starts with whsec_...).');
        } else {
            console.warn('️ STRIPE_WEBHOOK_SECRET prefix is unusual.');
        }
    }

    console.log('------------------------------');

    // Test API Call
    if (secretKey && secretKey.startsWith('sk_')) {
        try {
            const stripe = new Stripe(secretKey, { apiVersion: '2025-01-27.acacia' as any });
            const account = await stripe.account.retrieve();
            console.log(' STRIPE API CONNECTION TEST: SUCCESS');
            console.log(` Connected to account: ${account.id} (${account.email || 'No email'})`);
        } catch (e: any) {
            console.error(' STRIPE API CONNECTION TEST: FAILED');
            console.error(`   Detailed error: ${e.message}`);
        }
    }
}

diagnose();
