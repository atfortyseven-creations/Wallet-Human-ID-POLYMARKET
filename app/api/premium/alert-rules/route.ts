import { NextRequest, NextResponse } from 'next/server';
import {
  validateSecureRequest,
  logAuditEvent,
  verifyPremiumAccess,
  watermarkData,
  logSecurityEvent,
} from '@/lib/security/premium-security';
import { prisma } from '@/lib/prisma';

// ============================================
// PROTECTED API: Get Alert Rules
// ============================================

export async function GET(req: NextRequest) {
  try {
    const validation = await validateSecureRequest(req, 'PREMIUM');
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    const userId = validation.userId!;

    const rules = await prisma.alertRule.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(watermarkData({ rules }, userId));
  } catch (error) {
    console.error('[API ERROR] Get alert rules:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================
// PROTECTED API: Create Alert Rule
// ============================================

export async function POST(req: NextRequest) {
  try {
    const validation = await validateSecureRequest(req, 'PREMIUM');
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    const userId = validation.userId!;
    const body = await req.json();

    // Verify premium access
    const access = await verifyPremiumAccess(userId);
    if (!access.valid) {
      return NextResponse.json(
        {
          error: 'Premium subscription required for custom alert rules',
          requiresUpgrade: true,
        },
        { status: 403 }
      );
    }

    // Validate input
    if (!body.name || !body.conditions || !Array.isArray(body.conditions)) {
      return NextResponse.json(
        { error: 'Invalid rule configuration' },
        { status: 400 }
      );
    }

    // Check rule limit (max 20 rules per user)
    const ruleCount = await prisma.alertRule.count({
      where: { userId },
    });

    if (ruleCount >= 20) {
      return NextResponse.json(
        { error: 'Maximum 20 alert rules allowed' },
        { status: 400 }
      );
    }

    // Create rule
    const rule = await prisma.alertRule.create({
      data: {
        userId,
        name: body.name,
        enabled: body.enabled ?? true,
        conditions: body.conditions,
        actions: body.actions || {},
        createdAt: new Date(),
      },
    });

    // Audit log
    await logAuditEvent({
      userId,
      action: 'ALERT_RULE_CREATED',
      resource: 'alert_rule',
      metadata: { ruleId: rule.id, name: body.name },
      ip: req.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json(watermarkData(rule, userId));
  } catch (error) {
    console.error('[API ERROR] Create alert rule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================
// PROTECTED API: Update Alert Rule
// ============================================

export async function PATCH(req: NextRequest) {
  try {
    const validation = await validateSecureRequest(req, 'PREMIUM');
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    const userId = validation.userId!;
    const body = await req.json();

    if (!body.ruleId) {
      return NextResponse.json(
        { error: 'Rule ID required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const rule = await prisma.alertRule.findFirst({
      where: { id: body.ruleId, userId },
    });

    if (!rule) {
      logSecurityEvent('UNAUTHORIZED_RULE_ACCESS', { userId, ruleId: body.ruleId });
      return NextResponse.json(
        { error: 'Rule not found' },
        { status: 404 }
      );
    }

    // Update rule
    const updated = await prisma.alertRule.update({
      where: { id: body.ruleId },
      data: {
        name: body.name ?? rule.name,
        enabled: body.enabled ?? rule.enabled,
        conditions: body.conditions ?? rule.conditions,
        actions: body.actions ?? rule.actions,
        updatedAt: new Date(),
      },
    });

    await logAuditEvent({
      userId,
      action: 'ALERT_RULE_UPDATED',
      resource: 'alert_rule',
      metadata: { ruleId: body.ruleId },
      ip: req.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json(watermarkData(updated, userId));
  } catch (error) {
    console.error('[API ERROR] Update alert rule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================
// PROTECTED API: Delete Alert Rule
// ============================================

export async function DELETE(req: NextRequest) {
  try {
    const validation = await validateSecureRequest(req, 'PREMIUM');
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    const userId = validation.userId!;
    const { searchParams } = new URL(req.url);
    const ruleId = searchParams.get('id');

    if (!ruleId) {
      return NextResponse.json(
        { error: 'Rule ID required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const rule = await prisma.alertRule.findFirst({
      where: { id: ruleId, userId },
    });

    if (!rule) {
      logSecurityEvent('UNAUTHORIZED_RULE_DELETE', { userId, ruleId });
      return NextResponse.json(
        { error: 'Rule not found' },
        { status: 404 }
      );
    }

    await prisma.alertRule.delete({
      where: { id: ruleId },
    });

    await logAuditEvent({
      userId,
      action: 'ALERT_RULE_DELETED',
      resource: 'alert_rule',
      metadata: { ruleId },
      ip: req.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API ERROR] Delete alert rule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
