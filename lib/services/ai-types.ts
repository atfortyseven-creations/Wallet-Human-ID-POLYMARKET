export interface ForensicSignal {
    type: 'positive' | 'negative' | 'neutral';
    title: string;
    description: string;
    reasoning: string;
}

export interface ForensicAnalysis {
    riskScore: number; // 0-100
    summary: string;
    signals: ForensicSignal[];
    isElite: boolean;
    label?: string; // e.g. "Whale", "Exchange", "Mixer-User"
}
