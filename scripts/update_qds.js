const fs = require('fs');

let content = fs.readFileSync('./app/qds/page.tsx', 'utf-8');

// 1. Replace the SECTIONS array with a massive one
const newSections = `const SECTIONS = [
  {
    num: '01',
    title: 'What QDs is',
    paragraphs: [
      'QDs (Core Dots) is a digital asset designed to act as the foundational unit of economic exchange within the Whale Alert network. It is not a governance token, a reward coupon, or a speculative vehicle with hidden unlock schedules. It is a base layer of exchange: finite, minable, and enforced entirely by the deployed contract code.',
      'The name derives from the concept of core dots  the smallest indivisible unit of verifiable computational work. Just as physical matter cannot be reduced below the atomic scale, QDs cannot be created beyond its defined ceiling or subdivided beyond its defined precision. This physical analogy represents the strict mathematical boundaries established by the protocol layer.',
      'Every design decision for QDs was measured against one test: does this reduce complexity, or add it? Any structure that added complexity without adding a mathematical guarantee was removed. What remains is a token defined by absolute clarity. The codebase has been stripped of any redundant logic, administrative backdoors, or upgradeable proxy patterns that could introduce centralized risk.',
      'The full technical specification of QDs is publicly auditable from day one. There are no hidden parameters, no admin keys, and no emergency override functions. The rules encoded at genesis govern QDs until the final token is mined. Enterprise integrators can rely on this stability to build deterministic financial models and automated settlement infrastructure without the counterparty risk associated with human intervention.'
    ],
  },
  {
    num: '02',
    title: 'The 21,000,000 limit',
    paragraphs: [
      'The supply of QDs is capped at exactly twenty-one million tokens. This number is written into the genesis contract as an immutable constant. It cannot be changed by any vote, team decision, or on-chain governance action  because no such mechanism exists in the protocol. The absence of governance is a deliberate architectural choice to ensure maximum predictability.',
      'Scarcity is not a feature layered on top of QDs. It is the architecture. Every participant, from the first block to the last, can know in advance the total number of tokens that will ever exist. Uncertainty about future supply is removed by design, not by promise. This rigid supply ceiling allows market participants to price risk and allocate capital with mathematical certainty.',
      'Each token is divisible to eight decimal places, yielding two quadrillion one hundred trillion discrete units. This granularity is sufficient for all practical economic uses while preserving the mathematical weight of the twenty-one million ceiling. Micro-transactions, API paywalls, and high-frequency settlement channels can all operate efficiently using fractional QDs.',
      'Any system claiming to offer QDs in quantities exceeding twenty-one million is operating outside the canonical protocol. The only authoritative record is the on-chain state of the genesis-deployed contract. No exception to this rule exists. Nodes validating the network will automatically reject any block proposing a supply expansion, ensuring the network remains structurally sound.'
    ],
  },
  {
    num: '03',
    title: 'Mining: earned, not issued',
    paragraphs: [
      'QDs is distributed exclusively through mining. There are no pre-mines, no team allocations, no investor reserves, and no foundation treasury. From the first block, every token enters circulation through computational work performed by open, permissionless participants. This mechanism guarantees that the initial distribution of the asset is tied directly to energy expenditure and infrastructural commitment.',
      'The mining process follows a deterministic emission schedule. As more computational power joins the network, the difficulty of finding a valid block increases proportionally, keeping the rate of new token issuance stable and predictable regardless of participation levels. The difficulty adjustment algorithm operates independently of human oversight, recalculating target thresholds strictly based on recent block times.',
      'Block rewards halve at fixed intervals following a geometric decay schedule. Each halving reduces the new tokens issued per block by fifty percent, extending the mining timeline while preserving the overall supply ceiling. The final QDs will be issued through fractional issuance as the block reward approaches its lower bound, transitioning the network seamlessly from an inflationary bootstrapping phase to a pure fee-driven economic model.',
      'Anyone with compatible hardware and a network connection can begin mining immediately after mainnet launch. There is no whitelist, no minimum stake requirement, and no registration process. The protocol is permissionless at every level of participation, ensuring that the network topology remains decentralized and resistant to localized regulatory pressures.'
    ],
  },
  {
    num: '04',
    title: 'No team, no treasury',
    paragraphs: [
      'Zero percent of the QDs supply is allocated to the founding team, early investors, advisors, or any organizational entity. This is not a policy position subject to future amendment  it is a technical constraint baked into the genesis contract from which there is no administrative exit. The protocol fundamentally rejects the notion of privileged issuance.',
      'The absence of a team allocation eliminates the most common form of misalignment in token design: the disconnect between team incentives and participant incentives. Every QDs token that exists was earned through the same mining process available to all participants. The creators of the protocol must commit computing resources to the network in the exact same manner as the general public if they wish to acquire the asset.',
      'There is no treasury wallet with signing authority over accumulated funds. There is no multisig controlled by named individuals who could, under pressure or incentive, alter the distribution model. The contract is the only authority, and its logic is entirely deterministic and non-interactive regarding monetary policy.',
      'Operating costs for the Whale Alert network are funded separately from QDs supply. The protocol economics and the operational economics are structurally independent, so neither can compromise the other. This separation of concerns protects the monetary layer from corporate insolvency, strategic pivots, or operational mismanagement.'
    ],
  },
  {
    num: '05',
    title: 'The halving schedule',
    paragraphs: [
      'Block rewards in the QDs protocol decrease by fifty percent at regular intervals. This halving mechanism ensures that early miners receive proportionally more tokens for their initial network-bootstrapping work, while later participants still have meaningful earning potential from transaction fees and residual block rewards. The decay curve is mathematically rigid.',
      'The halving schedule is predictable in advance by any participant. Block heights at which halvings occur are defined in the genesis parameters and cannot be adjusted. This predictability allows participants to plan hardware investments and energy costs with a clear view of expected revenue trajectories over multi-year capital depreciation cycles.',
      'As the block reward decreases toward zero, transaction fees become the primary economic incentive for miners. The QDs fee market operates without a fee floor or ceiling imposed by the protocol  fees are determined by the competitive dynamics between transaction submitters and block producers. This transition is expected and modeled in the protocol architecture.',
      'The final token will be mined in a distant future defined by the geometric decay rate of the emission schedule. The protocol does not set an end date for mining  it sets a mathematical limit that the emission curve asymptotically approaches. Long after the final whole unit is mined, the network will continue to process fractional rewards and transaction fees.'
    ],
  },
  {
    num: '06',
    title: 'Immutable supply rule',
    paragraphs: [
      'The twenty-one million supply ceiling is enforced by the contract itself, not by the goodwill of any team or governance body. Attempting to mint tokens beyond this ceiling will cause the transaction to revert with a protocol-level error. No account has the authority to modify this rule, nor does any proxy pattern exist to bypass it.',
      "Immutability of the supply rule serves a specific function: it makes QDs useful as a unit of account in long-range planning. When the supply ceiling cannot be changed, participants can make calculations about QDs-denominated values that hold across time horizons longer than any single organization's commitment. This enables reliable discounting of future cash flows.",
      'The contract code governing QDs supply is open source and independently auditable. Any cryptographer, developer, or analyst can verify the constraint directly from the on-chain bytecode without relying on documentation, announcements, or team statements. Verification at the binary level supersedes all external guarantees.',
      'Forks of the QDs protocol that alter the supply ceiling are not QDs. A fork is a separate protocol with separate economics. The canonical QDs is the chain launched at genesis with the original parameters intact. Any deviation from the twenty-one million cap fundamentally alters the game-theoretic balance of the network and is therefore considered an entirely different asset.'
    ],
  },
  {
    num: '07',
    title: 'Integration with Whale Alert',
    paragraphs: [
      'QDs functions as the native economic layer of the Whale Alert network. Participants who contribute value to the network  through mining, data validation, or infrastructure provisioning  are compensated in QDs. Participants who consume network services pay in QDs. This creates a closed-loop economic system tied directly to network utility.',
      'The Whale Alert platform tracks on-chain capital flows across multiple blockchain networks. QDs provides the internal accounting unit that aligns the economic interests of data producers and data consumers within this system. It standardizes the cost of data queries across disparate underlying protocols and network states.',
      'The fixed supply of QDs creates a deflationary pressure as network usage grows. More participants consuming network services while the supply remains constant means each QDs unit represents a greater share of network economic activity over time. This dynamic rewards long-term liquidity providers and network validators.',
      'Integration between QDs and the broader Whale Alert ecosystem is documented in the technical specifications available in the developer section of this site. The integration is designed to function without custodial intermediaries  all settlement occurs on-chain via smart contracts that programmatically enforce data delivery upon payment.'
    ],
  },
  {
    num: '08',
    title: 'Technical specification',
    paragraphs: [
      'QDs is implemented as an ERC-20 compatible token on the Ethereum Virtual Machine. The contract inherits the standard interface to ensure compatibility with existing wallets, exchanges, and DeFi infrastructure without requiring custom integration work from third parties. This strategic decision prioritizes immediate interoperability over esoteric technical novelty.',
      'The contract includes a single additional function beyond the ERC-20 standard: the mine() function, which allows eligible participants to claim block rewards during the mining period. No other non-standard functions exist. The attack surface of the contract is minimal by design, reducing the vector footprint to an absolute minimum.',
      'Gas consumption for QDs transactions is comparable to any standard ERC-20 transfer. No exotic opcodes, delegatecall patterns, or proxy architectures are used. The contract is static  what is deployed at genesis is what runs for the lifetime of the token. Code is law, and the code is remarkably brief.',
      'Security audits of the QDs contract will be published before mainnet launch. Multiple independent audit firms will review the contract. All findings, including any that are remediated before launch, will be disclosed in full in the public audit documentation. Transparency regarding the security perimeter is non-negotiable.'
    ],
  },
  {
    num: '09',
    title: 'Participation and access',
    paragraphs: [
      'Mining QDs requires no permission, registration, or identity verification. Any device capable of performing the required computational work and maintaining a connection to the QDs network can participate in mining from the moment the genesis block is produced. The network is entirely agnostic to the identity or location of the participant.',
      'Hardware requirements for mining will be specified in the technical documentation released before mainnet launch. The protocol is designed to remain accessible to a broad range of hardware configurations for as long as technically feasible, consistent with the security requirements of the network. Extreme hardware centralization is mitigated by the specific algorithmic choices outlined in the whitepaper.',
      'Holding and transferring QDs requires only a standard Ethereum-compatible wallet. No special software, proprietary clients, or custodial accounts are required. Participants retain full self-custody of their tokens at all times, relying on their own key management security practices rather than third-party custodians.',
      'There are no geographic restrictions on participation enforced at the protocol level. Access to QDs mining and holding is determined by network connectivity and hardware capability, not by jurisdiction, nationality, or any externally administered access control. The protocol operates in a stateless, borderless execution environment.'
    ],
  },
  {
    num: '10',
    title: 'Before 2027',
    paragraphs: [
      'The QDs genesis block will be produced before December 31, 2026. This commitment is public and specific. The date is not contingent on market conditions, funding rounds, regulatory approvals, or any external variable within the control of the Whale Alert team. The countdown is deterministic.',
      'The period between now and mainnet launch is used for final contract auditing, infrastructure preparation, and public documentation of the protocol parameters. No tokens exist before the genesis block. There are no pre-launch sale events, no private rounds, and no initial coin offerings. The distribution starts at absolute zero.',
      'Participants can prepare for mining by reviewing the hardware requirements and protocol documentation as they are published. No deposit, reservation, or registration is required or accepted in advance of launch. The network will bootstrap organically based purely on participant interest and computational deployment.',
      'After the genesis block, the protocol operates autonomously. The Whale Alert team contributes to the network as participants, not as administrators. The network is maintained by its participants, secured by its miners, and governed by its code. Any future evolution of the protocol must occur through decentralized consensus, not executive mandate.'
    ],
  },
];`;

const oldSectionsRegex = /const SECTIONS = \[[\s\S]*?\];\n/;
content = content.replace(oldSectionsRegex, newSections + "\n");

// 2. Change bg-[#FAFAF8] to bg-white
content = content.replace(/bg-\[#FAFAF8\]/g, 'bg-white');

// 3. Make typography even cleaner and more monochromatic.
content = content.replace(/border-black\/\[0\.06\]/g, 'border-black/10');
content = content.replace(/bg-\[#FAFAF8\]/g, 'bg-white');
content = content.replace(/text-black\/40/g, 'text-black/50');
content = content.replace(/text-black\/30/g, 'text-black/40');

fs.writeFileSync('./app/qds/page.tsx', content);
console.log("Updated QDs page");
