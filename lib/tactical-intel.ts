export function generateTacticalIntel(item: { 
    usdValue: number; 
    from: string; 
    to: string; 
    type?: string; 
    asset: string; 
    chain: string 
}) {
  const usd = Number(item.usdValue) || 0;
  
  // 1. Wallet Profile
  let walletProfile = 'Unknown Entity';
  if (usd > 50_000_000) walletProfile = 'System / Exchange Cold Wallet';
  else if (usd > 10_000_000) walletProfile = 'Institutional Market Maker';
  else if (usd > 1_000_000) walletProfile = 'Heavyweight DEX Verifier';
  else if (usd > 100_000) walletProfile = 'Tactical Flow / Institutional Accumulation';
  else if (item.from?.toLowerCase().includes('mining')) walletProfile = 'Mining Pool Finalization';
  else walletProfile = 'Algo-Attesting Bot / Smart Contract';

  // 2. Sentiment Analysis
  let sentiment = 'NEUTRAL';
  const isSellLike = item.type?.toUpperCase().includes('SELL') || item.type?.toUpperCase().includes('OUTFLOW');
  const isBuyLike = item.type?.toUpperCase().includes('BUY') || item.type?.toUpperCase().includes('INFLOW');
  
  if (isSellLike) sentiment = 'BEARISH DISTRIBUTION';
  else if (isBuyLike) sentiment = 'BULLISH ACQUISITION';
  else if (usd > 5_000_000) sentiment = 'HIGH CONVICTION MOVEMENT';

  // 3. Market Impact
  let marketImpact = 'Routine Settlement - Minimal Impact Expected';
  if (usd > 20_000_000 && isSellLike) marketImpact = 'SEVERE - Potential sell wall forming. High volatility expected.';
  else if (usd > 20_000_000 && isBuyLike) marketImpact = 'MASSIVE - Supply shock imminent. Price discovery phase likely.';
  else if (usd > 5_000_000) marketImpact = 'ELEVATED - Localized volatility possible on lower timeframe charts.';

  // 4. Actionable Insight
  let action = `Monitor ${item.asset} liquidity bands. No immediate action required.`;
  if (isSellLike && usd > 100_000) {
      action = `Tactical de-risking detected. Monitoring ${item.asset} support levels.`;
  } else if (isBuyLike && usd > 100_000) {
      action = `Strategic accumulation confirmed. Potential momentum forming on ${item.asset}.`;
  } else if (usd > 10_000_000) {
      action = `Massive fundamental shift on ${item.chain}. Prepare for sudden price spikes across the ${item.asset} ecosystem.`;
  }

  return { walletProfile, sentiment, marketImpact, action };
}
