/**
 * useActivePortfolio
 *
 * Canonical export path for the active portfolio hook.
 * Implementation lives in useLivePortfolio.ts — this file is the
 * stable public import alias used across PolymarketPanel, LivePortfolio,
 * and PolymarketExecutionPanel.
 *
 * DO NOT duplicate logic here. Import from this path only.
 */
export { useActivePortfolio } from './useLivePortfolio';
