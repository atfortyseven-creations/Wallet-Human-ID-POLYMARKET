/**
 * FASE 9  ANTI-RUGPULL SCANNER SOBERANO
 * Analiza contratos inteligentes usando GoPlus Security API + Etherscan
 * para detectar: honeypots, liquidez no bloqueada, funciones maliciosas.
 *
 * El usuario pega la dirección del contrato  el backend lo analiza  
 * devuelve un informe completo con puntuación de seguridad.
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const GOPLUS_API = 'https://api.gopluslabs.io/api/v1';

// Chain ID mapping for GoPlus
const CHAIN_IDS: Record<string, string> = {
    'ethereum': '1', 'eth': '1',
    'bsc': '56', 'binance': '56',
    'polygon': '137', 'matic': '137',
    'arbitrum': '42161', 'arb': '42161',
    'base': '8453',
    'optimism': '10', 'op': '10',
    'avalanche': '43114', 'avax': '43114',
    'solana': 'solana',
};

interface SecurityReport {
    address: string;
    chain: string;
    chainId: string;
    name: string;
    symbol: string;
    totalSupply: string;
    safetyScore: number; // 0-100
    verdict: 'SAFE' | 'CAUTION' | 'DANGER' | 'SCAM';
    risks: RiskItem[];
    positives: string[];
    rawData?: any;
    analyzedAt: number;
}

interface RiskItem {
    severity: 'critical' | 'high' | 'medium' | 'low';
    label: string;
    description: string;
}

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const address = searchParams.get('address')?.trim();
    const chainParam = (searchParams.get('chain') || 'ethereum').toLowerCase();

    if (!address) {
        return NextResponse.json({ error: 'address is required' }, { status: 400 });
    }

    const chainId = CHAIN_IDS[chainParam] || '1';

    try {
        // For Solana, use different endpoint
        const endpoint = chainId === 'solana'
            ? `${GOPLUS_API}/solana/token_security?contract_addresses=${address}`
            : `${GOPLUS_API}/token_security/${chainId}?contract_addresses=${address}`;

        const res = await fetch(endpoint, {
            headers: { 'Accept': 'application/json' },
            next: { revalidate: 300 } // Cache 5 mins  contract data doesn't change
        });

        if (!res.ok) throw new Error(`GoPlus API error: ${res.status}`);

        const data = await res.json();
        const addrKey = address.toLowerCase();
        const tokenData = data.result?.[addrKey] || data.result?.[address] || {};

        const risks: RiskItem[] = [];
        const positives: string[] = [];
        let deductions = 0;

        //  Critical risk checks 
        if (tokenData.is_honeypot === '1') {
            risks.push({ severity: 'critical', label: 'HONEYPOT DETECTADO', description: 'El contrato tiene funciones que impiden al usuario vender el token. Trampa confirmada.' });
            deductions += 80;
        }
        if (tokenData.cannot_sell_all === '1') {
            risks.push({ severity: 'critical', label: 'IMPOSIBLE VENDER TODO', description: 'El contrato prohíbe vender el 100% del balance. Diseñado para atrapar a inversores.' });
            deductions += 60;
        }

        //  High risk checks 
        if (tokenData.is_mintable === '1') {
            risks.push({ severity: 'high', label: 'TOKEN MINTEABLE', description: 'El propietario puede crear nuevos tokens infinitamente, diluyendo tu participación.' });
            deductions += 25;
        }
        if (tokenData.owner_change_balance === '1') {
            risks.push({ severity: 'high', label: 'PROPIETARIO PUEDE MODIFICAR BALANCES', description: 'El contrato permite al deployer cambiar los balances de cualquier wallet.' });
            deductions += 35;
        }
        if (tokenData.hidden_owner === '1') {
            risks.push({ severity: 'high', label: 'PROPIETARIO OCULTO', description: 'La propiedad del contrato está ofuscada. Red flag de proyecto fraudulento.' });
            deductions += 20;
        }
        if (tokenData.can_take_back_ownership === '1') {
            risks.push({ severity: 'high', label: 'RENOUNCE REVERSIBLE', description: 'El equipo puede recuperar la propiedad del contrato incluso después de haberla renunciado.' });
            deductions += 20;
        }

        //  Medium risk checks 
        const tax = Math.max(
            parseFloat(tokenData.buy_tax || '0'),
            parseFloat(tokenData.sell_tax || '0')
        );
        if (tax > 10) {
            risks.push({ severity: 'high', label: `IMPUESTO EXCESIVO (${tax.toFixed(0)}%)`, description: `El contrato cobra un ${tax.toFixed(0)}% en compras/ventas. Los impuestos >10% son señal de scam.` });
            deductions += Math.min(tax * 2, 40);
        } else if (tax > 5) {
            risks.push({ severity: 'medium', label: `IMPUESTO ELEVADO (${tax.toFixed(0)}%)`, description: `${tax.toFixed(0)}% de tax. Inusual pero no necesariamente malicioso.` });
            deductions += 10;
        }

        if (tokenData.transfer_pausable === '1') {
            risks.push({ severity: 'medium', label: 'TRANSFERENCIAS PAUSABLES', description: 'El equipo puede congelar todas las transacciones del token.' });
            deductions += 15;
        }
        if (tokenData.is_proxy === '1') {
            risks.push({ severity: 'medium', label: 'CONTRATO PROXY (Upgradeable)', description: 'El contrato puede ser actualizado por el equipo, cambiando sus reglas en cualquier momento.' });
            deductions += 10;
        }

        if (tokenData.lp_holders) {
            try {
                const holders = JSON.parse(tokenData.lp_holders);
                const locked = holders.filter((h: any) => h.is_locked === 1);
                const lockedPct = locked.reduce((s: number, h: any) => s + parseFloat(h.percent || '0'), 0) * 100;
                if (lockedPct < 80) {
                    risks.push({ severity: 'high', label: `LIQUIDEZ SIN BLOQUEAR (${lockedPct.toFixed(0)}% bloqueada)`, description: 'El equipo puede retirar la liquidez en cualquier momento (rug pull).' });
                    deductions += 30;
                } else {
                    positives.push(` ${lockedPct.toFixed(0)}% de la liquidez está bloqueada`);
                }
            } catch (_) {}
        }

        //  Positives 
        if (tokenData.is_open_source === '1') positives.push(' Código fuente verificado en el explorador');
        if (tokenData.is_honeypot === '0') positives.push(' No es honeypot  test de venta OK');
        if (tokenData.cannot_sell_all === '0') positives.push(' Permite vender el 100% del balance');
        if (tokenData.is_mintable === '0') positives.push(' Supply fija  no minteable');
        if (tax === 0) positives.push(' Sin impuesto en compra/venta');

        const safetyScore = Math.max(0, Math.min(100, 100 - deductions));
        const verdict: SecurityReport['verdict'] =
            safetyScore >= 80 ? 'SAFE' :
            safetyScore >= 55 ? 'CAUTION' :
            safetyScore >= 30 ? 'DANGER' : 'SCAM';

        const report: SecurityReport = {
            address,
            chain: chainParam,
            chainId,
            name: tokenData.token_name || 'Desconocido',
            symbol: tokenData.token_symbol || '???',
            totalSupply: tokenData.total_supply || 'N/A',
            safetyScore,
            verdict,
            risks: risks.sort((a, b) => {
                const order = { critical: 0, high: 1, medium: 2, low: 3 };
                return order[a.severity] - order[b.severity];
            }),
            positives,
            analyzedAt: Date.now(),
        };

        return NextResponse.json(report);

    } catch (err: any) {
        console.error('[SECURITY_SCAN]', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
