import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSecureRequest } from '@/lib/security/premium-security';

//  Complete store key  DB column map 
// Every key in SystemSettings is mapped here.
const STORE_TO_DB: Record<string, string> = {
    // General
    theme:                  'theme',
    language:               'language',
    currency:               'currency',
    timeFormat:             'timeFormat',
    dateFormat:             'dateFormat',
    addressFormat:          'addressFormat',

    // Display & Hardware
    density:                'layoutDensity',
    defaultTimeframe:       'defaultTimeframe',
    displayUnit:            'displayUnit',
    showBalances:           'showBalances',
    soundEffects:           'soundEffects',
    hardwareAcceleration:   'hardwareAcceleration',

    // Network & RPC
    customRpcUrl:           'customRpcUrl',
    testnetMode:            'testnetMode',

    // Execution Rules
    gasPreset:              'gasPreset',
    maxSlippage:            'maxSlippage',
    mevProtection:          'mevProtection',

    // Sonar Alerts
    emailAlerts:            'emailAlerts',
    telegramAlerts:         'telegramAlerts',
    audioAlerts:            'soundEffects',   // maps to soundEffects in DB
    whaleAlertThreshold:    'whaleAlertThreshold',
    email:                  'email',

    // Privacy & Security
    inactivityLockMinutes:  'inactivityLockMinutes',
    autoDisconnectTimer:    'autoDisconnectTimer',
    stealthMode:            'stealthMode',
    requireSignForExports:  'requireSignForExports',
    allowAnalytics:         'allowAnalytics',

    // Whale Chat
    chatName:               'chatName',
    chatBio:                'chatBio',
    qrLabel:                'qrLabel',
    hiddenAssets:           'hiddenAssets',
};

//  DB column  store key (for reverse mapping on GET) 
const DB_TO_STORE: Record<string, string> = {
    layoutDensity: 'density',
    // soundEffects is returned as-is  audioAlerts is a store alias
};

function mapDbToStore(data: Record<string, any>): Record<string, any> {
    const out: Record<string, any> = {};
    for (const [dbKey, val] of Object.entries(data)) {
        const storeKey = DB_TO_STORE[dbKey] ?? dbKey;
        out[storeKey] = val;
    }
    // Duplicate soundEffects  audioAlerts for store compatibility
    if ('soundEffects' in out) {
        out['audioAlerts'] = out['soundEffects'];
    }
    return out;
}

//  Full column select for GET 
const FULL_SELECT = {
    theme: true,
    language: true,
    currency: true,
    timeFormat: true,
    dateFormat: true,
    addressFormat: true,
    layoutDensity: true,
    defaultTimeframe: true,
    displayUnit: true,
    showBalances: true,
    soundEffects: true,
    hardwareAcceleration: true,
    customRpcUrl: true,
    testnetMode: true,
    gasPreset: true,
    maxSlippage: true,
    mevProtection: true,
    emailAlerts: true,
    telegramAlerts: true,
    whaleAlertThreshold: true,
    email: true,
    inactivityLockMinutes: true,
    autoDisconnectTimer: true,
    stealthMode: true,
    requireSignForExports: true,
    allowAnalytics: true,
    chatName: true,
    chatBio: true,
    qrLabel: true,
    hiddenAssets: true,
};

//  Columns guaranteed to exist in every DB schema version 
const SAFE_COLUMNS = ['theme', 'currency', 'showBalances', 'stealthMode', 'allowAnalytics'];

//  Minimal fallback select 
const MINIMAL_SELECT = { theme: true, currency: true };

export async function GET(req: any) {
    try {
        const validation = await validateSecureRequest(req);
        if (!validation.valid || !validation.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const address = validation.userId;

        let user: any = null;

        // Try full select first, degrade gracefully if columns are missing
        try {
            user = await (prisma as any).user.findUnique({
                where: { walletAddress: address },
                select: FULL_SELECT,
            });
        } catch {
            try {
                user = await prisma.user.findUnique({
                    where: { walletAddress: address },
                    select: {
                        theme: true, currency: true, language: true,
                        showBalances: true, stealthMode: true,
                        allowAnalytics: true, soundEffects: true,
                        testnetMode: true, hardwareAcceleration: true,
                    },
                });
            } catch {
                user = await prisma.user.findUnique({
                    where: { walletAddress: address },
                    select: MINIMAL_SELECT,
                });
            }
        }

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        return NextResponse.json(mapDbToStore(user));
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PATCH(req: any) {
    try {
        const validation = await validateSecureRequest(req);
        if (!validation.valid || !validation.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const address = validation.userId;

        const body = await req.json();

        // Translate store keys  DB column names, reject unknown keys
        const updateData: Record<string, any> = {};
        for (const storeKey of Object.keys(body)) {
            const dbKey = STORE_TO_DB[storeKey];
            if (!dbKey) continue; // silently skip unknown keys
            // Prevent duplicate: if both audioAlerts and soundEffects come in,
            // only write once to the soundEffects column
            if (dbKey in updateData) continue;
            updateData[dbKey] = body[storeKey];
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ success: true, settings: {} });
        }

        let updatedUser: any = null;
        try {
            updatedUser = await (prisma as any).user.update({
                where: { walletAddress: address },
                data: updateData,
            });
        } catch {
            // Extended columns not yet migrated  write only safe columns
            const safeData: Record<string, any> = {};
            for (const k of Object.keys(updateData)) {
                if (SAFE_COLUMNS.includes(k)) safeData[k] = updateData[k];
            }
            if (Object.keys(safeData).length > 0) {
                updatedUser = await prisma.user.update({
                    where: { walletAddress: address },
                    data: safeData,
                });
            }
        }

        // Non-blocking audit log
        if (updatedUser) {
            try {
                await prisma.auditLog.create({
                    data: {
                        userId: updatedUser.id,
                        action: 'SETTINGS_UPDATED',
                        resource: 'User',
                        metadata: updateData,
                        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
                    }
                });
            } catch { /* audit log non-critical */ }
        }

        return NextResponse.json({ success: true, settings: mapDbToStore(updateData) });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
