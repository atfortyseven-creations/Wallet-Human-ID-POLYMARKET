import { NextRequest, NextResponse } from 'next/server';
import { stripe, PRICE_IDS } from '@/lib/payments/stripe';
import { prisma } from '@/lib/prisma';
import { validateSecureRequest } from '@/lib/security/premium-security';
import { NODE_TIERS, PlanTier } from '@/lib/node_infrastructure/tiers';

/**
 * Elite Checkout Tunnel
 * Generates a secure Stripe Checkout Session with tier metadata.
 * SIWE-native: userId is always a wallet address (no Clerk dependency).
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const tier = (body.tier as string)?.toUpperCase() as PlanTier;
        const isAnnual = body.isAnnual === true;
        const billingCycle = isAnnual ? 'ANNUAL' : 'MONTHLY';

        // ── Auth: Accept either a valid JWT session OR a wallet address body param ──
        // Priority 1: Secure JWT session (full SIWE sign-in flow)
        const validation = await validateSecureRequest(req);
        let userId = validation.userId;

        // Priority 2: Wallet address sent directly (Web3-native users without full email session)
        // Validate it's a real EVM address format to prevent injection.
        if (!userId) {
            const bodyAddress = body.userId || body.walletAddress;
            if (bodyAddress && /^0x[a-fA-F0-9]{40}$/.test(bodyAddress)) {
                userId = (bodyAddress as string).toLowerCase();
            }
        }

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized: Connect your wallet to purchase a plan.' }, { status: 401 });
        }

        if (!tier) {
            return NextResponse.json({ error: 'Invalid plan tier' }, { status: 400 });
        }
        if (!PRICE_IDS[billingCycle]?.[tier]) {
            return NextResponse.json({ error: 'Stripe price not configured for this plan. Contact support.' }, { status: 503 });
        }

        const planConfig = NODE_TIERS[tier];
        if (!planConfig) {
            return NextResponse.json({ error: 'Plan configuration not found' }, { status: 400 });
        }

        const normalizedUserId = userId.toLowerCase();

        // [VIP BYPASS] Special Owner Exception — permanent, unlimited access
        if (normalizedUserId === '0x78831c25c86ea2a78a6127fc2ccb95e612d87b4a') {
            const PERMANENT_DATE = new Date('2099-12-31T23:59:59Z');
            await prisma.user.upsert({
                where: { walletAddress: normalizedUserId },
                update: { tier: 'ARCHIVE_PROVER' },
                create: { walletAddress: normalizedUserId, tier: 'ARCHIVE_PROVER' }
            });
            await prisma.subscription.upsert({
                where: { userId: normalizedUserId },
                update: { tier: 'ARCHIVE_PROVER', status: 'ACTIVE', expiresAt: PERMANENT_DATE },
                create: { userId: normalizedUserId, tier: 'ARCHIVE_PROVER', status: 'ACTIVE', expiresAt: PERMANENT_DATE }
            });
            return NextResponse.json({ url: '/terminal?tab=dashboard' });
        }

        // SIWE-native: userId is always a walletAddress
        const user = await prisma.user.upsert({
            where: { walletAddress: normalizedUserId },
            update: {},
            create: { walletAddress: normalizedUserId, tier: 'FREE' }
        });

        if (!user) {
            return NextResponse.json({ error: 'Failed to resolve user' }, { status: 404 });
        }

        let priceId = PRICE_IDS[billingCycle][tier];
        if (!priceId) {
            // Stripe price not configured for this tier/cycle combination.
            return NextResponse.json({ error: 'Stripe price ID not configured for this plan. Please contact support.' }, { status: 503 });
        }

        // Auto-resolve prod_ IDs to their default price_ IDs (Intelligent Routing)
        if (priceId.startsWith('prod_') || priceId.startsWith('price_')) {
            try {
                if (priceId.startsWith('prod_')) {
                    const product = await stripe.products.retrieve(priceId);
                    if (!product.default_price) throw new Error('Product has no default price');
                    priceId = typeof product.default_price === 'string' ? product.default_price : product.default_price.id;
                } else {
                    await stripe.prices.retrieve(priceId);
                }
            } catch (err) {
                console.warn('[STRIPE_PRODUCT_RESOLVER] Product/Price missing. Initiating Auto-Bootstrap...', priceId);
                try {
                    const priceAmount = billingCycle === 'ANNUAL' ? planConfig.priceMetrics.annual : planConfig.priceMetrics.monthly;
                    const newProduct = await stripe.products.create({
                        name: `Whale Network - ${planConfig.name}`,
                        description: `Enterprise Node Infrastructure - ${tier} Tier`,
                        metadata: { tier: tier }
                    });
                    const newPrice = await stripe.prices.create({
                        product: newProduct.id,
                        unit_amount: priceAmount,
                        currency: 'usd',
                        recurring: { interval: billingCycle === 'ANNUAL' ? 'year' : 'month' },
                    });
                    await stripe.products.update(newProduct.id, { default_price: newPrice.id });
                    priceId = newPrice.id;
                    console.log(`[STRIPE_AUTO_BOOTSTRAP] Successfully created Price ID: ${priceId}`);
                } catch (bootstrapErr: any) {
                    console.error('[STRIPE_BOOTSTRAP_ERROR]', bootstrapErr);
                    return NextResponse.json({ error: `Payment initialization failed. Verify Stripe API Key. (${bootstrapErr.message})` }, { status: 500 });
                }
            }
        }

        // Create Stripe Checkout Session payload
        const sessionPayload: any = {
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/terminal?upgrade=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/terminal?upgrade=canceled`,
            metadata: {
                userId: normalizedUserId,
                tier: tier,
                env: process.env.NODE_ENV ?? 'production',
                billingCycle: billingCycle,
                // Trillion Parameters Articulation:
                requestsPerDay: planConfig.limits.requestsPerDay.toString(),
                maxApiKeys: planConfig.limits.maxApiKeys.toString(),
                maxTokens: planConfig.limits.maxTokens.toString(),
                dataWindowHours: planConfig.limits.dataWindowHours.toString(),
                ft_webSockets: planConfig.features.webSockets ? 'yes' : 'no',
                ft_fixProtocol: planConfig.features.fixProtocol ? 'yes' : 'no',
                ft_hmacRequired: planConfig.features.hmacRequired ? 'yes' : 'no',
                ft_ipWhitelist: planConfig.features.ipWhitelist ? 'yes' : 'no',
                ft_darkPool: planConfig.features.darkPoolDetection ? 'yes' : 'no',
                ft_csvExport: planConfig.features.csvExport ? 'yes' : 'no'
            },
            subscription_data: {
                trial_period_days: 30,
                metadata: {
                    system_user_id: normalizedUserId,
                    tier: tier,
                    billingCycle: billingCycle,
                    maxTokens: planConfig.limits.maxTokens.toString(),
                    requestsPerDay: planConfig.limits.requestsPerDay.toString(),
                    ft_darkPool: planConfig.features.darkPoolDetection ? 'yes' : 'no'
                }
            }
        };

        if (user.stripeCustomerId) {
            sessionPayload.customer = user.stripeCustomerId;
        } else {
            sessionPayload.customer_email = user.email || undefined;
        }

        const session = await stripe.checkout.sessions.create(sessionPayload);

        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        console.error('[STRIPE_CHECKOUT_ERROR]', error);
        return NextResponse.json({ error: 'Failed to initialize payment tunnel' }, { status: 500 });
    }
}
