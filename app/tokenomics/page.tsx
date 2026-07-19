"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSystemAccount } from '@/hooks/useSystemAccount';
import { useAztecNative } from '@/context/AztecNativeContext';
import { toast } from 'sonner';
import Link from 'next/link';

const TIERS = [
  {
    key: 'BRONZE',
    name: 'Nodo Bronce',
    minStake: 500,
    lockDays: 7,
    dailyYield: '0.1%',
    color: '#cd7f32',
    gradient: 'from-amber-700 to-amber-500',
    border: 'border-amber-600/40',
    bg: 'bg-amber-950/30',
    features: ['Acceso a métricas base de la red', 'Yield diario en QDs', 'Badge Sovereign Node'],
  },
  {
    key: 'SILVER',
    name: 'Nodo Plata',
    minStake: 2000,
    lockDays: 14,
    dailyYield: '0.3%',
    color: '#C0C0C0',
    gradient: 'from-slate-400 to-slate-300',
    border: 'border-slate-400/40',
    bg: 'bg-slate-800/30',
    features: ['Métricas avanzadas de red Aztec', 'Participación en gobernanza ZK', 'Yield diario mayor'],
  },
  {
    key: 'GOLD',
    name: 'Nodo Oro',
    minStake: 5000,
    lockDays: 30,
    dailyYield: '0.7%',
    color: '#FFD700',
    gradient: 'from-yellow-500 to-yellow-300',
    border: 'border-yellow-500/40',
    bg: 'bg-yellow-950/30',
    features: ['Acceso completo Sovereign Intel', 'Máximo yield de la red', 'Prioridad en decisiones de protocolo'],
  },
];

const EARN_EVENTS = [
  { event: 'DAILY_LOGIN',       label: 'Login Diario',               amount: 10,  icon: '📅', description: 'Conecta tu wallet cada día', cooldown: '24h' },
  { event: 'AZTEC_TRANSFER',    label: 'Transferencia ZK Aztec',     amount: 50,  icon: '⚡', description: 'Realiza una transferencia privada', cooldown: '24h' },
  { event: 'IDENTITY_REGISTER', label: 'Registro de Identidad ZK',   amount: 200, icon: '🔐', description: 'Verifica tu identidad soberana', cooldown: 'Una vez' },
  { event: 'WALLET_CONNECT',    label: 'Conexión de Wallet',         amount: 25,  icon: '🔗', description: 'Primera conexión de wallet', cooldown: 'Una vez' },
];

function QDIcon({ size = 16 }: { size?: number }) {
  return (
    <span style={{ fontSize: size }} className="font-black text-yellow-400">⬡</span>
  );
}

export default function TokenomicsPage() {
  const { address, isConnected, isChecking } = useSystemAccount();
  const { balance } = useAztecNative();
  const [nodeStatus, setNodeStatus] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [stakeAmount, setStakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isClaimingYield, setIsClaimingYield] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'stake' | 'earn' | 'history'>('overview');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const fetchStatus = useCallback(async () => {
    if (!address || !isConnected) return;
    try {
      const res = await fetch(`/api/qds/balance?address=${encodeURIComponent(address)}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setNodeStatus(data.sovereignNode);
        setHistory(data.history || []);
      }
    } catch {}
  }, [address, isConnected]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const handleEarnEvent = async (event: string, label: string) => {
    if (!address) return;
    setIsClaiming(true);
    try {
      const res = await fetch('/api/qds/earn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ address, event }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`+${data.earned} QDs — ${label}`);
        fetchStatus();
      } else if (data.alreadyClaimed) {
        toast.info(data.message || 'Ya reclamado hoy.');
      } else {
        toast.error(data.error || 'Error al reclamar.');
      }
    } catch { toast.error('Error de red.'); }
    finally { setIsClaiming(false); }
  };

  const handleStake = async () => {
    if (!address || !stakeAmount) return;
    const amount = parseFloat(stakeAmount);
    if (isNaN(amount) || amount <= 0) return;
    setIsStaking(true);
    try {
      const res = await fetch('/api/qds/stake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ address, amount }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Nodo ${data.tier} activado. ${data.stakedAmount} QDs bloqueados.`);
        setStakeAmount('');
        fetchStatus();
      } else {
        toast.error(data.error || 'Error al activar nodo.');
      }
    } catch { toast.error('Error de red.'); }
    finally { setIsStaking(false); }
  };

  const handleUnstake = async () => {
    if (!address || !nodeStatus) return;
    setIsUnstaking(true);
    try {
      const res = await fetch('/api/qds/unstake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ address }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Nodo desactivado. ${data.returnedAmount} QDs devueltos.`);
        fetchStatus();
      } else {
        toast.error(data.error || 'No se puede desbloquear todavía.');
      }
    } catch { toast.error('Error de red.'); }
    finally { setIsUnstaking(false); }
  };

  const handleClaimYield = async () => {
    if (!address || !nodeStatus) return;
    setIsClaimingYield(true);
    try {
      const res = await fetch('/api/qds/unstake', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ address }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`+${data.yieldEarned} QDs de yield reclamados.`);
        fetchStatus();
      } else {
        toast.info(data.message || 'Nada que reclamar hoy.');
      }
    } catch { toast.error('Error de red.'); }
    finally { setIsClaimingYield(false); }
  };

  if (!mounted || isChecking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-yellow-400/50 text-xs font-mono tracking-widest animate-pulse">LOADING SOVEREIGN ECONOMY…</div>
      </div>
    );
  }

  const selectedTier = TIERS.find(t => parseFloat(stakeAmount) >= t.minStake)
    ? TIERS.filter(t => parseFloat(stakeAmount) >= t.minStake).at(-1)
    : null;

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: '"Inter", sans-serif' }}>
      {/* Header */}
      <div className="border-b border-white/5 bg-black/80 backdrop-blur sticky top-0 z-30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-white/30 hover:text-white/60 transition-colors text-xs">← Back</Link>
          <div className="w-px h-4 bg-white/10" />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-white/80">Sovereign Economy</span>
        </div>
        {isConnected && (
          <div className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-4 py-1.5">
            <QDIcon />
            <span className="text-sm font-black text-yellow-400">{typeof balance === 'number' ? balance.toFixed(2) : '0.00'}</span>
            <span className="text-xs text-yellow-400/60">QDs</span>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-4 py-1.5 mb-6 text-xs font-mono text-yellow-400/80 tracking-widest">
            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
            PROOF-OF-SOVEREIGNTY PROTOCOL
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight">
            Quantum<span className="text-yellow-400">Dust</span>
          </h1>
          <p className="text-white/40 text-lg max-w-2xl mx-auto leading-relaxed">
            El combustible criptográfico de la red Aztec soberana. Gana procesando la red, bloquea para operar un nodo, y accede a la capa de privacidad institucional.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {[
            { label: 'Tu Balance', value: isConnected ? `${typeof balance === 'number' ? balance.toFixed(2) : '0'} QDs` : '—' },
            { label: 'Estado Nodo', value: nodeStatus?.active ? nodeStatus.tier : 'Sin nodo' },
            { label: 'Yield Total', value: nodeStatus ? `${nodeStatus.totalYield?.toFixed(2)} QDs` : '—' },
            { label: 'Red', value: 'Aztec Testnet' },
          ].map(s => (
            <div key={s.label} className="bg-white/3 border border-white/5 rounded-xl p-4">
              <div className="text-xs text-white/30 mb-1 font-mono tracking-widest uppercase">{s.label}</div>
              <div className="text-lg font-black text-white">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/3 p-1 rounded-xl mb-8 border border-white/5">
          {(['overview', 'stake', 'earn', 'history'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-yellow-400 text-black'
                  : 'text-white/30 hover:text-white/60'
              }`}
            >
              {tab === 'overview' ? 'Protocolo' : tab === 'stake' ? 'Sovereign Node' : tab === 'earn' ? 'Ganar QDs' : 'Historial'}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  icon: '⚡',
                  title: 'Proof-of-Activity Mining',
                  desc: 'Gana QDs automáticamente al usar la red. Cada transferencia ZK, login diario o verificación de identidad acuñan QDs en tu balance.',
                  action: () => setActiveTab('earn'),
                  cta: 'Ganar QDs →',
                },
                {
                  icon: '🏛️',
                  title: 'Sovereign Node Staking',
                  desc: 'Bloquea QDs para operar un nodo soberano. Gana yield diario (0.1%–0.7%) mientras apoyas la descentralización de la red Aztec.',
                  action: () => setActiveTab('stake'),
                  cta: 'Activar Nodo →',
                },
                {
                  icon: '🔐',
                  title: 'Fee Abstraction (FPC)',
                  desc: 'Los QDs sirven como gas nativo de la red vía Fee Payment Contracts de Aztec. Cada operación paga 1 QD de fee de red automáticamente.',
                  action: () => {},
                  cta: 'Ver transferencias →',
                },
              ].map(c => (
                <div key={c.title} className="bg-white/3 border border-white/5 rounded-2xl p-6 hover:border-yellow-400/20 transition-all group">
                  <div className="text-3xl mb-4">{c.icon}</div>
                  <h3 className="text-sm font-black text-white mb-2">{c.title}</h3>
                  <p className="text-xs text-white/40 leading-relaxed mb-4">{c.desc}</p>
                  <button onClick={c.action} className="text-xs text-yellow-400/70 font-mono group-hover:text-yellow-400 transition-colors">{c.cta}</button>
                </div>
              ))}
            </div>

            {/* Tokenomics Flow */}
            <div className="bg-white/3 border border-white/5 rounded-2xl p-8">
              <h2 className="text-xs font-black uppercase tracking-widest text-white/30 mb-6">Flujo Económico</h2>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {['Actividad ZK\n(Transferir, verificar)', '→', 'Earn QDs\n(+10 a +200 QDs)', '→', 'Stake QD\n(Sovereign Node)', '→', 'Yield Diario\n(0.1%–0.7%)'].map((step, i) => (
                  <div key={i} className={`${step === '→' ? 'text-yellow-400/30 text-xl font-black' : 'flex-1 bg-black/30 border border-white/5 rounded-xl p-4 text-center'}`}>
                    {step !== '→' && (
                      <p className="text-xs text-white/60 font-mono whitespace-pre-line leading-relaxed">{step}</p>
                    )}
                    {step === '→' && step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Stake */}
        {activeTab === 'stake' && (
          <div className="space-y-6">
            {/* Active Node */}
            {nodeStatus?.active && (
              <div className={`border rounded-2xl p-6 ${
                nodeStatus.tier === 'GOLD' ? 'border-yellow-500/40 bg-yellow-950/20' :
                nodeStatus.tier === 'SILVER' ? 'border-slate-400/40 bg-slate-800/20' :
                'border-amber-600/40 bg-amber-950/20'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs text-white/30 font-mono tracking-widest mb-1">NODO ACTIVO</div>
                    <div className="text-2xl font-black text-white">{nodeStatus.tier} Sovereign Node</div>
                    <div className="text-sm text-white/50 mt-1">{nodeStatus.stakedAmount?.toFixed(2)} QDs bloqueados</div>
                  </div>
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-black/30 rounded-xl p-3">
                    <div className="text-xs text-white/30 mb-1">Unlock</div>
                    <div className="text-sm font-black text-white">{new Date(nodeStatus.unlockAt).toLocaleDateString()}</div>
                  </div>
                  <div className="bg-black/30 rounded-xl p-3">
                    <div className="text-xs text-white/30 mb-1">Yield Total</div>
                    <div className="text-sm font-black text-yellow-400">{nodeStatus.totalYield?.toFixed(4)} QDs</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleClaimYield}
                    disabled={isClaimingYield}
                    className="flex-1 py-2.5 text-xs font-black rounded-xl bg-yellow-400 text-black hover:bg-yellow-300 disabled:opacity-50 transition-all"
                  >
                    {isClaimingYield ? 'Reclamando…' : '⚡ Reclamar Yield Diario'}
                  </button>
                  {nodeStatus.canUnstake && (
                    <button
                      onClick={handleUnstake}
                      disabled={isUnstaking}
                      className="px-4 py-2.5 text-xs font-black rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 disabled:opacity-50 transition-all"
                    >
                      {isUnstaking ? '…' : 'Unstake'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Tier Cards */}
            {!nodeStatus?.active && (
              <>
                <div className="grid md:grid-cols-3 gap-4">
                  {TIERS.map(tier => (
                    <div
                      key={tier.key}
                      onClick={() => setStakeAmount(String(tier.minStake))}
                      className={`${tier.bg} ${tier.border} border rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all ${
                        parseFloat(stakeAmount) >= tier.minStake ? 'ring-1 ring-yellow-400/50' : ''
                      }`}
                    >
                      <div className={`text-xs font-black uppercase tracking-widest mb-3`} style={{ color: tier.color }}>{tier.name}</div>
                      <div className="text-3xl font-black text-white mb-1">{tier.minStake.toLocaleString()}</div>
                      <div className="text-xs text-white/30 mb-4">QDs mínimo · {tier.lockDays}d lock · {tier.dailyYield}/día</div>
                      <ul className="space-y-1">
                        {tier.features.map(f => (
                          <li key={f} className="text-xs text-white/50 flex items-start gap-1.5">
                            <span className="text-yellow-400/60 mt-0.5">›</span>{f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Stake Input */}
                <div className="bg-white/3 border border-white/5 rounded-2xl p-6">
                  <div className="text-xs font-black uppercase tracking-widest text-white/30 mb-4">Activar Sovereign Node</div>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={stakeAmount}
                      onChange={e => setStakeAmount(e.target.value)}
                      placeholder="Cantidad de QDs a bloquear…"
                      className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-yellow-400/40 transition-colors"
                    />
                    <button
                      onClick={handleStake}
                      disabled={isStaking || !isConnected || !stakeAmount || parseFloat(stakeAmount) < 500}
                      className="px-6 py-3 bg-yellow-400 text-black text-sm font-black rounded-xl hover:bg-yellow-300 disabled:opacity-30 transition-all"
                    >
                      {isStaking ? '…' : 'Activar'}
                    </button>
                  </div>
                  {selectedTier && (
                    <div className="mt-3 text-xs text-white/40 font-mono">
                      → Nodo {selectedTier.name} · {selectedTier.lockDays}d lock · {selectedTier.dailyYield} yield diario
                    </div>
                  )}
                  {!isConnected && <p className="mt-3 text-xs text-red-400/70">Conecta tu wallet para activar un nodo.</p>}
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab: Earn */}
        {activeTab === 'earn' && (
          <div className="space-y-4">
            <p className="text-xs text-white/30 font-mono mb-6">
              Completa acciones verificadas en la red Aztec para acumular QDs. Cada acción está protegida por ZK para evitar duplicados fraudulentos.
            </p>
            {EARN_EVENTS.map(ev => (
              <div key={ev.event} className="bg-white/3 border border-white/5 rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-yellow-400/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{ev.icon}</div>
                  <div>
                    <div className="text-sm font-black text-white">{ev.label}</div>
                    <div className="text-xs text-white/30 mt-0.5">{ev.description}</div>
                    <div className="text-xs text-white/20 font-mono mt-1">Cooldown: {ev.cooldown}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-lg font-black text-yellow-400">+{ev.amount}</div>
                    <div className="text-xs text-white/30">QDs</div>
                  </div>
                  <button
                    onClick={() => handleEarnEvent(ev.event, ev.label)}
                    disabled={isClaiming || !isConnected}
                    className="px-4 py-2 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-black rounded-xl hover:bg-yellow-400 hover:text-black disabled:opacity-30 transition-all"
                  >
                    Reclamar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: History */}
        {activeTab === 'history' && (
          <div className="space-y-2">
            {history.length === 0 ? (
              <div className="text-center py-20 text-white/20 text-xs font-mono">Sin historial de QDs todavía.</div>
            ) : history.map((tx: any, i: number) => (
              <div key={i} className="flex items-center justify-between bg-white/3 border border-white/5 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                    ['EARN', 'REWARD', 'UNSTAKE'].includes(tx.type) ? 'bg-green-400/10 text-green-400' :
                    tx.type === 'STAKE' ? 'bg-blue-400/10 text-blue-400' :
                    'bg-red-400/10 text-red-400'
                  }`}>{tx.type}</span>
                  <span className="text-xs text-white/40 truncate max-w-xs">{tx.description}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-black ${['EARN', 'REWARD', 'UNSTAKE'].includes(tx.type) ? 'text-green-400' : 'text-red-400'}`}>
                    {['EARN', 'REWARD', 'UNSTAKE'].includes(tx.type) ? '+' : '-'}{tx.amount} QDs
                  </span>
                  <span className="text-xs text-white/20">{new Date(tx.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
