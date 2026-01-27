/**
 * Fixed Product Market Maker (FPMM) Math
 * Based on Gnosis CPMM: k = x * y
 * Where x and y are the reserves of the two outcome tokens.
 */

// 1. Calculate Buy Amount (Output) given Investment (Input)
// How many shares of Outcome A can I buy with `investmentAmount` of Collateral?
// In a CPMM, buying shares involves "Splitting" collateral into A+B, then swapping B for A.
// Formula: amountOut = investment / price_after_impact (simplified approximation for now)
// Precise Formula: shares = R_outcome * (1 - (k / (investment + k))) ... wait, simple CPMM for binary:
// When you buy YES, you deposit Collateral (C).
// The MM splits C into YES + NO. It keeps NO and gives you YES.
// Actually, Gnosis FPMM simplified:
// outcome_shares_bought = (investment * reserve_other) / (reserve_own + investment)  <-- classic Uniswap x*y=k (with fee=0)
// BUT, Gnosis works by merging collateral.
// Let's use the exact Gnosis `calcBuyAmount` logic if we were calling the contract view.
// Since we are mocking for now or calculating estimation:
export const calcBuyAmount = (
    investment: number,
    outcomeReserve: number,
    otherReserve: number
): number => {
    // Basic CPMM: (x + dx)(y - dy) = xy
    // We are adding investment to the pool (implicitly) to buy outcome shares.
    // In Gnosis FPMM, buying "YES" means providing Collateral, which effectively increases the "Liquidity" slightly or changes ratio.

    // Simplified for Estimation:
    // If we assume a trade against the pool reserves R_yes and R_no.
    // Price of YES = R_no / (R_yes + R_no)
    // Shares = Investment / Price (roughly)

    // A better approximation for "Amount of Outcome Tokens bought for Collateral":
    // User pays `amount` Collateral.
    // 1. Fee is deducted (assume 0 for now).
    // 2. User buys outcome tokens.
    // Formula derived from Gnosis: 
    // amountBought = R_out * (1 - (R_other / (R_other + amountIn))) ? No.

    // Let's stick to Price Probability for UI display first.
    // We will implement the exact contract read in the hooks.
    return 0; // Placeholder for exact math, we usually query the contract `calcBuyAmount` view.
};

// 2. Probability / Price Calculation
// Price of Outcome A = Reserve B / (Reserve A + Reserve B)
export const getProbabilities = (
    reserveYes: number,
    reserveNo: number
): { probYes: number, probNo: number } => {
    if (reserveYes === 0 && reserveNo === 0) return { probYes: 0.5, probNo: 0.5 };

    const k = reserveYes * reserveNo; // Not really needed for price
    const total = reserveYes + reserveNo;

    const probYes = reserveNo / total; // Scarcity principle: less NO means YES is more likely? 
    // Wait, CPMM Price = Spot Price = y / x (relative).
    // Price of buying X (in terms of Y) is y/x.
    // In Gnosis, Spot Price of Outcome A = R_b / (R_a + R_b)

    const probNo = reserveYes / total;

    return { probYes, probNo };
};

// 3. Slippage Protection
// minAmount = expectedAmount * (1 - slippageTolerance)
export const calculateMinAmount = (
    expectedAmount: bigint,
    slippageTolerance: number = 0.01 // 1%
): bigint => {
    const factor = 1 - slippageTolerance;
    // bigint math: expected * (100 - tolerance*100) / 100
    return expectedAmount * BigInt(Math.floor(factor * 1000)) / BigInt(1000);
};
