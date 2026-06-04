'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useInView, useMotionValue, useSpring } from 'framer-motion';

// ─── Constants ───────────────────────────────────────────────────────────────

const TOTAL_SUPPLY = 21_000_000;

const ALLOCATIONS = [
  {
    id: 'mining',
    label: 'Community Mining',
    pct: 50,
    amount: 10_500_000,
    color: '#050505',
    textColor: '#ffffff',
    description:
      'Distributed to participants who contribute computational proof-of-humanity, staking, and protocol governance over a 10-year decay schedule modelled after Bitcoin\'s halving mechanism. Two halving events occur at years 4 and 8, reducing annual issuance and enforcing programmatic scarcity.',
  },
  {
    id: 'treasury',
    label: 'Ecosystem Treasury',
    pct: 25,
    amount: 5_250_000,
    color: '#6366f1',
    textColor: '#ffffff',
    description:
      'Governed by on-chain proposals. Funds grants, integrations, security audits, liquidity bootstrapping, and strategic partnerships ratified by token holders.',
  },
  {
    id: 'contributors',
    label: 'Core Contributors',
    pct: 15,
    amount: 3_150_000,
    color: '#10b981',
    textColor: '#ffffff',
    description:
      '12-month cliff, then 36-month linear vesting. Aligned with long-term protocol success. Subject to clawback provisions voted by governance.',
  },
  {
    id: 'liquidity',
    label: 'Initial Liquidity',
    pct: 10,
    amount: 2_100_000,
    color: '#f59e0b',
    textColor: '#000000',
    description:
      'Seeded across decentralised exchanges at protocol launch. Liquidity positions are protocol-owned, not removable without supermajority governance vote.',
  },
];

const LOCK_PERIODS = [
  { label: '30d',  days: 30,  apr: 8,  multiplier: 1.0 },
  { label: '90d',  days: 90,  apr: 14, multiplier: 1.5 },
  { label: '180d', days: 180, apr: 22, multiplier: 2.2 },
  { label: '1y',   days: 365, apr: 38, multiplier: 3.2 },
  { label: '2y',   days: 730, apr: 65, multiplier: 4.5 },
];

const HALVING_INTERVAL_MS = 4 * 365.25 * 24 * 60 * 60 * 1000; // 4 years in ms
// Genesis: 2024-01-01 00:00:00 UTC
const GENESIS_TIMESTAMP = new Date('2024-01-01T00:00:00Z').getTime();
const NEXT_HALVING_TIMESTAMP = GENESIS_TIMESTAMP + HALVING_INTERVAL_MS;

const INITIAL_PROPOSALS = [
  {
    id: 'QIP-031',
    title: 'Increase Treasury Diversification into Stable Assets',
    description:
      'Allocate 15% of the Ecosystem Treasury into protocol-approved stablecoins to reduce volatility exposure and extend operational runway by an estimated 18 months.',
    votesFor: 4_821_309,
    votesAgainst: 1_203_445,
    votesAbstain: 344_211,
    status: 'Active',
    deadlineHours: 71,
  },
  {
    id: 'QIP-032',
    title: 'Deploy Native Bridge to Ethereum Mainnet',
    description:
      'Fund and ratify a canonical cross-chain bridge connecting the Humanity Ledger shielded environment to Ethereum mainnet, enabling QDs transfers with ZK-validity proofs.',
    votesFor: 6_102_800,
    votesAgainst: 388_220,
    votesAbstain: 211_900,
    status: 'Active',
    deadlineHours: 119,
  },
  {
    id: 'QIP-030',
    title: 'Reduce Minimum Governance Proposal Threshold',
    description:
      'Lower the minimum QDs required to submit a governance proposal from 10,000 to 2,500, broadening participation and reducing plutocratic concentration of proposal rights.',
    votesFor: 7_340_000,
    votesAgainst: 2_100_000,
    votesAbstain: 560_000,
    status: 'Passed',
    deadlineHours: 0,
  },
  {
    id: 'QIP-029',
    title: 'Activate Burn Mechanism on Protocol Fees',
    description:
      'Redirect 20% of all protocol fees to a deflationary burn address, permanently reducing circulating supply with each transaction, creating sustained deflationary pressure.',
    votesFor: 2_010_000,
    votesAgainst: 5_820_000,
    votesAbstain: 430_000,
    status: 'Rejected',
    deadlineHours: 0,
  },
  {
    id: 'QIP-033',
    title: 'Whitelist Three New Proof-of-Humanity Oracles',
    description:
      'Add BrightID, Proof of Humanity v2, and Humanode as recognised biometric attestation providers, expanding the set of valid humanity proofs accepted by the mining contract.',
    votesFor: 3_900_000,
    votesAgainst: 700_000,
    votesAbstain: 200_000,
    status: 'Active',
    deadlineHours: 47,
  },
];

const UTILITY_CASES = [
  {
    title: 'Proof-of-Humanity Mining',
    body:
      'Submit verified biometric attestations to earn newly minted QDs. Each unique human earns a proportional share of the epoch emission, enforced by ZK proofs on-chain.',
  },
  {
    title: 'Governance Voting',
    body:
      'Lock QDs to receive veQDs — vote-escrowed tokens granting weighted governance rights. Longer locks yield higher multipliers up to 4.5x on governance power.',
  },
  {
    title: 'Protocol Fee Payment',
    body:
      'All cross-chain bridge transactions and shielded-pool interactions collect fees denominated in QDs, burned or redirected to the treasury based on governance parameters.',
  },
  {
    title: 'Staking Rewards',
    body:
      'Stake QDs to secure the protocol and earn a share of protocol revenue. APR scales with lock duration, incentivising long-term alignment over mercenary capital.',
  },
  {
    title: 'Ecosystem Grants',
    body:
      'Developers and communities can request QDs from the treasury via QIP proposals. Approved grants vest over milestones verified by a multisig committee.',
  },
  {
    title: 'Liquidity Incentives',
    body:
      'Liquidity providers on approved DEX pairs earn boosted rewards paid in QDs, with boost multipliers proportional to veQDs held, following the Curve/Convex model.',
  },
];

// ─── Utility helpers ──────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString('en-US');
}

function fmtCompact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toFixed(0);
}

function useCountdown(targetMs: number) {
  const [remaining, setRemaining] = useState(targetMs - Date.now());
  useEffect(() => {
    const id = setInterval(() => setRemaining(targetMs - Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetMs]);
  const total = Math.max(0, remaining);
  const days = Math.floor(total / 86_400_000);
  const hours = Math.floor((total % 86_400_000) / 3_600_000);
  const minutes = Math.floor((total % 3_600_000) / 60_000);
  const seconds = Math.floor((total % 60_000) / 1_000);
  return { days, hours, minutes, seconds, total };
}

// Build 10-year emission curve: starting emission = 1,050,000 QDs/year (10% of mined supply)
// Halves every 4 years over 10 years
function buildEmissionCurve(): { year: number; emission: number; cumulative: number }[] {
  const points: { year: number; emission: number; cumulative: number }[] = [];
  let emission = 1_050_000;
  let cumulative = 0;
  for (let y = 1; y <= 10; y++) {
    if (y === 5 || y === 9) emission = Math.floor(emission / 2);
    cumulative += emission;
    points.push({ year: y, emission, cumulative });
  }
  return points;
}

// ─── SVG Donut Chart ──────────────────────────────────────────────────────────

function DonutChart({
  allocations,
  activeId,
  onSelect,
}: {
  allocations: typeof ALLOCATIONS;
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const cx = 160;
  const cy = 160;
  const r = 110;
  const innerR = 62;
  const total = allocations.reduce((s, a) => s + a.pct, 0);

  let cumAngle = -90; // start at top

  const slices = allocations.map((a) => {
    const sweep = (a.pct / total) * 360;
    const startAngle = cumAngle;
    cumAngle += sweep;
    const endAngle = cumAngle;

    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startAngle));
    const y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(endAngle));
    const y2 = cy + r * Math.sin(toRad(endAngle));
    const ix1 = cx + innerR * Math.cos(toRad(startAngle));
    const iy1 = cy + innerR * Math.sin(toRad(startAngle));
    const ix2 = cx + innerR * Math.cos(toRad(endAngle));
    const iy2 = cy + innerR * Math.sin(toRad(endAngle));
    const large = sweep > 180 ? 1 : 0;

    const midAngle = startAngle + sweep / 2;
    const labelR = r + 22;
    const lx = cx + labelR * Math.cos(toRad(midAngle));
    const ly = cy + labelR * Math.sin(toRad(midAngle));

    const d = [
      `M ${x1} ${y1}`,
      `A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`,
      `L ${ix2} ${iy2}`,
      `A ${innerR} ${innerR} 0 ${large} 0 ${ix1} ${iy1}`,
      'Z',
    ].join(' ');

    return { ...a, d, lx, ly, midAngle, startAngle, endAngle };
  });

  return (
    <svg viewBox="0 0 320 320" className="w-full max-w-xs mx-auto select-none">
      <defs>
        {slices.map((s) => (
          <filter key={s.id + '_f'} id={`shadow_${s.id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor={s.color} floodOpacity="0.35" />
          </filter>
        ))}
      </defs>
      {slices.map((s) => {
        const isActive = activeId === s.id;
        const toRad = (deg: number) => (deg * Math.PI) / 180;
        const midAngle = s.startAngle + (s.endAngle - s.startAngle) / 2;
        const offsetX = isActive ? 8 * Math.cos(toRad(midAngle)) : 0;
        const offsetY = isActive ? 8 * Math.sin(toRad(midAngle)) : 0;

        return (
          <g
            key={s.id}
            onClick={() => onSelect(s.id)}
            className="cursor-pointer"
            style={{ transform: `translate(${offsetX}px, ${offsetY}px)`, transition: 'transform 0.25s ease' }}
            filter={isActive ? `url(#shadow_${s.id})` : undefined}
          >
            <path
              d={s.d}
              fill={s.color}
              opacity={activeId && !isActive ? 0.45 : 1}
              stroke="#fff"
              strokeWidth="2"
              style={{ transition: 'opacity 0.2s' }}
            />
          </g>
        );
      })}
      {/* Centre label */}
      <text x={cx} y={cy - 10} textAnchor="middle" fontSize="13" fill="#6b7280" fontFamily="monospace">
        TOTAL SUPPLY
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="15" fontWeight="800" fill="#050505" fontFamily="monospace">
        21,000,000
      </text>
      <text x={cx} y={cy + 32} textAnchor="middle" fontSize="11" fill="#6b7280" fontFamily="monospace">
        QDs
      </text>
    </svg>
  );
}

// ─── SVG Line Chart (Emission Schedule) ──────────────────────────────────────

function EmissionLineChart({ data }: { data: { year: number; emission: number; cumulative: number }[] }) {
  const W = 560;
  const H = 220;
  const padL = 64;
  const padR = 24;
  const padT = 20;
  const padB = 40;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const maxEmission = Math.max(...data.map((d) => d.emission));

  const xScale = (year: number) => padL + ((year - 1) / (data.length - 1)) * chartW;
  const yScale = (val: number) => padT + chartH - (val / maxEmission) * chartH;

  const emissionPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(d.year)} ${yScale(d.emission)}`)
    .join(' ');

  const cumulativeMax = Math.max(...data.map((d) => d.cumulative));
  const yCumScale = (val: number) => padT + chartH - (val / cumulativeMax) * chartH;

  const cumPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(d.year)} ${yCumScale(d.cumulative)}`)
    .join(' ');

  const areaPath =
    emissionPath +
    ` L ${xScale(data[data.length - 1].year)} ${padT + chartH} L ${xScale(1)} ${padT + chartH} Z`;

  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full min-w-[320px]"
        style={{ height: H }}
        onMouseLeave={() => setHoveredYear(null)}
      >
        <defs>
          <linearGradient id="emissionGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#050505" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#050505" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((frac) => {
          const y = padT + chartH * (1 - frac);
          return (
            <g key={frac}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#e5e7eb" strokeWidth="1" />
              <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="monospace">
                {fmtCompact(maxEmission * frac)}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill="url(#emissionGrad)" />

        {/* Emission line */}
        <path d={emissionPath} fill="none" stroke="#050505" strokeWidth="2.5" strokeLinejoin="round" />

        {/* Cumulative dashed line */}
        <path d={cumPath} fill="none" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="5,4" strokeLinejoin="round" />

        {/* Halving markers */}
        {[4, 8].map((yr) => {
          const x = xScale(yr);
          return (
            <g key={yr}>
              <line x1={x} y1={padT} x2={x} y2={padT + chartH} stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,3" />
              <text x={x + 3} y={padT + 10} fontSize="8" fill="#f59e0b" fontFamily="monospace">
                HALVING
              </text>
            </g>
          );
        })}

        {/* Data points & hover */}
        {data.map((d) => {
          const x = xScale(d.year);
          const y = yScale(d.emission);
          const isHov = hoveredYear === d.year;
          return (
            <g
              key={d.year}
              onMouseEnter={() => setHoveredYear(d.year)}
              className="cursor-crosshair"
            >
              <rect x={x - 16} y={padT} width={32} height={chartH} fill="transparent" />
              <circle cx={x} cy={y} r={isHov ? 5 : 3} fill="#050505" stroke="#fff" strokeWidth="1.5" />
              {isHov && (
                <>
                  <rect x={x - 50} y={y - 42} width={100} height={38} rx="4" fill="#050505" />
                  <text x={x} y={y - 26} textAnchor="middle" fontSize="9" fill="#9ca3af" fontFamily="monospace">
                    Year {d.year}
                  </text>
                  <text x={x} y={y - 13} textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff" fontFamily="monospace">
                    {fmtCompact(d.emission)} QDs
                  </text>
                </>
              )}
            </g>
          );
        })}

        {/* X axis labels */}
        {data.map((d) => (
          <text
            key={d.year}
            x={xScale(d.year)}
            y={padT + chartH + 16}
            textAnchor="middle"
            fontSize="9"
            fill="#9ca3af"
            fontFamily="monospace"
          >
            Y{d.year}
          </text>
        ))}

        {/* Legend */}
        <line x1={padL} y1={H - 4} x2={padL + 18} y2={H - 4} stroke="#050505" strokeWidth="2" />
        <text x={padL + 22} y={H - 1} fontSize="9" fill="#6b7280" fontFamily="monospace">
          Annual Emission
        </text>
        <line x1={padL + 100} y1={H - 4} x2={padL + 118} y2={H - 4} stroke="#6366f1" strokeWidth="1.5" strokeDasharray="5,4" />
        <text x={padL + 122} y={H - 1} fontSize="9" fill="#6b7280" fontFamily="monospace">
          Cumulative
        </text>
      </svg>
    </div>
  );
}

// ─── Countdown Block ─────────────────────────────────────────────────────────

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[56px]">
      <motion.span
        key={value}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-black tracking-tight text-[#050505] tabular-nums"
      >
        {String(value).padStart(2, '0')}
      </motion.span>
      <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest mt-0.5">{label}</span>
    </div>
  );
}

// ─── Voting Bar ──────────────────────────────────────────────────────────────

function VotingBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3 text-xs font-mono">
      <span className="w-16 text-gray-500 text-right shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>
      <span className="w-10 text-gray-700 font-semibold tabular-nums">{pct.toFixed(1)}%</span>
      <span className="w-16 text-gray-400 tabular-nums">{fmtCompact(count)}</span>
    </div>
  );
}

// ─── Proposal Card ───────────────────────────────────────────────────────────

function ProposalCard({
  proposal,
  onVote,
}: {
  proposal: (typeof INITIAL_PROPOSALS)[0] & { votesFor: number };
  onVote: (id: string) => void;
}) {
  const total = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
  const statusColor =
    proposal.status === 'Active'
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      : proposal.status === 'Passed'
      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
      : 'bg-red-50 text-red-700 border border-red-200';

  const hours = proposal.deadlineHours;
  const daysLeft = Math.floor(hours / 24);
  const hoursLeft = hours % 24;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-gray-200 rounded-xl p-5 bg-white hover:border-gray-300 transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <span className="text-[10px] font-mono text-gray-400 tracking-widest">{proposal.id}</span>
          <h3 className="text-sm font-bold text-[#050505] mt-0.5 leading-snug">{proposal.title}</h3>
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${statusColor}`}>
          {proposal.status}
        </span>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mb-4">{proposal.description}</p>
      <div className="space-y-2 mb-4">
        <VotingBar label="For" count={proposal.votesFor} total={total} color="#10b981" />
        <VotingBar label="Against" count={proposal.votesAgainst} total={total} color="#ef4444" />
        <VotingBar label="Abstain" count={proposal.votesAbstain} total={total} color="#d1d5db" />
      </div>
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono text-gray-400">
          {proposal.status === 'Active' ? (
            <>
              Closes in{' '}
              <span className="text-[#050505] font-semibold">
                {daysLeft > 0 ? `${daysLeft}d ` : ''}
                {hoursLeft}h
              </span>
            </>
          ) : (
            <span>Voting closed</span>
          )}
        </div>
        {proposal.status === 'Active' && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onVote(proposal.id)}
            className="text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg bg-[#050505] text-white hover:bg-gray-800 transition-colors"
          >
            Vote For
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Vesting Timeline ────────────────────────────────────────────────────────

function VestingTimeline() {
  const milestones = [
    { month: 0, label: 'Grant Date', note: 'Tokens locked, cliff begins' },
    { month: 12, label: '12-Month Cliff', note: '0 tokens released during this period' },
    { month: 18, label: '18 Months', note: '16.7% released (6mo vesting)' },
    { month: 24, label: '24 Months', note: '33.3% released (12mo vesting)' },
    { month: 30, label: '30 Months', note: '50% released (18mo vesting)' },
    { month: 36, label: '36 Months', note: '66.7% released' },
    { month: 42, label: '42 Months', note: '83.3% released' },
    { month: 48, label: '48 Months', note: '100% fully vested' },
  ];

  const totalMonths = 48;

  return (
    <div className="relative pt-4 pb-2">
      {/* Track */}
      <div className="absolute top-[28px] left-0 right-0 h-1 bg-gray-200 rounded" />
      {/* Cliff zone */}
      <div
        className="absolute top-[24px] h-[9px] bg-gray-300 rounded-l"
        style={{ left: 0, width: `${(12 / totalMonths) * 100}%` }}
      />
      {/* Vesting zone */}
      <div
        className="absolute top-[24px] h-[9px] bg-emerald-400 rounded-r opacity-60"
        style={{
          left: `${(12 / totalMonths) * 100}%`,
          width: `${((totalMonths - 12) / totalMonths) * 100}%`,
        }}
      />
      {/* Milestones */}
      <div className="flex justify-between relative">
        {milestones.map((m, i) => {
          const pct = (m.month / totalMonths) * 100;
          return (
            <div
              key={i}
              className="flex flex-col items-center"
              style={{ position: 'absolute', left: `${pct}%`, transform: 'translateX(-50%)' }}
            >
              <div
                className={`w-3 h-3 rounded-full border-2 border-white z-10 ${
                  m.month <= 12 ? 'bg-gray-400' : 'bg-emerald-500'
                }`}
              />
              <div className={`mt-1 text-center ${i % 2 === 0 ? 'mt-5' : 'mt-1'}`}>
                <div className="text-[9px] font-mono font-bold text-[#050505] whitespace-nowrap">{m.label}</div>
                <div className="text-[8px] text-gray-400 font-mono whitespace-nowrap hidden sm:block">{m.note}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ height: 80 }} />
      <div className="flex gap-4 mt-2 text-[10px] font-mono text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-2 rounded bg-gray-300" /> 12-month cliff
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-2 rounded bg-emerald-400 opacity-70" /> 36-month linear vesting
        </span>
      </div>
    </div>
  );
}

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedNumber({ value, duration = 1.2 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: duration * 1000, bounce: 0 });
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, value, motionValue]);

  useEffect(() => {
    springValue.on('change', (v) => {
      if (ref.current) ref.current.textContent = fmt(Math.round(v));
    });
  }, [springValue]);

  return <span ref={ref}>0</span>;
}

// ─── Section Wrapper ─────────────────────────────────────────────────────────

function Section({
  id,
  title,
  label,
  children,
}: {
  id?: string;
  title: string;
  label: string;
  children: React.ReactNode;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.section
      id={id}
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="mb-20"
    >
      <div className="mb-6">
        <span className="text-[10px] font-mono tracking-[0.2em] text-gray-400 uppercase">{label}</span>
        <h2 className="text-2xl font-black text-[#050505] mt-1 tracking-tight">{title}</h2>
        <div className="mt-2 w-10 h-0.5 bg-[#050505] rounded" />
      </div>
      {children}
    </motion.section>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function TokenomicsPage() {
  const countdown = useCountdown(NEXT_HALVING_TIMESTAMP);
  const halvingProgress =
    1 - countdown.total / HALVING_INTERVAL_MS;

  const [activeAllocation, setActiveAllocation] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState(1000);
  const [lockPeriodIdx, setLockPeriodIdx] = useState(2);
  const [proposals, setProposals] = useState(INITIAL_PROPOSALS);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  const emissionData = buildEmissionCurve();
  const activePeriod = LOCK_PERIODS[lockPeriodIdx];
  const projectedYield = (stakeAmount * activePeriod.apr) / 100;
  const projectedYieldPeriod = (projectedYield * activePeriod.days) / 365;

  const activeAllocationData = activeAllocation
    ? ALLOCATIONS.find((a) => a.id === activeAllocation)
    : null;

  const handleVote = useCallback(
    (id: string) => {
      if (votedIds.has(id)) return;
      setProposals((prev) =>
        prev.map((p) => (p.id === id ? { ...p, votesFor: p.votesFor + 1 } : p))
      );
      setVotedIds((prev) => new Set(prev).add(id));
    },
    [votedIds]
  );

  const currentEmissionRate = emissionData[0].emission;
  const dailyEmission = Math.floor(currentEmissionRate / 365);

  return (
    <div className="min-h-screen bg-white text-[#050505]">
      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-mono tracking-[0.25em] text-gray-400 uppercase">
                Humanity Ledger · Protocol Economics
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-600">Live</span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-[#050505] leading-none mb-4">
              QDs Token
              <br />
              <span className="text-gray-300">Dashboard</span>
            </h1>

            <p className="text-base text-gray-500 max-w-xl mb-10 leading-relaxed">
              The complete economic model governing issuance, distribution, vesting, and utility of QDs — the native
              asset of the Humanity Ledger shielded ecosystem.
            </p>

            {/* Key metrics row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-gray-200 border border-gray-200 rounded-xl overflow-hidden mb-12">
              {[
                { label: 'Total Supply', value: '21,000,000', sub: 'QDs · Hard Cap' },
                { label: 'Daily Emission', value: fmt(dailyEmission), sub: 'QDs / day · Year 1' },
                { label: 'Halving Epoch', value: '4 Years', sub: 'Next: ~2028' },
                { label: 'Staking APR (max)', value: '65%', sub: '2-year lock · veQDs' },
              ].map((m) => (
                <div key={m.label} className="bg-white px-5 py-5">
                  <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">{m.label}</div>
                  <div className="text-xl font-black text-[#050505] tabular-nums">{m.value}</div>
                  <div className="text-[10px] font-mono text-gray-400 mt-0.5">{m.sub}</div>
                </div>
              ))}
            </div>

            {/* Countdown */}
            <div className="inline-flex flex-col sm:flex-row items-start sm:items-center gap-6 border border-gray-200 rounded-xl px-6 py-5 bg-white">
              <div>
                <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">
                  Next Halving Event
                </div>
                <div className="flex items-center gap-3">
                  <CountdownUnit value={countdown.days} label="Days" />
                  <span className="text-2xl font-black text-gray-200 mt-[-8px]">:</span>
                  <CountdownUnit value={countdown.hours} label="Hours" />
                  <span className="text-2xl font-black text-gray-200 mt-[-8px]">:</span>
                  <CountdownUnit value={countdown.minutes} label="Min" />
                  <span className="text-2xl font-black text-gray-200 mt-[-8px]">:</span>
                  <CountdownUnit value={countdown.seconds} label="Sec" />
                </div>
              </div>
              <div className="sm:border-l border-gray-200 sm:pl-6 w-full sm:w-48">
                <div className="text-[10px] font-mono text-gray-400 mb-1.5">Epoch Progress</div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#050505] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${halvingProgress * 100}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                </div>
                <div className="text-[10px] font-mono text-gray-400 mt-1">
                  {(halvingProgress * 100).toFixed(2)}% complete
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── CONTENT ─────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 pt-16">

        {/* ── SUPPLY DISTRIBUTION ─────────────────────────────────────────── */}
        <Section id="distribution" label="01 · Token Allocation" title="Supply Distribution">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <DonutChart
                allocations={ALLOCATIONS}
                activeId={activeAllocation}
                onSelect={(id) =>
                  setActiveAllocation((prev) => (prev === id ? null : id))
                }
              />
              <p className="text-center text-[10px] font-mono text-gray-400 mt-2">
                Click a segment to inspect
              </p>
            </div>

            <div className="space-y-3">
              {ALLOCATIONS.map((a) => {
                const isActive = activeAllocation === a.id;
                return (
                  <motion.div
                    key={a.id}
                    layout
                    onClick={() =>
                      setActiveAllocation((prev) => (prev === a.id ? null : a.id))
                    }
                    className={`cursor-pointer border rounded-xl p-4 transition-colors ${
                      isActive
                        ? 'border-[#050505] bg-gray-50'
                        : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-sm shrink-0"
                        style={{ backgroundColor: a.color, border: '1px solid rgba(0,0,0,0.1)' }}
                      />
                      <div className="flex-1">
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm font-bold text-[#050505]">{a.label}</span>
                          <span className="text-xs font-black text-[#050505] tabular-nums">
                            {a.pct}%
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-gray-400 mt-0.5">
                          {fmt(a.amount)} QDs
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <p className="text-xs text-gray-500 mt-3 leading-relaxed border-t border-gray-200 pt-3">
                            {a.description}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </Section>

        {/* ── EMISSION SCHEDULE ────────────────────────────────────────────── */}
        <Section id="emission" label="02 · Issuance Model" title="Emission Schedule">
          <div className="border border-gray-200 rounded-xl p-6 bg-white">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {emissionData
                .filter((d) => [1, 4, 5, 9].includes(d.year))
                .map((d) => (
                  <div key={d.year} className="border border-gray-100 rounded-lg p-3">
                    <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">
                      Year {d.year}
                    </div>
                    <div className="text-lg font-black text-[#050505] tabular-nums">
                      {fmtCompact(d.emission)}
                    </div>
                    <div className="text-[10px] font-mono text-gray-400">QDs / year</div>
                    {[4, 8].includes(d.year) && (
                      <span className="mt-1 inline-block text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                        POST HALVING
                      </span>
                    )}
                  </div>
                ))}
            </div>
            <EmissionLineChart data={emissionData} />
            <p className="text-[10px] font-mono text-gray-400 mt-4 leading-relaxed">
              Annual emission starts at 1,050,000 QDs (10% of community-mined allocation). Halvings occur at
              years 4 and 8, mirroring Bitcoin's deflationary schedule. Yellow dashed markers indicate halving
              events. Indigo dashed line shows cumulative issued tokens.
            </p>
          </div>
        </Section>

        {/* ── STAKING CALCULATOR ──────────────────────────────────────────── */}
        <Section id="staking" label="03 · Staking Model" title="Staking Calculator">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="border border-gray-200 rounded-xl p-6 bg-white space-y-6">
              {/* Amount slider */}
              <div>
                <div className="flex items-baseline justify-between mb-3">
                  <label className="text-xs font-mono text-gray-500 uppercase tracking-widest">
                    Stake Amount
                  </label>
                  <span className="text-2xl font-black text-[#050505] tabular-nums">
                    {fmt(stakeAmount)} <span className="text-sm font-mono text-gray-400">QDs</span>
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10000}
                  step={50}
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(Number(e.target.value))}
                  className="w-full accent-[#050505]"
                />
                <div className="flex justify-between text-[10px] font-mono text-gray-300 mt-1">
                  <span>0</span>
                  <span>10,000 QDs</span>
                </div>
              </div>

              {/* Lock period */}
              <div>
                <label className="block text-xs font-mono text-gray-500 uppercase tracking-widest mb-3">
                  Lock Period
                </label>
                <div className="flex gap-2 flex-wrap">
                  {LOCK_PERIODS.map((p, i) => (
                    <button
                      key={p.label}
                      onClick={() => setLockPeriodIdx(i)}
                      className={`px-4 py-2 rounded-lg text-xs font-mono font-bold border transition-all ${
                        lockPeriodIdx === i
                          ? 'bg-[#050505] text-white border-[#050505]'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* APR display */}
              <div className="flex items-stretch gap-3">
                <div className="flex-1 border border-gray-100 rounded-xl p-4 bg-gray-50">
                  <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">APR</div>
                  <motion.div
                    key={activePeriod.apr}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl font-black text-[#050505] tabular-nums"
                  >
                    {activePeriod.apr}%
                  </motion.div>
                </div>
                <div className="flex-1 border border-gray-100 rounded-xl p-4 bg-gray-50">
                  <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">
                    Gov. Multiplier
                  </div>
                  <motion.div
                    key={activePeriod.multiplier}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl font-black text-[#050505] tabular-nums"
                  >
                    {activePeriod.multiplier}x
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Results panel */}
            <div className="border border-gray-200 rounded-xl p-6 bg-white space-y-4">
              <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">Projected Rewards</div>

              <div className="space-y-3">
                {[
                  {
                    label: 'Annual Yield',
                    value: projectedYield,
                    sub: 'at current APR',
                  },
                  {
                    label: `Yield over ${activePeriod.label}`,
                    value: projectedYieldPeriod,
                    sub: `${activePeriod.days} days at ${activePeriod.apr}% APR`,
                  },
                  {
                    label: 'Total at Maturity',
                    value: stakeAmount + projectedYieldPeriod,
                    sub: 'Principal + rewards',
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-baseline justify-between border-b border-gray-100 pb-3 last:border-0"
                  >
                    <div>
                      <div className="text-sm font-semibold text-[#050505]">{item.label}</div>
                      <div className="text-[10px] font-mono text-gray-400">{item.sub}</div>
                    </div>
                    <motion.div
                      key={item.value}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-right"
                    >
                      <div className="text-lg font-black text-[#050505] tabular-nums">
                        {fmt(Math.round(item.value))}
                      </div>
                      <div className="text-[10px] font-mono text-gray-400">QDs</div>
                    </motion.div>
                  </div>
                ))}
              </div>

              {/* veQDs Power bar */}
              <div className="pt-2">
                <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">
                  Voting Power (veQDs)
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-indigo-500 rounded-full"
                    animate={{
                      width: `${((activePeriod.multiplier - 1) / (4.5 - 1)) * 100}%`,
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-gray-400 mt-1">
                  <span>1x (30 days)</span>
                  <span>4.5x (2 years)</span>
                </div>
                <div className="mt-2 text-sm font-black text-indigo-600 tabular-nums">
                  {fmt(Math.round(stakeAmount * activePeriod.multiplier))} veQDs
                </div>
              </div>

              <p className="text-[10px] font-mono text-gray-400 pt-2 border-t border-gray-100 leading-relaxed">
                Calculations are estimates. Actual rewards depend on total protocol staked supply and governance
                parameters at time of unstaking. Early exit incurs a 50% penalty on accrued rewards.
              </p>
            </div>
          </div>
        </Section>

        {/* ── GOVERNANCE PROPOSALS ─────────────────────────────────────────── */}
        <Section id="governance" label="04 · On-Chain Governance" title="Active Proposals">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proposals.map((p) => (
              <ProposalCard
                key={p.id}
                proposal={p}
                onVote={handleVote}
              />
            ))}
          </div>
          <p className="text-[10px] font-mono text-gray-400 mt-4">
            Voting uses veQDs (vote-escrowed). Quorum: 10% of circulating supply. Passing threshold: simple majority
            for standard proposals, 66.7% supermajority for treasury and parameter changes. Proposals QIP-030 and
            QIP-029 are shown for historical reference.
          </p>
        </Section>

        {/* ── VESTING SCHEDULE ─────────────────────────────────────────────── */}
        <Section id="vesting" label="05 · Token Vesting" title="Vesting Schedule">
          <div className="border border-gray-200 rounded-xl p-6 bg-white">
            <div className="flex flex-wrap gap-4 mb-6">
              {[
                { label: 'Recipient', value: 'Core Contributors' },
                { label: 'Allocation', value: '3,150,000 QDs' },
                { label: 'Cliff', value: '12 months' },
                { label: 'Vesting Period', value: '36 months linear' },
                { label: 'Total Duration', value: '48 months' },
              ].map((m) => (
                <div key={m.label} className="border border-gray-100 rounded-lg px-4 py-3">
                  <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">{m.label}</div>
                  <div className="text-sm font-bold text-[#050505] mt-0.5">{m.value}</div>
                </div>
              ))}
            </div>
            <VestingTimeline />
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  label: 'Monthly release (post-cliff)',
                  value: fmt(Math.round(3_150_000 / 36)),
                  unit: 'QDs / month',
                },
                {
                  label: 'Governance veto power',
                  value: 'Active',
                  unit: 'Clawback via QIP',
                },
                {
                  label: 'Acceleration clause',
                  value: 'None',
                  unit: 'No change-of-control accel.',
                },
              ].map((item) => (
                <div key={item.label} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                  <div className="text-[10px] font-mono text-gray-400 mb-1">{item.label}</div>
                  <div className="text-base font-black text-[#050505]">{item.value}</div>
                  <div className="text-[10px] font-mono text-gray-400 mt-0.5">{item.unit}</div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── UTILITY MATRIX ───────────────────────────────────────────────── */}
        <Section id="utility" label="06 · Token Utility" title="Utility Matrix">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {UTILITY_CASES.map((u, i) => (
              <motion.div
                key={u.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                whileHover={{ y: -3 }}
                className="border border-gray-200 rounded-xl p-5 bg-white hover:border-gray-400 transition-colors cursor-default"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-mono text-gray-300">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="h-px flex-1 bg-gray-100" />
                </div>
                <h3 className="text-sm font-bold text-[#050505] mb-2">{u.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{u.body}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ── FOOTER NOTE ────────────────────────────────────────────────────── */}
        <div className="border-t border-gray-100 py-10 mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-[10px] font-mono text-gray-400">
            <div>
              <div className="font-bold text-gray-600 mb-1">Humanity Ledger</div>
              QDs is not a security. This dashboard is informational only. Protocol parameters are subject to
              change via on-chain governance.
            </div>
            <div>
              <div className="font-bold text-gray-600 mb-1">Smart Contract</div>
              Audited by independent security researchers. Source code is open and verifiable. Bug bounty
              programme active — critical vulnerabilities eligible for up to $500,000 USD.
            </div>
            <div>
              <div className="font-bold text-gray-600 mb-1">Data Freshness</div>
              Emission and vesting figures are deterministic and computed client-side from genesis parameters.
              Governance vote counts update optimistically.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
