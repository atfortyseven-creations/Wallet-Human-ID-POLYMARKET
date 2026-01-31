import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// ============================================
// SECURITY LAYER 1: Rate Limiting
// ============================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blacklisted: boolean;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Rate limit configuration by endpoint tier
const RATE_LIMITS = {
  FREE: { requests: 10, window: 60000 }, // 10 req/min
  PREMIUM: { requests: 100, window: 60000 }, // 100 req/min
  CRITICAL: { requests: 5, window: 60000 }, // 5 req/min for sensitive ops
};

export function rateLimit(
  identifier: string,
  tier: 'FREE' | 'PREMIUM' | 'CRITICAL' = 'FREE'
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const limit = RATE_LIMITS[tier];
  
  let entry = rateLimitStore.get(identifier);
  
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + limit.window,
      blacklisted: false,
    };
    rateLimitStore.set(identifier, entry);
  }
  
  // Check if blacklisted
  if (entry.blacklisted) {
    return { allowed: false, remaining: 0, resetIn: entry.resetTime - now };
  }
  
  entry.count++;
  
  // Auto-blacklist if exceeded by 10x (suspicious behavior)
  if (entry.count > limit.requests * 10) {
    entry.blacklisted = true;
    console.error(`[SECURITY] IP blacklisted for abuse: ${identifier}`);
    logSecurityEvent('RATE_LIMIT_ABUSE', { identifier, count: entry.count });
  }
  
  const allowed = entry.count <= limit.requests;
  const remaining = Math.max(0, limit.requests - entry.count);
  const resetIn = entry.resetTime - now;
  
  return { allowed, remaining, resetIn };
}

// ============================================
// SECURITY LAYER 2: Subscription Verification
// ============================================

export async function verifyPremiumAccess(userId: string): Promise<{
  valid: boolean;
  tier: 'FREE' | 'PREMIUM' | 'TRIAL';
  expiresAt?: Date;
}> {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        expiresAt: { gte: new Date() },
      },
    });
    
    if (!subscription) {
      // Check for trial
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { trialEndsAt: true },
      });
      
      if (user?.trialEndsAt && user.trialEndsAt > new Date()) {
        return { valid: true, tier: 'TRIAL', expiresAt: user.trialEndsAt };
      }
      
      return { valid: false, tier: 'FREE' };
    }
    
    return {
      valid: true,
      tier: 'PREMIUM',
      expiresAt: subscription.expiresAt,
    };
  } catch (error) {
    console.error('[SECURITY] Subscription verification error:', error);
    return { valid: false, tier: 'FREE' };
  }
}

// ============================================
// SECURITY LAYER 3: Data Encryption
// ============================================

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';

export function encryptData(data: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    ENCRYPTION_ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptData(encryptedData: string): string | null {
  try {
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
    
    const decipher = crypto.createDecipheriv(
      ENCRYPTION_ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      Buffer.from(ivHex, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('[SECURITY] Decryption failed:', error);
    return null;
  }
}

// ============================================
// SECURITY LAYER 4: Audit Trail
// ============================================

interface AuditLog {
  userId: string;
  action: string;
  resource: string;
  metadata?: any;
  ip?: string;
  userAgent?: string;
}

export async function logAuditEvent(log: AuditLog): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: log.userId,
        action: log.action,
        resource: log.resource,
        metadata: log.metadata ? JSON.stringify(log.metadata) : null,
        ip: log.ip,
        userAgent: log.userAgent,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('[SECURITY] Audit log failed:', error);
  }
}

// ============================================
// SECURITY LAYER 5: Input Validation
// ============================================

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>'"]/g, '') // Remove HTML/JS injection chars
    .replace(/javascript:/gi, '') // Remove JS protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 1000); // Limit length
}

export function validateWalletAddress(address: string): boolean {
  // Ethereum address validation
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function validateEmailAddress(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ============================================
// SECURITY LAYER 6: CSRF Protection
// ============================================

export function generateCSRFToken(userId: string): string {
  const timestamp = Date.now();
  const randomData = crypto.randomBytes(32).toString('hex');
  const payload = `${userId}:${timestamp}:${randomData}`;
  
  const hmac = crypto.createHmac('sha256', ENCRYPTION_KEY);
  const signature = hmac.update(payload).digest('hex');
  
  return `${Buffer.from(payload).toString('base64')}.${signature}`;
}

export function verifyCSRFToken(token: string, userId: string): boolean {
  try {
    const [payloadB64, signature] = token.split('.');
    const payload = Buffer.from(payloadB64, 'base64').toString('utf8');
    const [tokenUserId, timestamp, randomData] = payload.split(':');
    
    // Verify user ID matches
    if (tokenUserId !== userId) return false;
    
    // Verify token is not expired (15 minutes)
    if (Date.now() - parseInt(timestamp) > 900000) return false;
    
    // Verify signature
    const hmac = crypto.createHmac('sha256', ENCRYPTION_KEY);
    const expectedSignature = hmac.update(payload).digest('hex');
    
    return signature === expectedSignature;
  } catch (error) {
    return false;
  }
}

// ============================================
// SECURITY LAYER 7: Fraud Detection
// ============================================

interface FraudSignal {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details: any;
}

export async function detectFraud(userId: string, action: string): Promise<FraudSignal[]> {
  const signals: FraudSignal[] = [];
  
  // Check 1: Rapid account creation
  const recentAccounts = await prisma.user.count({
    where: {
      createdAt: { gte: new Date(Date.now() - 3600000) }, // Last hour
    },
  });
  
  if (recentAccounts > 10) {
    signals.push({
      type: 'RAPID_ACCOUNT_CREATION',
      severity: 'HIGH',
      details: { count: recentAccounts },
    });
  }
  
  // Check 2: Unusual activity pattern
  const userActions = await prisma.auditLog.count({
    where: {
      userId,
      timestamp: { gte: new Date(Date.now() - 300000) }, // Last 5 min
    },
  });
  
  if (userActions > 100) {
    signals.push({
      type: 'SUSPICIOUS_ACTIVITY_VOLUME',
      severity: 'CRITICAL',
      details: { actions: userActions },
    });
  }
  
  // Check 3: Multiple failed payment attempts
  if (action === 'PAYMENT_FAILED') {
    const failedPayments = await prisma.auditLog.count({
      where: {
        userId,
        action: 'PAYMENT_FAILED',
        timestamp: { gte: new Date(Date.now() - 3600000) },
      },
    });
    
    if (failedPayments >= 3) {
      signals.push({
        type: 'MULTIPLE_PAYMENT_FAILURES',
        severity: 'HIGH',
        details: { attempts: failedPayments },
      });
    }
  }
  
  return signals;
}

// ============================================
// SECURITY LAYER 8: Security Event Logging
// ============================================

export async function logSecurityEvent(
  event: string,
  details: any
): Promise<void> {
  console.error(`[SECURITY EVENT] ${event}`, details);
  
  // In production, send to security monitoring service
  // e.g., Sentry, DataDog, CloudWatch, etc.
  
  try {
    await prisma.securityEvent.create({
      data: {
        event,
        details: JSON.stringify(details),
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('[SECURITY] Failed to log security event:', error);
  }
}

// ============================================
// SECURITY LAYER 9: Request Validation
// ============================================

export async function validateSecureRequest(
  req: NextRequest,
  requiredTier: 'FREE' | 'PREMIUM' = 'FREE'
): Promise<{
  valid: boolean;
  userId?: string;
  error?: string;
}> {
  // 1. Check session
  const session = await getServerSession();
  if (!session?.user?.id) {
    return { valid: false, error: 'Unauthorized' };
  }
  
  const userId = session.user.id;
  
  // 2. Rate limiting
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const rateCheck = rateLimit(`${userId}:${ip}`, requiredTier);
  
  if (!rateCheck.allowed) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', { userId, ip });
    return { valid: false, error: 'Rate limit exceeded' };
  }
  
  // 3. Subscription verification
  if (requiredTier === 'PREMIUM') {
    const access = await verifyPremiumAccess(userId);
    if (!access.valid) {
      return { valid: false, error: 'Premium subscription required' };
    }
  }
  
  // 4. Fraud detection
  const fraudSignals = await detectFraud(userId, 'API_REQUEST');
  const criticalSignals = fraudSignals.filter(s => s.severity === 'CRITICAL');
  
  if (criticalSignals.length > 0) {
    logSecurityEvent('FRAUD_DETECTED', { userId, signals: criticalSignals });
    return { valid: false, error: 'Suspicious activity detected' };
  }
  
  // 5. CSRF validation for mutations
  if (req.method !== 'GET') {
    const csrfToken = req.headers.get('x-csrf-token');
    if (!csrfToken || !verifyCSRFToken(csrfToken, userId)) {
      logSecurityEvent('CSRF_VALIDATION_FAILED', { userId });
      return { valid: false, error: 'Invalid CSRF token' };
    }
  }
  
  return { valid: true, userId };
}

// ============================================
// SECURITY LAYER 10: Data Watermarking
// ============================================

export function watermarkData(data: any, userId: string): any {
  // Add invisible watermark to detect data leaks
  const watermark = crypto
    .createHash('sha256')
    .update(`${userId}:${Date.now()}`)
    .digest('hex')
    .slice(0, 8);
  
  return {
    ...data,
    _wm: watermark,
    _ts: Date.now(),
  };
}

export function verifyWatermark(data: any, userId: string): boolean {
  if (!data._wm) return false;
  
  // In production, check watermark against database
  return true;
}
