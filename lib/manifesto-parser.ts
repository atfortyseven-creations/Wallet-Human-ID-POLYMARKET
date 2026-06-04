import fs from 'fs';
import path from 'path';

export interface ManifestoSection {
  id: string;
  title: string;
  body: string[];
}

/**
 * Fallback sections rendered when README.md is absent or has < 2 parseable sections.
 * This guarantees the /developer page always has content.
 */
const FALLBACK_SECTIONS: ManifestoSection[] = [
  {
    id: 'what-is-this-system',
    title: 'what is this system',
    body: [
      'whale alert network is a system, institutional-grade analytics platform engineered to detect, classify, and broadcast anomalous on-chain capital movements across all major evm-compatible networks in real time.',
      'it operates as a zero-latency telemetry layer positioned between raw blockchain mempool data and the decision-making analytics layer of professional market participants.',
      '[SUBTITLE]core design principle',
      'every data point surfaced by this system is derived directly from cryptographically verified on-chain events. no inference, no interpolation, no editorial distortion.',
    ]
  },
  {
    id: 'what-is-it-for',
    title: 'what is it for',
    body: [
      'the system is designed for institutional actors  system fund operators, quantitative researchers, protocol architects, and independent validators  who require ground-truth on-chain analytics without intermediary risk.',
      '[SUBTITLE]use cases',
      '[LIST_ITEM]real-time detection of whale-class transfer events exceeding configurable thresholds',
      '[LIST_ITEM]mempool surveillance for pending large-value transactions before block confirmation',
      '[LIST_ITEM]cross-chain capital flow mapping between ethereum, arbitrum, base, polygon, and solana',
      '[LIST_ITEM]defi liquidation cascade warnings with predictive scoring',
      '[LIST_ITEM]institutional wallet profiling through heuristic clustering',
    ]
  },
  {
    id: 'what-can-we-do-with-it',
    title: 'what can we do with it',
    body: [
      'operators of this system gain system observability of the entire on-chain capital ecosystem. from a single terminal, you can track the precise movement of billions in digital assets, receive sub-second alerts on anomalous behavior, and reconstruct the strategic posture of any major market participant.',
      '[SUBTITLE]active capabilities',
      '[LIST_ITEM]configure custom alert thresholds by asset, chain, or wallet category',
      '[LIST_ITEM]subscribe to institutional-grade telemetry feeds via sse or webhook',
      '[LIST_ITEM]explore the system vault  a cryptographically sealed archive of historical whale events',
      '[LIST_ITEM]access the entity graph to map wallet relationships and trace capital provenance',
      '[LIST_ITEM]deploy the Security Protocol station to verify on-chain claims without exposing position data',
      'the system is not a product. it is a protocol. it is designed to be operated by those who understand that asymmetric information is the last remaining structural edge in digital markets.',
    ]
  },
  {
    id: 'technical-architecture',
    title: 'technical architecture',
    body: [
      'the system is built on a next.js 15 server-side rendering engine with react 19 as the component layer. all real-time data streams are delivered via server-sent events (sse) endpoints that maintain persistent http connections to the client.',
      '[SUBTITLE]data layer',
      '[LIST_ITEM]postgresql via prisma for structured event archiving and ledger integrity',
      '[LIST_ITEM]redis via upstash for real-time caching and rate-limiting of api endpoints',
      '[LIST_ITEM]neo4j for graph-native entity relationship mapping',
      '[LIST_ITEM]wagmi + viem for type-safe, multi-chain rpc interaction',
      '[SUBTITLE]telemetry pipeline',
      'the primary data pipeline ingests raw transactions from multiple rpc providers simultaneously, applies a proprietary classification engine that scores each event for institutional significance, and routes high-confidence alerts to the notification infrastructure within 200ms of block confirmation.',
    ]
  },
  {
    id: 'access-and-systemty',
    title: 'access and systemty',
    body: [
      'access to the full terminal is gated by cryptographic wallet signature. no username. no password. no custodial intermediary. your private key is your identity, and your signature is your credential.',
      'the genesis ticket nft functions as a permanent, non-transferable access credential that grants the holder irrevocable access to the system tier of the platform, including all real-time feeds, the advanced entity graph, and historical ledger archives.',
      '[SUBTITLE]zero-trust access model',
      '[LIST_ITEM]single signature authentication via siwe (sign-in with ethereum)',
      '[LIST_ITEM]session tokens derived from threshold cryptography',
      '[LIST_ITEM]zk-proof generation for privacy-preserving identity verification',
      '[LIST_ITEM]session logs immutably archived on-chain for full accountability',
    ]
  },
];

export function parseReadmeToManifesto(filename: string = 'README.md'): ManifestoSection[] {
  let content = '';
  try {
    const readmePath = path.join(process.cwd(), filename);
    if (!fs.existsSync(readmePath)) {
      console.warn(`[MANIFESTO] ${filename} not found, using fallback content.`);
      return FALLBACK_SECTIONS;
    }
    content = fs.readFileSync(readmePath, 'utf8');
  } catch (error) {
    console.error(`[MANIFESTO] Failed to read ${filename}, using fallback:`, error);
    return FALLBACK_SECTIONS;
  }

  const lines = content.split('\n');
  const sections: ManifestoSection[] = [];
  let currentSection: ManifestoSection | null = null;
  let skipSection = false;
  let inCodeBlock = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // Toggle code block state  skip ALL lines inside code blocks
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    if (!line) continue;
    if (line.startsWith('---')) continue;
    if (line.startsWith('<div') || line.startsWith('</div') || line.startsWith('[![')) continue;
    if (line.startsWith('|')) continue; // Skip markdown tables

    // H1 heading  use as document title section
    if (line.startsWith('# ') && !line.startsWith('## ')) {
      if (currentSection) sections.push(currentSection);
      const title = line.replace(/^#\s+/, '').replace(/[*_`]/g, '').trim().toLowerCase();
      skipSection = false;
      currentSection = { id: 'overview', title, body: [] };
      continue;
    }

    // H2 headings  new section
    if (line.startsWith('## ')) {
      if (currentSection) sections.push(currentSection);
      const title = line.replace('## ', '').replace(/^\d+\.\d*\s*/, '').trim().toLowerCase();

      if (title === 'table of contents' || title === 'local development') {
        currentSection = null;
        skipSection = true;
        continue;
      }

      skipSection = false;
      currentSection = {
        id: title.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        title,
        body: []
      };
      continue;
    }

    if (skipSection || !currentSection) continue;

    // H3 subheadings
    if (line.startsWith('### ')) {
      const sub = line.replace('### ', '').replace(/^\d+\.\d+\s*/, '').trim().toLowerCase();
      currentSection.body.push(`[SUBTITLE]${sub}`);
      continue;
    }

    // List items
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const item = line.slice(2).trim().toLowerCase();
      currentSection.body.push(`[LIST_ITEM]${item}`);
      continue;
    }

    // Numbered list items
    if (/^\d+\.\s/.test(line)) {
      const item = line.replace(/^\d+\.\s/, '').trim().toLowerCase();
      currentSection.body.push(`[LIST_ITEM]${item}`);
      continue;
    }

    // Normal paragraph text  strip markdown formatting
    const cleanText = line
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/_(.+?)_/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
      .toLowerCase()
      .trim();

    if (cleanText) {
      currentSection.body.push(cleanText);
    }
  }

  if (currentSection) sections.push(currentSection);

  // If README parsed but yielded nothing useful, use fallback
  if (sections.length < 2) {
    console.warn('[MANIFESTO] README.md yielded < 2 sections, augmenting with fallback.');
    return sections.length === 0 ? FALLBACK_SECTIONS : [...sections, ...FALLBACK_SECTIONS.slice(1)];
  }

  return sections;
}

