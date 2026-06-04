import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'mock');
const secret = process.env.STRIPE_WEBHOOK_SECRET;

if (!secret) {
    console.error("No STRIPE_WEBHOOK_SECRET in .env");
    process.exit(1);
}

const payload = JSON.stringify({
  id: 'evt_test_webhook',
  type: 'checkout.session.completed',
  data: {
    object: {
      mode: 'subscription',
      subscription: 'sub_test_' + Date.now(),
      customer: 'cus_test_' + Date.now(),
      amount_total: 29900,
      metadata: {
        userId: '0xTestWalletAddress123456789',
        clerk_user_id: 'user_test123',
        plan_id: 'pro',
        tier: 'PRO'
      }
    }
  }
});

const signature = stripe.webhooks.generateTestHeaderString({
  payload,
  secret,
});

async function testWebhook(url) {
    console.log(`Sending mock webhook to ${url}...`);
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'stripe-signature': signature,
                'content-type': 'application/json'
            },
            body: payload
        });
        const text = await res.text();
        console.log(`Response from ${url}: Status ${res.status} - ${text}`);
    } catch (e) {
        console.error(`Error sending to ${url}:`, e);
    }
}

async function run() {
    await testWebhook('http://localhost:3000/api/payment/webhook');
    await testWebhook('http://localhost:3000/api/payments/webhook');
}

run();
