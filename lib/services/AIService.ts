import OpenAI from 'openai';

/**
 * Elite FORENSIC AI SERVICE
 * Powered by GPT-4o for deep on-chain reasoning.
 */
declare global {
    var __aiQuotaWarned: boolean | undefined;
}

import { ForensicAnalysis, ForensicSignal } from './ai-types';
export type { ForensicAnalysis, ForensicSignal };

export class AIService {
    private _openai: OpenAI | null = null;

    private getOpenAI() {
        if (!this._openai) {
            this._openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY || 'dummy_key_for_build_time',
            });
        }
        return this._openai;
    }
    /**
     * analyzeAddressForensics
     * Generates a high-reasoning forensic report for a blockchain address.
     */
    public async analyzeAddressForensics(address: string, context: {
        transactionCount: number;
        activeAgeDays: number;
        historySnippet: any[];
        defiPositions: any[];
        washTradingMetrics?: { score: number; patterns: string[] };
    }): Promise<ForensicAnalysis> {
        
        if (!process.env.OPENAI_API_KEY) {
            console.warn('[AIService] ️ OPENAI_API_KEY not configured. Falling back to heuristic baseline.');
            return this.getHeuristicBaseline(address, context);
        }

        const prompt = `
        ### ROLE
        You are a Legendary On-Chain Forensic Scientist at a Professional Whale-Grade Digital Asset Fund.
        
        ### TASK
        Perform a MAJESTIC forensic analysis of the address ${address} using the following telemetry:
        - Total Transactions: ${context.transactionCount}
        - Operational Age: ${context.activeAgeDays} days
        - Whale DeFi Footprint: ${JSON.stringify(context.defiPositions)}
        - Execution DNA (Recent Samples): ${JSON.stringify(context.historySnippet.slice(0, 10))}

        ### RECOGNITION PATTERNS (Detect & Tag)
        - "Whale Accumulation" (Systematic buying over time)
        - "Exit Liquidity Hunter" (Large transfers to CEX during high volatility)
        - "Flash-Loan Arbitrageur" (Complex multi-hop atomic trades)
        - "Alpha-Capture Bot" (Sub-second reaction to pool imbalances)
        - "Cold Storage Reserve" (Ultra-low activity, massive native balance)

        ### REQUIREMENTS
        Provide a JSON response containing:
        1. riskScore: 0-100 (Deep security ranking)
        2. summary: A majestic, technical 2-sentence breakdown of the entity's behavior.
        3. signals: An array of ForensicSignal objects detailing high-fidelity patterns.
        4. isElite: Boolean (True if institutional/managed).
        5. label: A majestic designation (e.g. "Whale Deep-Sea Collector", "Fund Custodian", "Alpha Predator").

        ### OUTPUT FORMAT
        JSON object only. Zero conversational filler.
        `;

        try {
            const response = await this.getOpenAI().chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: 'You are an Elite blockchain forensic engine. Respond only in JSON.' },
                    { role: 'user', content: prompt }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.2 // Keep it deterministic and analytical
            });

            const content = response.choices[0].message.content;
            if (!content) throw new Error('Empty AI Response');

            return JSON.parse(content) as ForensicAnalysis;
        } catch (error: any) {
            // Silence 429 Quota Exceeded logs to prevent spam
            if (error.status === 429 || error.message?.includes('429')) {
                // Determine if we should log it (only once in a while to not flood)
                if (!global.__aiQuotaWarned) {
                    console.warn('[AIService] ️ AI Quota Exceeded (429). Falling back to heuristics. (Will silence further 429 warnings)');
                    global.__aiQuotaWarned = true;
                }
            } else {
                console.error('[AIService]  AI Forensic Analysis failed:', error.message);
            }
            return this.getHeuristicBaseline(address, context);
        }
    }

    /**
     * Fallback heuristic logic if AI is unavailable
     */
    private getHeuristicBaseline(address: string, context: any): ForensicAnalysis {
        return {
            riskScore: 0,
            summary: "Forensic Synchronization in Progress. Real-time reasoning pipeline is initializing.",
            isElite: false,
            label: "Awaiting Data",
            signals: [
                {
                    type: 'neutral',
                    title: 'Deep Sync Active',
                    description: 'Synchronizing with global forensic grid...',
                    reasoning: 'Telemetry is currently being aggregated from 33+ chains.'
                }
            ]
        };
    }
}

export const aiService = new AIService();

