import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSecureRequest } from '@/lib/security/premium-security';

// GET: Fetch all alert rules for a user
export async function GET(req: NextRequest) {
    try {
        const validation = await validateSecureRequest(req);
        if (!validation.valid) {
            return NextResponse.json({ error: validation.error }, { status: 401 });
        }
        const userId = validation.userId!;

        const rules = await prisma.alertRule.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ rules });
    } catch (error) {
        console.error("Fetch rules error:", error);
        return NextResponse.json({ error: 'Failed to fetch rules' }, { status: 500 });
    }
}

// POST: Create a new alert rule
export async function POST(req: NextRequest) {
    try {
        const validation = await validateSecureRequest(req);
        if (!validation.valid) {
            return NextResponse.json({ error: validation.error }, { status: 401 });
        }
        const userId = validation.userId!;

        const body = await req.json();
        const { name, actions, conditions, targetType, targetAddress, priceThreshold, volumeThreshold, txSizeThreshold, conditionLogic } = body;

        if (!name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const rule = await prisma.alertRule.create({
            data: {
                userId,
                name,
                enabled: true,
                targetType: targetType || 'TOKEN',
                targetAddress: targetAddress || null,
                priceThreshold: priceThreshold || null,
                volumeThreshold: volumeThreshold || null,
                txSizeThreshold: txSizeThreshold || null,
                conditionLogic: conditionLogic || 'GREATER_THAN',
                conditions: conditions || null,
                actions: actions || { telegram: false, email: false, push: true, sms: false }
            }
        });

        return NextResponse.json({ rule });
    } catch (error) {
        console.error("Create rule error:", error);
        return NextResponse.json({ error: 'Failed to create rule' }, { status: 500 });
    }
}

// PUT: Toggle rule enabled/disabled
export async function PUT(req: NextRequest) {
    try {
        const validation = await validateSecureRequest(req);
        if (!validation.valid) {
            return NextResponse.json({ error: validation.error }, { status: 401 });
        }
        const userId = validation.userId!;

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const body = await req.json();

        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

        // EXTREME: Verify ownership via updateMany condition
        const result = await prisma.alertRule.updateMany({
            where: { id, userId },
            data: { enabled: body.enabled }
        });

        if (result.count === 0) {
            return NextResponse.json({ error: 'Rule not found or access denied' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update rule' }, { status: 500 });
    }
}

