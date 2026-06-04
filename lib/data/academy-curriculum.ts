export const TOPIC_CATEGORIES = [
    "Blockchain Base-Layer Architecture",
    "Cryptographic Verification Systems",
    "DeFi Protocol Risk Management",
    "Institutional Custody & Security",
    "Layer 2 Economics & Scalability",
    "Market Microstructure & Order Flow",
    "Quantitative Financial Analysis"
];

const PRE_MATRIX = [
    "Foundations of",
    "Mechanisms in",
    "Architecture of",
    "Principles of",
    "Dynamics within",
    "Protocol Engineering for",
    "Advanced Implementations of",
    "Institutional Validation of",
    "Zero-Knowledge Scaling of",
    "Algorithmic Stability in"
];

const SUF_MATRIX = [
    "Consensus Protocols",
    "Asymmetric Cryptography",
    "Flash Loan Mitigation",
    "Multi-Sig Governance",
    "Rollup Sequencers",
    "Liquidity Pools",
    "High-Frequency Oracles",
    "Smart Contract Auditing",
    "Ethereum Virtual Machine",
    "Yield Optimization Strategies"
];

const EXPERT_VERBS = [
    "Architecting", "Deploying", "Securing", "Analyzing", "Auditing", "Optimizing", "Validating"
];

function generateCosmicTopics(count: number) {
    const topics = [];
    
    // We want exactly 70 per category
    const topicsPerCategory = Math.ceil(count / TOPIC_CATEGORIES.length);

    for (let c = 0; c < TOPIC_CATEGORIES.length; c++) {
        const catName = TOPIC_CATEGORIES[c];
        
        for (let i = 0; i < topicsPerCategory; i++) {
            const index = c * topicsPerCategory + i;
            if (index >= count) break;
            
            const level = i + 1; // 1 to 70
            
            // Generate semantic title
            let title = "";
            let desc = "";
            let content = "";
            
            if (level <= 10) {
                // Foundation (1-10)
                const pre = PRE_MATRIX[level % 3];
                const suf = SUF_MATRIX[(c + i) % SUF_MATRIX.length];
                title = `${catName} - ${pre} ${suf} (Level ${level})`;
                desc = `Core principles and entry-level metrics regarding ${catName.toLowerCase()} and its market implications.`;
                content = `Introduces foundational concepts of ${suf.toLowerCase()}. Trainees will learn the basic vectors and initial state required to process logic within ${catName}.`;
            } else if (level <= 30) {
                // Intermediate (11-30)
                const verb = EXPERT_VERBS[i % EXPERT_VERBS.length];
                const suf = SUF_MATRIX[(c + i) % SUF_MATRIX.length];
                title = `M${level}: ${verb} ${suf} in ${catName}`;
                desc = `Intermediate modeling of ${suf.toLowerCase()} applied directly to modern production environments.`;
                content = `Covers mid-tier architectural patterns. By evaluating ${catName}, participants understand how ${verb.toLowerCase()} translates into secure on-chain operations.`;
            } else if (level <= 50) {
                // Advanced (31-50)
                const pre = PRE_MATRIX[4 + (i % 3)]; // Dynamics, Protocol Engineering
                const verb = EXPERT_VERBS[i % EXPERT_VERBS.length];
                title = `L${level} [Advanced]: ${pre} ${verb} Vectors`;
                desc = `Complex operational models focusing on high-efficiency vectors and protocol-scale security.`;
                content = `Requires pre-requisite knowledge of layer mechanics. We dive into the depths of ${pre.toLowerCase()} using real-world exploit analysis and mitigation.`;
            } else {
                // Institutional Master (51-70)
                const pre = PRE_MATRIX[7 + (i % 3)]; // Institutional, Zero-Knowledge, Algorithmic
                const suf = SUF_MATRIX[(c + i) % SUF_MATRIX.length];
                title = `INS-${level}: ${pre} ${suf} (Mastery)`;
                desc = `Terminal-grade research and applied cryptographic science for institutional asset management.`;
                content = `The pinnacle of ${catName}. Students manipulate raw bytecodes and zero-knowledge proofs to achieve unprecedented scale in ${suf.toLowerCase()}.`;
            }

            topics.push({
                id: `mod-${catName.substring(0,3).toLowerCase()}-${level}`,
                title: title,
                category: catName,
                desc: desc,
                content: content,
                time: `${45 + (i * 2 % 30)} mins`,
                level: level
            });
        }
    }
    
    return topics;
}

// Generate EXACTLY 490 modules (7 domains x 70 modules)
export const ALL_MODULES = generateCosmicTopics(490);
