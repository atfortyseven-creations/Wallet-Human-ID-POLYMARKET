import { useState, useEffect } from 'react';
import { useAccount, useBalance, useEnsName } from 'wagmi';

export interface HumanScore {
    totalScore: number;
    rank: 'Novice' | 'Citizen' | 'Veteran' | 'Whale' | 'Titan';
    breakdown: {
        age: number;
        activity: number;
        blueChip: number;
        ens: number;
        identity: number; // Gitcoin/WorldID
    };
    isLoading: boolean;
}

export function useHumanScore() {
    const { address } = useAccount();
    const { data: ensName } = useEnsName({ address });
    const { data: balance } = useBalance({ address });

    const [scoreData, setScoreData] = useState<HumanScore>({
        totalScore: 0,
        rank: 'Novice',
        breakdown: { age: 0, activity: 0, blueChip: 0, ens: 0, identity: 0 },
        isLoading: true,
    });

    useEffect(() => {
        if (!address) {
            setScoreData(prev => ({ ...prev, isLoading: false }));
            return;
        }

        const calculateScore = async () => {
            // 1. Simulate Fetching History (Mock for now, replace with Covalent/Etherscan later)
            // In a real app, we would fetch tx count and first tx date here.
            const mockTxCount = 45; // Simulated
            const mockFirstTxDate = new Date('2022-05-20'); // Simulated ~2.5 years ago

            // 2. Scoring Logic

            // Age: +10 pts per year (Max 30)
            const now = new Date();
            const yearsActive = (now.getTime() - mockFirstTxDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
            const ageScore = Math.min(Math.floor(yearsActive * 10), 30);

            // Activity: +1 pt per 10 txs (Max 20)
            const activityScore = Math.min(Math.floor(mockTxCount / 10), 20);

            // Blue Chip: Hold ETH > $100 (Simulated check using balance)
            // Assuming 1 ETH ~ $3000, 0.033 ETH > $100
            const ethBalance = balance ? parseFloat(balance.formatted) : 0;
            const blueChipScore = ethBalance > 0.03 ? 20 : 0;

            // ENS Owner
            const ensScore = ensName ? 15 : 0;

            // Identity (Gitcoin/WorldID - Mock)
            // We assume if they are using this app they might have WorldID verified soon
            const identityScore = 15;

            const total = ageScore + activityScore + blueChipScore + ensScore + identityScore;

            // Rank Determination
            let rank: HumanScore['rank'] = 'Novice';
            if (total > 80) rank = 'Titan'; // Legendary
            else if (total > 60) rank = 'Whale';
            else if (total > 40) rank = 'Veteran';
            else if (total > 20) rank = 'Citizen';

            // Simulator Delay for Effect
            await new Promise(r => setTimeout(r, 1500));

            setScoreData({
                totalScore: total,
                rank,
                breakdown: {
                    age: ageScore,
                    activity: activityScore,
                    blueChip: blueChipScore,
                    ens: ensScore,
                    identity: identityScore
                },
                isLoading: false
            });
        };

        calculateScore();
    }, [address, balance, ensName]);

    return scoreData;
}
