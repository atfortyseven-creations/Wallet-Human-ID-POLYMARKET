"use client";

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/lib/store/ui-store';
import { useWalletStore } from '@/lib/store/wallet-store';
import { toast } from 'sonner';
import {
  X, Globe, Shield, EyeOff, FileText, Database, CreditCard,
  Activity, Bell, Moon, Sun, Monitor, Lock, Key, Fingerprint, AlertTriangle,
  Wifi, WifiOff, Zap, BarChart2, Layers, RefreshCw, Trash2, Download,
  Upload, Clock, Sliders, UserCheck, ShieldOff, BellOff, PlugZap, Cpu,
  Gauge, HardDrive, Network, Code2, ChevronDown, Check, Info, ArrowUpRight,
} from 'lucide-react';

// ─────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────
type Tab = 'general' | 'display' | 'security' | 'privacy' | 'network' | 'gas' | 'notifications' | 'portfolio' | 'advanced' | 'data' | 'about';

// ─────────────────────────────────────────────────
// Micro-components
// ─────────────────────────────────────────────────
function Toggle({ value, onChange, disabled }: { value: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative w-11 h-6 rounded-full flex items-center px-0.5 transition-colors shrink-0 ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
      } ${value ? 'bg-black' : 'bg-zinc-200'}`}
    >
      <motion.div
        animate={{ x: value ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="w-5 h-5 rounded-full bg-white shadow-md"
      />
    </button>
  );
}

function Select({ value, options, onChange }: { value: string; options: { label: string; value: string }[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const current = options.find(o => o.value === value);
  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-[#F2F2F7] hover:bg-zinc-200 text-black text-[12px] font-bold px-3 py-1.5 rounded-xl transition-colors"
      >
        {current?.label}
        <ChevronDown size={12} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            className="absolute right-0 top-full mt-1 bg-white rounded-2xl shadow-xl border border-black/5 py-1.5 z-50 min-w-[140px] overflow-hidden"
          >
            {options.map(o => (
              <button
                key={o.value}
                onClick={() => { onChange(o.value); setOpen(false); }}
                className="flex items-center justify-between w-full px-4 py-2 text-[12px] font-medium hover:bg-[#F2F2F7] text-black transition-colors"
              >
                {o.label}
                {o.value === value && <Check size={12} className="text-black" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-1 pt-3 pb-1.5">
      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400">{children}</span>
    </div>
  );
}

function SettingRow({
  icon: Icon, title, desc, value, toggle, onToggle, action, actionLabel = 'Manage',
  danger = false, disabled = false, badge, children,
}: {
  icon: any; title: string; desc?: string; value?: string; toggle?: boolean;
  onToggle?: () => void; action?: () => void; actionLabel?: string;
  danger?: boolean; disabled?: boolean; badge?: string; children?: React.ReactNode;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 p-3.5 bg-white rounded-2xl border transition-all ${
      disabled ? 'opacity-40' : 'border-black/[0.05] hover:border-black/[0.12]'
    }`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${danger ? 'bg-red-50 text-red-500' : 'bg-[#F2F2F7] text-black'}`}>
          <Icon size={16} />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-[13px] font-black leading-tight ${danger ? 'text-red-500' : 'text-black'}`}>{title}</span>
            {badge && (
              <span className="text-[9px] font-black uppercase tracking-widest bg-black text-white px-1.5 py-0.5 rounded-full">{badge}</span>
            )}
          </div>
          {desc && <span className="text-[11px] text-zinc-500 font-medium mt-0.5 truncate">{desc}</span>}
          {children}
        </div>
      </div>
      {value && !action && toggle === undefined && (
        <span className="text-[12px] font-bold text-black bg-[#F2F2F7] px-2.5 py-1 rounded-lg shrink-0">{value}</span>
      )}
      {toggle !== undefined && onToggle && <Toggle value={toggle} onChange={onToggle} disabled={disabled} />}
      {action && (
        <button
          onClick={action}
          className={`text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-xl transition-colors shrink-0 ${
            danger ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-[#F2F2F7] text-black hover:bg-zinc-200'
          }`}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────
// Tab Config
// ─────────────────────────────────────────────────
const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'general',       label: 'General',       icon: Sliders },
  { id: 'display',       label: 'Display',        icon: Monitor },
  { id: 'security',      label: 'Security',       icon: Shield },
  { id: 'privacy',       label: 'Privacy',        icon: EyeOff },
  { id: 'network',       label: 'Network & RPC',  icon: Network },
  { id: 'gas',           label: 'Gas & Fees',     icon: Gauge },
  { id: 'notifications', label: 'Notifications',  icon: Bell },
  { id: 'portfolio',     label: 'Portfolio',      icon: BarChart2 },
  { id: 'advanced',      label: 'Advanced',       icon: Code2 },
  { id: 'data',          label: 'Data & Export',  icon: HardDrive },
  { id: 'about',         label: 'About',          icon: Info },
];

// ─────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────
export function SettingsView({ onClose }: { onClose: () => void }) {
  const { theme, setTheme, language, setLanguage, soundsEnabled, setSoundsEnabled, ghostMode, setGhostMode, privacyLevel, setPrivacyLevel, isStealthMode, toggleStealthMode } = useUIStore();
  const { address, activeNetwork } = useWalletStore();
  const [activeTab, setActiveTab] = useState<Tab>('general');

  // General
  const [currency, setCurrency] = useState('EUR');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [startPage, setStartPage] = useState('portfolio');
  const [compactMode, setCompactMode] = useState(false);

  // Display
  const [chartInterval, setChartInterval] = useState('7d');
  const [priceChange, setPriceChange] = useState('24h');
  const [showLogos, setShowLogos] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [showNFTs, setShowNFTs] = useState(true);
  const [hideZeroBalances, setHideZeroBalances] = useState(false);

  // Security
  const [autoLock, setAutoLock] = useState('5min');
  const [biometric, setBiometric] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [signatureConfirm, setSignatureConfirm] = useState(true);
  const [phishingDetection, setPhishingDetection] = useState(true);
  const [simulateTx, setSimulateTx] = useState(true);
  const [requirePasswordSwap, setRequirePasswordSwap] = useState(true);
  const [lockOnBackground, setLockOnBackground] = useState(true);

  // Privacy
  const [hideBalances, setHideBalances] = useState(isStealthMode);
  const [incognitoMode, setIncognitoMode] = useState(ghostMode);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [blockScoutMode, setBlockScoutMode] = useState(false);
  const [ipfsGateway, setIpfsGateway] = useState('cloudflare');

  // Network
  const [rpcProvider, setRpcProvider] = useState('alchemy');
  const [testnets, setTestnets] = useState(false);
  const [autoSwitchNetwork, setAutoSwitchNetwork] = useState(true);
  const [wssEnabled, setWssEnabled] = useState(true);
  const [connectionTimeout, setConnectionTimeout] = useState('30s');
  const [retryPolicy, setRetryPolicy] = useState('3x');

  // Gas
  const [gasPreset, setGasPreset] = useState('standard');
  const [slippage, setSlippage] = useState('0.5');
  const [deadlineMinutes, setDeadlineMinutes] = useState('20');
  const [mevProtection, setMevProtection] = useState(true);
  const [maxPriorityFee, setMaxPriorityFee] = useState('2');
  const [gasLimitBuffer, setGasLimitBuffer] = useState('1.2x');

  // Notifications
  const [notifIncoming, setNotifIncoming] = useState(true);
  const [notifOutgoing, setNotifOutgoing] = useState(true);
  const [notifPriceAlert, setNotifPriceAlert] = useState(false);
  const [notifDeFiYield, setNotifDeFiYield] = useState(true);
  const [notifSecurityAlert, setNotifSecurityAlert] = useState(true);
  const [notifNFT, setNotifNFT] = useState(false);
  const [notifNewsletter, setNotifNewsletter] = useState(false);
  const [notifBridge, setNotifBridge] = useState(true);

  // Portfolio
  const [tokenSort, setTokenSort] = useState('value_desc');
  const [groupByNetwork, setGroupByNetwork] = useState(true);
  const [showDeFiPositions, setShowDeFiPositions] = useState(true);
  const [showStaking, setShowStaking] = useState(true);
  const [showSpamTokens, setShowSpamTokens] = useState(false);
  const [portfolioRefresh, setPortfolioRefresh] = useState('30s');
  const [showPortfolioChart, setShowPortfolioChart] = useState(true);
  const [showPnL, setShowPnL] = useState(true);
  const [showGasTracker, setShowGasTracker] = useState(true);

  // Advanced
  const [developerMode, setDeveloperMode] = useState(false);
  const [hexData, setHexData] = useState(false);
  const [customNonce, setCustomNonce] = useState(false);
  const [expertMode, setExpertMode] = useState(false);
  const [debugLogs, setDebugLogs] = useState(false);
  const [wasmProving, setWasmProving] = useState(true);

  // ── Handlers ────────────────────────────────
  const handleHideBalances = useCallback(() => {
    setHideBalances(v => !v);
    toggleStealthMode();
  }, [toggleStealthMode]);

  const handleIncognito = useCallback(() => {
    const next = !incognitoMode;
    setIncognitoMode(next);
    setGhostMode(next);
  }, [incognitoMode, setGhostMode]);

  const handleClearCache = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ledger-ui-storage');
      toast.success('Local cache cleared. Reloading...');
      setTimeout(() => window.location.reload(), 2000);
    }
  }, []);

  const handleRevokeAllSessions = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      toast.success('All sessions revoked. Redirecting...');
      setTimeout(() => window.location.replace('/connect'), 1500);
    }
  }, []);

  const handleLockWallet = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      toast.info('Wallet locked.');
      setTimeout(() => window.location.replace('/connect'), 1500);
    }
  }, []);

  const handleExpertMode = useCallback(() => {
    if (!expertMode) toast.warning('Expert Mode disables safety confirmations.', { duration: 4000 });
    setExpertMode(v => !v);
  }, [expertMode]);

  // ── Tab Panels ──────────────────────────────
  function renderGeneral() {
    return (
      <div className="flex flex-col gap-1.5">
        <SectionLabel>Preferences</SectionLabel>
        <SettingRow icon={CreditCard} title="Base Currency" desc="Fiat currency for portfolio valuation.">
          <div className="mt-1"><Select value={currency} onChange={setCurrency} options={[
            { label: 'EUR (€)', value: 'EUR' },{ label: 'USD ($)', value: 'USD' },
            { label: 'GBP (£)', value: 'GBP' },{ label: 'RON (lei)', value: 'RON' },
            { label: 'CHF', value: 'CHF' },{ label: 'JPY (¥)', value: 'JPY' },
          ]} /></div>
        </SettingRow>
        <SettingRow icon={Globe} title="Language" desc="Application display language.">
          <div className="mt-1"><Select value={language} onChange={(v: any) => setLanguage(v)} options={[
            { label: 'English', value: 'en' },{ label: 'Español', value: 'es' },
          ]} /></div>
        </SettingRow>
        <SettingRow icon={Clock} title="Date Format" desc="How dates are displayed throughout the app.">
          <div className="mt-1"><Select value={dateFormat} onChange={setDateFormat} options={[
            { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
            { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
            { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
          ]} /></div>
        </SettingRow>
        <SectionLabel>Startup</SectionLabel>
        <SettingRow icon={Layers} title="Default Page" desc="The page shown after authentication.">
          <div className="mt-1"><Select value={startPage} onChange={setStartPage} options={[
            { label: 'Portfolio', value: 'portfolio' },{ label: 'Ledger Chat', value: 'chat' },
            { label: 'News Feed', value: 'news' },{ label: 'DeFi Hub', value: 'defi' },
          ]} /></div>
        </SettingRow>
        <SettingRow icon={Sliders} title="Compact Mode" desc="Denser layout for more data density." toggle={compactMode} onToggle={() => setCompactMode(v => !v)} />
        <SettingRow icon={Activity} title="Sound Effects" desc="Auditory feedback for completed transactions." toggle={soundsEnabled} onToggle={() => setSoundsEnabled(!soundsEnabled)} />
      </div>
    );
  }

  function renderDisplay() {
    return (
      <div className="flex flex-col gap-1.5">
        <SectionLabel>Theme</SectionLabel>
        <div className="grid grid-cols-3 gap-2 mb-1">
          {([{ label: 'Light', value: 'light', icon: Sun }, { label: 'Dark', value: 'dark', icon: Moon }, { label: 'System', value: 'system', icon: Monitor }] as any[]).map(({ label, value, icon: Icon }) => (
            <button key={value} onClick={() => setTheme(value)}
              className={`flex flex-col items-center gap-2 py-3 rounded-2xl border transition-all ${theme === value ? 'bg-black text-white border-black' : 'bg-white text-zinc-600 border-black/10 hover:border-black/20'}`}>
              <Icon size={18} />
              <span className="text-[11px] font-black uppercase tracking-wider">{label}</span>
            </button>
          ))}
        </div>
        <SectionLabel>Charts & Prices</SectionLabel>
        <SettingRow icon={BarChart2} title="Chart Interval" desc="Default price chart time range.">
          <div className="mt-1"><Select value={chartInterval} onChange={setChartInterval} options={[
            { label: '24H', value: '24h' },{ label: '7D', value: '7d' },{ label: '30D', value: '30d' },{ label: '1Y', value: '1y' },
          ]} /></div>
        </SettingRow>
        <SettingRow icon={Activity} title="Price Change Basis" desc="Time window for % change display.">
          <div className="mt-1"><Select value={priceChange} onChange={setPriceChange} options={[
            { label: '1H', value: '1h' },{ label: '24H', value: '24h' },{ label: '7D', value: '7d' },
          ]} /></div>
        </SettingRow>
        <SectionLabel>Assets</SectionLabel>
        <SettingRow icon={Layers} title="Show Token Logos" desc="Display asset icons next to token names." toggle={showLogos} onToggle={() => setShowLogos(v => !v)} />
        <SettingRow icon={Monitor} title="Animations" desc="Enable smooth transition animations." toggle={animationsEnabled} onToggle={() => setAnimationsEnabled(v => !v)} />
        <SettingRow icon={Layers} title="Show NFT Gallery" desc="Display your NFT collection in portfolio." toggle={showNFTs} onToggle={() => setShowNFTs(v => !v)} />
        <SettingRow icon={EyeOff} title="Hide Zero Balances" desc="Don't show tokens with 0.00 balance." toggle={hideZeroBalances} onToggle={() => setHideZeroBalances(v => !v)} />
      </div>
    );
  }

  function renderSecurity() {
    return (
      <div className="flex flex-col gap-1.5">
        <SectionLabel>Authentication</SectionLabel>
        <SettingRow icon={Clock} title="Auto-Lock Timer" desc="Automatically lock wallet after inactivity.">
          <div className="mt-1"><Select value={autoLock} onChange={setAutoLock} options={[
            { label: 'Never', value: 'never' },{ label: '1 Minute', value: '1min' },
            { label: '5 Minutes', value: '5min' },{ label: '15 Minutes', value: '15min' },{ label: '1 Hour', value: '1h' },
          ]} /></div>
        </SettingRow>
        <SettingRow icon={Fingerprint} title="Biometric Unlock" desc="Use Face ID / fingerprint to unlock." toggle={biometric} onToggle={() => setBiometric(v => !v)} badge="Native" />
        <SettingRow icon={Key} title="Two-Factor Authentication" desc="Require TOTP code for critical actions." toggle={twoFA} onToggle={() => setTwoFA(v => !v)} />
        <SettingRow icon={Lock} title="Lock on Background" desc="Lock wallet when app is backgrounded." toggle={lockOnBackground} onToggle={() => setLockOnBackground(v => !v)} />
        <SectionLabel>Transaction Safety</SectionLabel>
        <SettingRow icon={UserCheck} title="Signature Confirmation" desc="Always preview before signing." toggle={signatureConfirm} onToggle={() => setSignatureConfirm(v => !v)} />
        <SettingRow icon={AlertTriangle} title="Phishing Detection" desc="Warn about suspicious contract interactions." toggle={phishingDetection} onToggle={() => setPhishingDetection(v => !v)} />
        <SettingRow icon={Activity} title="Simulate Transactions" desc="Preview token flows before sending." toggle={simulateTx} onToggle={() => setSimulateTx(v => !v)} badge="Pro" />
        <SettingRow icon={Lock} title="Password for Swaps" desc="Require vault password before every swap." toggle={requirePasswordSwap} onToggle={() => setRequirePasswordSwap(v => !v)} />
        <SectionLabel>Session</SectionLabel>
        <SettingRow icon={Lock} title="Lock Wallet Now" desc="Immediately end the current session." action={handleLockWallet} actionLabel="Lock Now" />
        <SettingRow icon={ShieldOff} title="Revoke All Sessions" desc="Sign out all devices simultaneously." action={handleRevokeAllSessions} actionLabel="Revoke All" danger />
      </div>
    );
  }

  function renderPrivacy() {
    return (
      <div className="flex flex-col gap-1.5">
        <SectionLabel>Display Privacy</SectionLabel>
        <SettingRow icon={EyeOff} title="Hide Balances" desc="Mask all portfolio values from screen." toggle={hideBalances} onToggle={handleHideBalances} />
        <SettingRow icon={UserCheck} title="Incognito Mode" desc="Stop broadcasting your address in DApp interactions." toggle={incognitoMode} onToggle={handleIncognito} />
        <SectionLabel>Data Collection</SectionLabel>
        <SettingRow icon={BarChart2} title="Analytics Consent" desc="Share anonymised crash reports." toggle={analyticsConsent} onToggle={() => setAnalyticsConsent(v => !v)} />
        <SectionLabel>On-Chain Privacy</SectionLabel>
        <SettingRow icon={Shield} title="Privacy Level" desc="Controls Aztec ZK shielding aggressiveness.">
          <div className="mt-1"><Select value={privacyLevel} onChange={(v: any) => setPrivacyLevel(v)} options={[
            { label: 'Standard', value: 'standard' },{ label: 'Strict', value: 'strict' },
          ]} /></div>
        </SettingRow>
        <SettingRow icon={Globe} title="Block Explorer Mode" desc="Privacy-respecting explorer preference." toggle={blockScoutMode} onToggle={() => setBlockScoutMode(v => !v)} value={blockScoutMode ? 'Blockscout' : 'Etherscan'} />
        <SettingRow icon={Database} title="IPFS Gateway" desc="Resolve decentralized content via:">
          <div className="mt-1"><Select value={ipfsGateway} onChange={setIpfsGateway} options={[
            { label: 'Cloudflare', value: 'cloudflare' },{ label: 'Protocol Labs', value: 'protocol-labs' },{ label: 'Pinata', value: 'pinata' },
          ]} /></div>
        </SettingRow>
      </div>
    );
  }

  function renderNetwork() {
    return (
      <div className="flex flex-col gap-1.5">
        <SectionLabel>RPC Configuration</SectionLabel>
        <SettingRow icon={PlugZap} title="RPC Provider" desc="Primary blockchain node provider.">
          <div className="mt-1"><Select value={rpcProvider} onChange={setRpcProvider} options={[
            { label: 'Alchemy (Auto)', value: 'alchemy' },{ label: 'Infura', value: 'infura' },
            { label: 'GetBlock', value: 'getblock' },{ label: 'Public Nodes', value: 'public' },
          ]} /></div>
        </SettingRow>
        <SettingRow icon={Wifi} title="WebSocket Sync" desc="Real-time balance streaming via WSS." toggle={wssEnabled} onToggle={() => setWssEnabled(v => !v)} />
        <SettingRow icon={Clock} title="Connection Timeout" desc="Max wait time before RPC fallback.">
          <div className="mt-1"><Select value={connectionTimeout} onChange={setConnectionTimeout} options={[
            { label: '10s', value: '10s' },{ label: '30s', value: '30s' },{ label: '60s', value: '60s' },
          ]} /></div>
        </SettingRow>
        <SettingRow icon={RefreshCw} title="Retry Policy" desc="Retries on failed RPC calls.">
          <div className="mt-1"><Select value={retryPolicy} onChange={setRetryPolicy} options={[
            { label: '1x Retry', value: '1x' },{ label: '3x Retry', value: '3x' },{ label: '5x Retry', value: '5x' },
          ]} /></div>
        </SettingRow>
        <SectionLabel>Testnets</SectionLabel>
        <SettingRow icon={WifiOff} title="Show Testnets" desc="Display Sepolia & testnet balances." toggle={testnets} onToggle={() => setTestnets(v => !v)} />
        <SettingRow icon={Activity} title="Auto-Switch Network" desc="Auto-match network to connected DApp." toggle={autoSwitchNetwork} onToggle={() => setAutoSwitchNetwork(v => !v)} />
      </div>
    );
  }

  function renderGas() {
    return (
      <div className="flex flex-col gap-1.5">
        <SectionLabel>Gas Strategy</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          {[{ label: 'Slow', value: 'slow', sub: '~120s' }, { label: 'Standard', value: 'standard', sub: '~30s' }, { label: 'Fast', value: 'fast', sub: '~15s' }].map(({ label, value, sub }) => (
            <button key={value} onClick={() => setGasPreset(value)}
              className={`flex flex-col items-center gap-1 py-3 rounded-2xl border transition-all ${gasPreset === value ? 'bg-black text-white border-black' : 'bg-white text-zinc-600 border-black/10 hover:border-black/20'}`}>
              <span className="text-[13px] font-black">{label}</span>
              <span className={`text-[10px] font-medium ${gasPreset === value ? 'text-white/60' : 'text-zinc-400'}`}>{sub}</span>
            </button>
          ))}
        </div>
        <SectionLabel>Swap Settings</SectionLabel>
        <SettingRow icon={Gauge} title="Slippage Tolerance" desc="Max acceptable price impact for swaps.">
          <div className="mt-1 flex gap-1.5">
            {['0.1', '0.5', '1.0'].map(v => (
              <button key={v} onClick={() => setSlippage(v)}
                className={`text-[12px] font-bold px-3 py-1.5 rounded-xl transition-colors ${slippage === v ? 'bg-black text-white' : 'bg-[#F2F2F7] text-black hover:bg-zinc-200'}`}>
                {v}%
              </button>
            ))}
          </div>
        </SettingRow>
        <SettingRow icon={Clock} title="Transaction Deadline" desc="Swap expires after this window.">
          <div className="mt-1"><Select value={deadlineMinutes} onChange={setDeadlineMinutes} options={[
            { label: '10 min', value: '10' },{ label: '20 min', value: '20' },
            { label: '30 min', value: '30' },{ label: '60 min', value: '60' },
          ]} /></div>
        </SettingRow>
        <SectionLabel>MEV & Gas</SectionLabel>
        <SettingRow icon={Shield} title="MEV Protection" desc="Route via Flashbots to prevent front-running." toggle={mevProtection} onToggle={() => setMevProtection(v => !v)} badge="Advanced" />
        <SettingRow icon={Zap} title="Gas Limit Buffer" desc="Safety buffer applied to estimated gas.">
          <div className="mt-1"><Select value={gasLimitBuffer} onChange={setGasLimitBuffer} options={[
            { label: '1.1x Buffer', value: '1.1x' },{ label: '1.2x Buffer', value: '1.2x' },{ label: '1.5x Buffer', value: '1.5x' },
          ]} /></div>
        </SettingRow>
        <SettingRow icon={Gauge} title="Max Priority Fee" desc={`Miner tip: ${maxPriorityFee} Gwei`}>
          <div className="mt-1 flex gap-1.5">
            {['1', '2', '5', '10'].map(v => (
              <button key={v} onClick={() => setMaxPriorityFee(v)}
                className={`text-[12px] font-bold px-2.5 py-1.5 rounded-xl transition-colors ${maxPriorityFee === v ? 'bg-black text-white' : 'bg-[#F2F2F7] text-black hover:bg-zinc-200'}`}>
                {v}G
              </button>
            ))}
          </div>
        </SettingRow>
      </div>
    );
  }

  function renderNotifications() {
    return (
      <div className="flex flex-col gap-1.5">
        <SectionLabel>Transactions</SectionLabel>
        <SettingRow icon={Download} title="Incoming Transfers" desc="Alert when you receive crypto." toggle={notifIncoming} onToggle={() => setNotifIncoming(v => !v)} />
        <SettingRow icon={Upload} title="Outgoing Transfers" desc="Confirm when your transaction is mined." toggle={notifOutgoing} onToggle={() => setNotifOutgoing(v => !v)} />
        <SettingRow icon={ArrowUpRight} title="Bridge Completions" desc="Notify when cross-chain bridging settles." toggle={notifBridge} onToggle={() => setNotifBridge(v => !v)} />
        <SectionLabel>Markets</SectionLabel>
        <SettingRow icon={Activity} title="Price Alerts" desc="Alerts when assets hit your target price." toggle={notifPriceAlert} onToggle={() => setNotifPriceAlert(v => !v)} />
        <SettingRow icon={BarChart2} title="DeFi Yield Updates" desc="Daily summary of accrued yield." toggle={notifDeFiYield} onToggle={() => setNotifDeFiYield(v => !v)} />
        <SectionLabel>Security</SectionLabel>
        <SettingRow icon={AlertTriangle} title="Security Alerts" desc="Warnings for suspicious activity on your address." toggle={notifSecurityAlert} onToggle={() => setNotifSecurityAlert(v => !v)} />
        <SectionLabel>Other</SectionLabel>
        <SettingRow icon={Layers} title="NFT Activity" desc="Bids, sales, and transfers for your NFTs." toggle={notifNFT} onToggle={() => setNotifNFT(v => !v)} />
        <SettingRow icon={BellOff} title="Newsletter & Updates" desc="Product announcements and release notes." toggle={notifNewsletter} onToggle={() => setNotifNewsletter(v => !v)} />
      </div>
    );
  }

  function renderPortfolio() {
    return (
      <div className="flex flex-col gap-1.5">
        <SectionLabel>Asset Display</SectionLabel>
        <SettingRow icon={BarChart2} title="Token Sort Order" desc="How tokens are ranked in the list.">
          <div className="mt-1"><Select value={tokenSort} onChange={setTokenSort} options={[
            { label: 'Value: High → Low', value: 'value_desc' },{ label: 'Value: Low → High', value: 'value_asc' },
            { label: 'Alphabetical', value: 'alpha' },{ label: 'Recent Activity', value: 'recent' },
          ]} /></div>
        </SettingRow>
        <SettingRow icon={Network} title="Group by Network" desc="Cluster tokens by blockchain." toggle={groupByNetwork} onToggle={() => setGroupByNetwork(v => !v)} />
        <SettingRow icon={EyeOff} title="Hide Spam Tokens" desc="Filter out airdrop and phishing tokens." toggle={!showSpamTokens} onToggle={() => setShowSpamTokens(v => !v)} />
        <SectionLabel>DeFi & Staking</SectionLabel>
        <SettingRow icon={Zap} title="Show DeFi Positions" desc="Display LP pools and yield farms." toggle={showDeFiPositions} onToggle={() => setShowDeFiPositions(v => !v)} />
        <SettingRow icon={Layers} title="Show Staking" desc="Include validator and liquid staking." toggle={showStaking} onToggle={() => setShowStaking(v => !v)} />
        <SectionLabel>Dashboard</SectionLabel>
        <SettingRow icon={BarChart2} title="Portfolio Chart" desc="Show historical net worth chart." toggle={showPortfolioChart} onToggle={() => setShowPortfolioChart(v => !v)} />
        <SettingRow icon={Activity} title="Show PnL" desc="Display profit and loss next to each asset." toggle={showPnL} onToggle={() => setShowPnL(v => !v)} />
        <SettingRow icon={Gauge} title="Live Gas Tracker" desc="Show current Ethereum gas price in header." toggle={showGasTracker} onToggle={() => setShowGasTracker(v => !v)} />
        <SettingRow icon={RefreshCw} title="Auto-Refresh Interval" desc="Frequency for balance updates.">
          <div className="mt-1"><Select value={portfolioRefresh} onChange={setPortfolioRefresh} options={[
            { label: '10s', value: '10s' },{ label: '30s', value: '30s' },
            { label: '1 min', value: '1min' },{ label: '5 min', value: '5min' },
          ]} /></div>
        </SettingRow>
      </div>
    );
  }

  function renderAdvanced() {
    return (
      <div className="flex flex-col gap-1.5">
        <SectionLabel>Developer Tools</SectionLabel>
        <SettingRow icon={Code2} title="Developer Mode" desc="Enable advanced RPC tools and raw logs." toggle={developerMode} onToggle={() => setDeveloperMode(v => !v)} />
        <SettingRow icon={Database} title="Show Hex Data" desc="Decode and display raw transaction calldata." toggle={hexData} onToggle={() => setHexData(v => !v)} disabled={!developerMode} />
        <SettingRow icon={Sliders} title="Debug Logs" desc="Print verbose output to browser console." toggle={debugLogs} onToggle={() => setDebugLogs(v => !v)} disabled={!developerMode} />
        <SectionLabel>Expert Mode</SectionLabel>
        <SettingRow icon={AlertTriangle} title="Expert Mode" desc="Bypass safety confirmations. Extreme caution." toggle={expertMode} onToggle={handleExpertMode} danger />
        <SettingRow icon={Key} title="Custom Nonce" desc="Manually override transaction nonce." toggle={customNonce} onToggle={() => setCustomNonce(v => !v)} disabled={!expertMode} />
        <SectionLabel>ZK Proving</SectionLabel>
        <SettingRow icon={Cpu} title="WASM Client-Side Proving" desc="Generate zk-SNARK proofs locally (private, slower)." toggle={wasmProving} onToggle={() => setWasmProving(v => !v)} badge="ZK" />
      </div>
    );
  }

  function renderData() {
    return (
      <div className="flex flex-col gap-1.5">
        <SectionLabel>Export</SectionLabel>
        <SettingRow icon={FileText} title="Export Transaction History" desc="Download full CSV of all on-chain activity." action={() => toast.success('Exporting transaction history...')} actionLabel="Export CSV" />
        <SettingRow icon={Download} title="Export Wallet Addresses" desc="Download a list of all connected wallets." action={() => toast.info('Preparing wallet export...')} actionLabel="Export" />
        <SettingRow icon={FileText} title="GDPR Data Request" desc="Request a full copy of all data we hold." action={() => toast.info('GDPR request submitted.')} actionLabel="Request" />
        <SectionLabel>Cache & Storage</SectionLabel>
        <SettingRow icon={HardDrive} title="Clear Local Cache" desc="Reset all cached balances and preferences." action={handleClearCache} actionLabel="Clear Cache" />
        <SettingRow icon={Trash2} title="Clear Transaction History Cache" desc="Remove locally stored transaction history." action={() => { localStorage.removeItem('tx-history'); toast.success('Transaction cache cleared.'); }} actionLabel="Clear" />
        <SectionLabel>Account</SectionLabel>
        <SettingRow icon={AlertTriangle} title="Disconnect All Wallets" desc="Remove all connected wallet addresses." action={() => toast.warning('All wallets disconnected.')} actionLabel="Disconnect" danger />
      </div>
    );
  }

  function renderAbout() {
    return (
      <div className="flex flex-col gap-2">
        <div className="p-5 bg-white rounded-2xl border border-black/[0.06] text-center">
          <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center mx-auto mb-3">
            <Globe size={28} className="text-white" />
          </div>
          <h3 className="text-[16px] font-black text-black tracking-tight">Humanity Ledger</h3>
          <p className="text-[12px] text-zinc-500 mt-1">Version 1.0.0 — First Release 01/01/2027</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">humanidfi.com</p>
        </div>
        <SectionLabel>Legal</SectionLabel>
        <SettingRow icon={FileText} title="Terms of Service" desc="humanidfi.com/docs/terms" action={() => window.open('/docs/terms', '_blank')} actionLabel="View" />
        <SettingRow icon={Shield} title="Privacy Policy" desc="humanidfi.com/docs/privacy" action={() => window.open('/docs/privacy', '_blank')} actionLabel="View" />
        <SettingRow icon={Key} title="Open Source Audit" desc="Public cryptographic audit reports." action={() => toast.info('Audit reports coming Q1 2027.')} actionLabel="View" />
        <SectionLabel>System</SectionLabel>
        <SettingRow icon={Activity} title="Connected Network" value={activeNetwork?.name || 'Ethereum Mainnet'} />
        <SettingRow icon={Key} title="Wallet Address" value={address ? (address.slice(0, 8) + '...' + address.slice(-6)) : 'Not connected'} />
      </div>
    );
  }

  const panels: Record<Tab, () => JSX.Element> = {
    general: renderGeneral, display: renderDisplay, security: renderSecurity,
    privacy: renderPrivacy, network: renderNetwork, gas: renderGas,
    notifications: renderNotifications, portfolio: renderPortfolio,
    advanced: renderAdvanced, data: renderData, about: renderAbout,
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/25 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
        className="bg-white rounded-[28px] shadow-2xl w-full max-w-[780px] h-[600px] overflow-hidden flex flex-col font-sans border border-black/[0.05]"
      >
        {/* Header */}
        <header className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-[18px] font-black text-black tracking-tight">Settings</h2>
            <p className="text-[12px] text-zinc-500 font-medium mt-0.5">
              {TABS.find(t => t.id === activeTab)?.label}
            </p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 hover:text-black transition-colors">
            <X size={18} />
          </button>
        </header>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <nav className="w-[180px] shrink-0 border-r border-zinc-100 overflow-y-auto py-3 px-2 flex flex-col gap-0.5 bg-[#FAFAFA]">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all w-full ${
                  activeTab === id ? 'bg-black text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-black'
                }`}>
                <Icon size={14} className="shrink-0" />
                <span className="text-[12px] font-bold tracking-tight">{label}</span>
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#FAFAFA]">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab}
                initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.15 }}>
                {panels[activeTab]()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
