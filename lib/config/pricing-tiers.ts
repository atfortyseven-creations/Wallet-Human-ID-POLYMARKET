/**
 * lib/config/pricing-tiers.ts
 * 
 * SINGLE SOURCE OF TRUTH for all pricing tier data across the platform.
 * Each feature is mapped to its corresponding system section.
 */

export interface PricingFeature {
  text: string;
  highlight?: boolean;
  section?: 'dashboard' | 'chat' | 'portfolio' | 'community' | 'core';
}

export interface SectionFeatureGroup {
  section: 'dashboard' | 'chat' | 'portfolio' | 'community';
  label: string;
  icon: string;
  freeFeatures: string[];
  proFeatures: string[];
}

export interface PricingTier {
  id: 'FREE' | 'STANDARD';
  name: string;
  tagline: string;
  priceMonthly: string;
  priceAnnual: string;
  features: PricingFeature[];
  buttonText: string;
  highlight?: boolean;
  accentColor: string;
  badge?: string;
  lottie?: string;
}

export const TIER_RANK: Record<PricingTier['id'], number> = {
  FREE:     0,
  STANDARD: 1,
};

/** Per-section breakdown used in the enhanced pricing comparison UI */
export const SECTION_FEATURES: SectionFeatureGroup[] = [
  {
    section: 'dashboard',
    label: 'Dashboard',
    icon: '',
    freeFeatures: [
      'Active whale movement feed (top 50 per day)',
      'Basic on-chain activity overview',
      'Market cap & volume snapshot',
      '24h price movement tracker',
      'Standard network health indicators',
    ],
    proFeatures: [
      'Unlimited whale movements across all blockchains',
      'Set custom alert thresholds by wallet size & token',
      'AI-powered whale behavior predictions',
      'Smart money accumulation & sell-off heatmaps',
      'Multi-chain tracking: ETH, BTC, SOL, ARB, BASE & more',
      'Institutional wallet profiling & risk scoring',
      'Full 12-month historical data archive',
      'Priority real-time data stream with lowest possible delay',
    ],
  },
  {
    section: 'chat',
    label: 'Whale Chat',
    icon: '',
    freeFeatures: [
      'Access to the public community chat',
      'Message history up to 7 days',
      'Basic market discussion channels',
    ],
    proFeatures: [
      'Exclusive VIP Whale Analytics Channel',
      'Verified analyst signals & private alpha feed',
      'AI sentiment engine built from live chat data',
      'Real-time on-chain event alerts delivered to chat',
      'Priority message visibility & verified member badge',
      'Custom keyword & token alert filters',
      'Unlimited message history archive',
      'Early-access announcements before public release',
    ],
  },
  {
    section: 'portfolio',
    label: 'Portfolio',
    icon: '',
    freeFeatures: [
      'Single wallet portfolio overview',
      'Basic profit & loss tracking',
      'Token balance snapshot',
      'Basic transaction history',
    ],
    proFeatures: [
      'Unlimited wallets & multi-chain tracking',
      'Advanced P&L with cost basis & tax optimization',
      'Whale copy-trading signals — follow the best wallets',
      'DeFi yield optimization & opportunity alerts',
      'Smart portfolio rebalancing recommendations',
      'NFT collection valuation & floor price tracking',
      'Exposure & risk concentration scoring',
      'Export reports in CSV, PDF & tax-ready formats',
    ],
  },
  {
    section: 'community',
    label: 'Community',
    icon: '',
    freeFeatures: [
      'Access to public community forums',
      'Read community research posts',
      'Basic leaderboard visibility',
    ],
    proFeatures: [
      'Verified Whale Member badge on your profile',
      'Access to private institutional forum',
      'Monthly live Q&A sessions with top whale analysts',
      'DAO governance voting rights',
      'Early access to all new platform features',
      'Priority support with a dedicated response channel',
      'Exclusive research reports & market analysis',
      'Referral program with revenue sharing',
    ],
  },
];

export const PRICING_TIERS: PricingTier[] = [
  {
    id:           'FREE',
    name:         'Whale Alert Network',
    tagline:      'Start tracking whale movements for free, today.',
    priceMonthly: '0',
    priceAnnual:  '0',
    accentColor:  '#050505',
    lottie:       'isometric-cube.json',
    features: [
      { text: 'Active whale movement feed (top 50 per day)', section: 'dashboard' },
      { text: 'Basic on-chain activity overview & market snapshot', section: 'dashboard' },
      { text: 'Access to public community chat (7-day history)', section: 'chat' },
      { text: 'Single wallet portfolio tracker', section: 'portfolio' },
      { text: 'Basic profit & loss and token balance overview', section: 'portfolio' },
      { text: 'Community forums & research post access', section: 'community' },
      { text: 'Privacy-first login — no password, no email required', section: 'core' },
      { text: 'Whale Alert Academy — free educational content', section: 'core' },
    ],
    buttonText: 'Get Started Free',
  },
  {
    id:           'STANDARD',
    name:         'Whale Alert Network Pro',
    tagline:      'Every tool, every section, fully unlocked.',
    priceMonthly: '15',
    priceAnnual:  '150',
    accentColor:  '#050505',
    badge:        'Most Popular',
    highlight:    true,
    lottie:       'Safe Box.json',
    features: [
      // Dashboard
      { text: 'Unlimited whale movements — all chains, no daily cap', highlight: true, section: 'dashboard' },
      { text: 'AI whale behavior predictions & accumulation heatmaps', highlight: true, section: 'dashboard' },
      { text: 'Custom thresholds, multi-chain & 12-month data archive', section: 'dashboard' },
      // Chat
      { text: 'VIP Whale Analytics Channel & analyst alpha signals', highlight: true, section: 'chat' },
      { text: 'AI market sentiment engine & unlimited chat history', section: 'chat' },
      // Portfolio
      { text: 'Multi-wallet tracking & whale copy-trading signals', highlight: true, section: 'portfolio' },
      { text: 'DeFi yield alerts, NFT valuation & tax export reports', section: 'portfolio' },
      // Community
      { text: 'Verified Whale badge & institutional forum access', highlight: true, section: 'community' },
      { text: 'DAO voting, monthly analyst Q&As & priority support', section: 'community' },
    ],
    buttonText: 'Unlock Full Access',
  },
];

export function getTierById(id: string): PricingTier | undefined {
  return PRICING_TIERS.find(t => t.id === id);
}

export function hasAccess(userTier: string, requiredTier: PricingTier['id']): boolean {
  const userRank    = TIER_RANK[userTier as PricingTier['id']] ?? 0;
  const requiredRank = TIER_RANK[requiredTier];
  return userRank >= requiredRank;
}
