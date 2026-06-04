export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

import { walletAnalyticsService } from '@/lib/wallet/WalletAnalyticsService';

const MEMPOOL_BASE = 'https://mempool.space/api';

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ address: string }> }
) {
    const { address } = await params;

    if (!address) {
        return NextResponse.json({ error: 'Address required' }, { status: 400 });
    }

    const isEVM = /^0x[a-fA-F0-9]{40}$/.test(address);
    const isBTC = /^(1|3|bc1)[a-zA-Z0-9]{25,62}$/.test(address);

    if (!isBTC && !isEVM) {
        return NextResponse.json({ error: 'Invalid address format' }, { status: 400 });
    }

    try {
        // --- EVM INTELLIGENCE PATH (Moralis/Alchemy) ---
        if (isEVM) {
            console.log(`[Address API] Deep scanning EVM entity: ${address}`);
            const intel = await walletAnalyticsService.getFullAnalytics(address, false, true);
            
            return NextResponse.json({
                address,
                label: intel.entityInfo?.name || (intel.forensics?.label === 'Exchange' ? 'Elite Exchange' : intel.category) || 'EVM Entity',
                balance_btc: 0, // Not applicable for EVM in this field
                total_value_usd: intel.totalValue,
                tx_count: intel.txCount,
                risk_score: intel.riskScore,
                identity_tier: intel.identityTier,
                forensics: intel.forensics,
                recent_txs: intel.recentTransfers,
                networks: intel.networksActive,
                dapp_activity: intel.dappActivities,
                is_evm: true
            });
        }

        // --- BITCOIN PATH (Mempool.space) ---
        const [addrRes, txsRes] = await Promise.all([
            fetch(`${MEMPOOL_BASE}/address/${address}`, { next: { revalidate: 30 } }),
            fetch(`${MEMPOOL_BASE}/address/${address}/txs`, { next: { revalidate: 30 } }),
        ]);

        if (!addrRes.ok) {
            return NextResponse.json({ error: 'Address not found' }, { status: 404 });
        }

        const addressData = await addrRes.json();
        const txs = txsRes.ok ? await txsRes.json() : [];

        // Classify address type
        let label = 'Unknown Wallet';
        if (address.startsWith('bc1p')) label = 'Cold Storage (Taproot)';
        else if (address.startsWith('bc1q')) label = 'SegWit Wallet';
        else if (address.startsWith('3')) label = 'Exchange / Multisig (P2SH)';
        else if (address.startsWith('1')) label = 'Legacy / Miner Wallet';

        const funded = addressData.chain_stats?.funded_txo_sum ?? 0;
        const spent = addressData.chain_stats?.spent_txo_sum ?? 0;
        const balance = funded - spent;

        const recentTxValues = txs.slice(0, 20).map((tx: any) => {
            const totalOut = tx.vout?.reduce((s: number, v: any) => {
                if (v.scriptpubkey_address === address) return s + (v.value ?? 0);
                return s;
            }, 0) ?? 0;
            return totalOut / 1e8;
        });

        return NextResponse.json({
            address,
            label,
            balance_btc: balance / 1e8,
            funded_txo_sum_btc: funded / 1e8,
            spent_txo_sum_btc: spent / 1e8,
            tx_count: addressData.chain_stats?.tx_count ?? 0,
            mempool_tx_count: addressData.mempool_stats?.tx_count ?? 0,
            recent_tx_btc_values: recentTxValues,
            recent_txs: txs.slice(0, 50),
            is_evm: false
        });
    } catch (err) {
        console.error('[Address API]', err);
        return NextResponse.json({ error: 'Upstream error' }, { status: 502 });
    }
}

