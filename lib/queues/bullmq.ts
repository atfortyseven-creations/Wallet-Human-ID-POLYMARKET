import { Queue, Worker, QueueEvents } from 'bullmq';
import { redisClient } from '../redis/client';
import { prisma } from '../prisma';

export const stripeQueue = new Queue('stripe-webhook', {
  connection: redisClient as any,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: true,
    removeOnFail: false, // Send to Dead Letter Queue (failed jobs stay in queue)
  },
});

export const stripeQueueEvents = new QueueEvents('stripe-webhook', {
  connection: redisClient as any,
});

// Note: In Next.js, workers should ideally be run in a separate process.
// For the scope of this implementation, we initialize the worker here.
const stripeWorker = new Worker('stripe-webhook', async (job) => {
  const event = job.data;
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // 100000% Payment Verification Rule
    if (session.payment_status !== 'paid') {
      console.warn(`[WAC] Webhook checkout complete but payment_status is ${session.payment_status}. Skipping upgrade until payment is processed.`);
      return { processed: true, status: session.payment_status };
    }

    // Check if it's a subscription mode checkout
    if (session.mode === 'subscription') {
      const walletAddress = session.metadata?.userId || session.metadata?.system_user_id || session.subscription_data?.metadata?.system_user_id;
      const planId = session.metadata?.tier || session.metadata?.plan_id;
      const customerId = session.customer;
      const subscriptionId = session.subscription;

      if (!walletAddress || !planId) {
        throw new Error('Missing system metadata in checkout session');
      }

      // Update Prisma
      await prisma.user.update({
        where: { walletAddress },
        data: {
          tier: planId.toUpperCase(),
          stripeCustomerId: customerId as string,
          stripeSubscriptionId: subscriptionId as string,
        } as any,
      });

      // Update Redis cache & emit mesh bus event
      await redisClient.setex(`tier:${walletAddress}`, 600, planId.toUpperCase());
      await redisClient.publish('system_mesh_auth_bus', JSON.stringify({
        event: 'LICENSE_UPGRADED',
        wallet: walletAddress,
        tier: planId.toUpperCase()
      }));

      // Invalidate human_session in Redis so middleware forces re-hydration
      await redisClient.del(`human_session:${walletAddress}`);
      
      console.log(`[WAC] Successfully upgraded wallet ${walletAddress} to tier ${planId.toUpperCase()}`);
    }
  } else if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    const customerId = subscription.customer as string;
    
    // Find user by customerId
    const dbUser = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId }
    });

    if (dbUser) {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          tier: 'FREE',
          stripeSubscriptionId: null,
        } as any,
      });
      
      await redisClient.setex(`tier:${dbUser.walletAddress}`, 600, 'FREE');
      await redisClient.del(`human_session:${dbUser.walletAddress}`);
      await redisClient.publish('system_mesh_auth_bus', JSON.stringify({
        event: 'LICENSE_REVOKED',
        wallet: dbUser.walletAddress,
        tier: 'FREE'
      }));
      console.log(`[WAC] Successfully downgraded customer ${customerId} to FREE`);
    }
  }
  
  // Return early if event is handled or not relevant
  return { processed: true, type: event.type };
}, { connection: redisClient as any });

stripeWorker.on('failed', (job, err) => {
  console.error(`[BullMQ] Stripe Webhook Job ${job?.id} failed with error: ${err.message}`);
});
