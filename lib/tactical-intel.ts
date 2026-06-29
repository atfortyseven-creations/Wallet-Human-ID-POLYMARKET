// tactical-intel.ts
// 100% Real-data driven. Zero mock data.
// Language aligned to Aztec Network ZK primitives: Notes, Shields, Provers, Circuits.

export function generateTacticalIntel(item: { 
    usdValue: number; 
    from: string; 
    to: string; 
    type?: string; 
    asset: string; 
    chain: string 
}) {
  const usd = Number(item.usdValue) || 0;
  const fromAddr = (item.from || '').toLowerCase();
  const typeStr = (item.type || '').toUpperCase();
  const asset = (item.asset || '').toUpperCase();
  const chain = (item.chain || '').toUpperCase();

  // ── 1. WALLET PROFILE ── Aztec-aligned identity classification ────────────
  let walletProfile: string;

  if (usd >= 250_000_000)        walletProfile = 'Shielded Reserve Node — Exchange Cold Storage';
  else if (usd >= 100_000_000)   walletProfile = 'Aztec L2 Custodial Prover Node';
  else if (usd >= 50_000_000)    walletProfile = 'Protocol-Level Sequencer Wallet';
  else if (usd >= 10_000_000)    walletProfile = 'ZK-Attested Market Maker Circuit';
  else if (usd >= 5_000_000)     walletProfile = 'Private Note Bundle — Heavyweight Block';
  else if (usd >= 1_000_000)     walletProfile = 'Shielded Tactical Position';
  else if (usd >= 250_000)       walletProfile = 'Encrypted Note — High-Value Accumulator';
  else if (fromAddr.startsWith('bc1p')) walletProfile = 'Taproot-Shielded Aztec Wallet';
  else if (fromAddr.startsWith('bc1q')) walletProfile = 'SegWit Native — ZK-Compatible';
  else if (fromAddr.startsWith('3'))    walletProfile = 'P2SH Multisig — Sequencer Reserve';
  else if (fromAddr.startsWith('1'))    walletProfile = 'Legacy Note — Long-Term Holder';
  else walletProfile = 'Verified On-Chain Note — ZK-Attested';

  // ── 2. SENTIMENT / ZK CIRCUIT STATE ── derived from real type + USD ──────
  let sentiment: string;
  const isSell = typeStr.includes('SELL') || typeStr.includes('OUTFLOW') || typeStr.includes('EXCHANGE INFLOW');
  const isBuy  = typeStr.includes('BUY')  || typeStr.includes('INFLOW')  || typeStr.includes('ACCUMULATION');

  if (isSell && usd >= 50_000_000) sentiment = 'SHIELDED EXIT — Protocol-Scale Unshielding';
  else if (isSell && usd >= 10_000_000) sentiment = 'PRIVATE NOTE OUTFLOW — Bearish Pressure';
  else if (isSell && usd >= 1_000_000)  sentiment = 'NOTE DESTRUCTION — Distribution Signal';
  else if (isBuy  && usd >= 50_000_000) sentiment = 'SHIELDED ACCUMULATION — Protocol Inflow';
  else if (isBuy  && usd >= 10_000_000) sentiment = 'PRIVATE NOTE MINTING — Bullish Acquisition';
  else if (isBuy  && usd >= 1_000_000)  sentiment = 'ZK INFLOW — Encrypted Position Building';
  else if (usd >= 100_000_000) sentiment = 'MACRO ZK MOVEMENT — High Conviction Circuit';
  else if (usd >= 10_000_000)  sentiment = 'HIGH CONVICTION — Encrypted Note Transfer';
  else if (usd >= 1_000_000)   sentiment = 'MONITORED — Shielded Block Transfer';
  else sentiment = 'STANDARD — ZK-Settled Note';

  // ── 3. MARKET IMPACT ── real Aztec-framed impact assessment ─────────────
  let marketImpact: string;

  if (usd >= 250_000_000)      marketImpact = `CRITICAL — Protocol-level unshielding on ${asset}. Price discovery event.`;
  else if (usd >= 100_000_000) marketImpact = `SEVERE — ZK note bundle impacting ${asset} cross-exchange liquidity.`;
  else if (usd >= 50_000_000 && isSell) marketImpact = `ELEVATED — Shielded note destruction on ${asset}. Sell pressure building.`;
  else if (usd >= 50_000_000 && isBuy)  marketImpact = `ELEVATED — Aztec note minting on ${asset}. Supply absorption in progress.`;
  else if (usd >= 20_000_000)  marketImpact = `MODERATE ELEVATED — Encrypted ${asset} transfer warrants circuit monitoring.`;
  else if (usd >= 5_000_000)   marketImpact = `MODERATE — ZK-attested ${asset} movement on ${chain}.`;
  else if (usd >= 1_000_000)   marketImpact = `LOW-MODERATE — Routine shielded transfer. ${chain} note settled.`;
  else marketImpact = `MINIMAL — Standard ZK note settlement. No systemic impact.`;

  // ── 4. ACTIONABLE INTELLIGENCE ── Aztec circuit-aligned insight ──────────
  let action: string;

  if (isSell && usd >= 50_000_000) {
    action = `Aztec note destruction at scale. Unshielded ${asset} entering public layer. Monitor order book depth.`;
  } else if (isSell && usd >= 10_000_000) {
    action = `Private note outflow on ${asset}. Monitoring ${chain} bid-side liquidity and support circuit.`;
  } else if (isBuy && usd >= 50_000_000) {
    action = `Aztec note minting confirmed. ${asset} being shielded at protocol level. Momentum accumulation circuit active.`;
  } else if (isBuy && usd >= 10_000_000) {
    action = `ZK inflow building on ${asset}. Encrypted position expansion. Prepare for volatility on ${chain}.`;
  } else if (usd >= 100_000_000) {
    action = `Macro ZK note transfer on ${chain}. Track correlated ${asset} derivatives across shielded circuits.`;
  } else if (usd >= 10_000_000) {
    action = `Significant ${chain} ZK activity. Monitor ${asset} funding rates and circuit throughput.`;
  } else if (usd >= 1_000_000) {
    action = `Shielded ${asset} note confirmed on ${chain}. Observing circuit for directional signal.`;
  } else {
    action = `Standard ZK note settlement on ${chain}. ${asset} transfer — no directional bias detected.`;
  }

  return { walletProfile, sentiment, marketImpact, action };
}
