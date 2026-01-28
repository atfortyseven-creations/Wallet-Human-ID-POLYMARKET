export interface Allocation {
    id: string;
    label: string;
    percentage: number;
    amount: number;
    color: string;
    description: string;
}

export interface VestingSchedule {
    cliffMonths: number;
    vestingMonths: number;
    tgeUnlock: number; // 0.0 to 1.0
}

export const TOKEN_METRICS = {
    ticker: 'HMND',
    name: 'HumanID Token',
    totalSupply: 100_000_000, // 100M
    tgeDate: '2025-Q4',
    stakingApy: 0.12, // 12% Base APY
};

export const ALLOCATIONS: Allocation[] = [
    {
        id: 'community',
        label: 'Community & Airdrop',
        percentage: 40,
        amount: 40_000_000,
        color: '#00f2ea', // Cyan
        description: 'Retroactive rewards, staking incentives, and ecosystem grants.'
    },
    {
        id: 'investors',
        label: 'Early Backers',
        percentage: 15,
        amount: 15_000_000,
        color: '#7000ff', // Purple
        description: 'Strategic partners assisting with liquidity and regulatory scaling.'
    },
    {
        id: 'team',
        label: 'Core Contributors',
        percentage: 15,
        amount: 15_000_000,
        color: '#ff0055', // Pink
        description: 'The architects building the Void Protocol.'
    },
    {
        id: 'treasury',
        label: 'DAO Treasury',
        percentage: 20,
        amount: 20_000_000,
        color: '#ffd700', // Gold
        description: 'Long-term reserve for acquisitions and black-swan events.'
    },
    {
        id: 'liquidity',
        label: 'Market Making',
        percentage: 10,
        amount: 10_000_000,
        color: '#ffffff', // White
        description: 'CEX/DEX Provisioning to ensure smooth trading.'
    }
];

export const VESTING: Record<string, VestingSchedule> = {
    community: { cliffMonths: 0, vestingMonths: 24, tgeUnlock: 0.10 },
    investors: { cliffMonths: 12, vestingMonths: 24, tgeUnlock: 0.0 },
    team: { cliffMonths: 12, vestingMonths: 36, tgeUnlock: 0.0 },
    treasury: { cliffMonths: 6, vestingMonths: 48, tgeUnlock: 0.05 },
    liquidity: { cliffMonths: 0, vestingMonths: 0, tgeUnlock: 1.0 },
};
