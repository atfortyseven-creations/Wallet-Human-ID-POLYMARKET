"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, User, Bell, Lock, Database, Paintbrush,
  Globe, Star, Phone, Folder, MonitorSmartphone, Bookmark,
  QrCode, Edit2, Check, Shield, Trash2, Camera, Crown, Share,
  Volume2, PieChart, Info, DownloadCloud, Zap, MessageCircle, ArrowRight
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { toast } from 'sonner';

// ─── 1. SETTINGS BACKEND ───────────────────────────────────────────────────
// A robust custom hook that interfaces with localStorage (simulating PXE vault)
const DEFAULT_SETTINGS = {
  notifications_private: true,
  notifications_groups: true,
  notifications_workspaces: false,
  badge_count: true,
  passcode_enabled: false,
  auto_delete_timer: 'off',
  privacy_last_seen: 'nobody',
  auto_download_wifi: true,
  auto_download_cellular: false,
  save_photos: true,
  data_saver_calls: false,
  theme: 'brutalist',
  text_size: 3,
  language: 'en'
};

function useWhaleSettings(address: string) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!address) return;
    const key = `whale_settings_${address}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
    setIsLoaded(true);
  }, [address]);

  const updateSetting = (key: keyof typeof DEFAULT_SETTINGS, value: any) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(`whale_settings_${address}`, JSON.stringify(next));
      return next;
    });
  };

  return { settings, updateSetting, isLoaded };
}

// ─── 2. MAIN ROUTER COMPONENT ───────────────────────────────────────────────
export interface WhaleChatSettingsProps {
  onClose: () => void;
  address: string;
}

export function WhaleChatSettings({ onClose, address }: WhaleChatSettingsProps) {
  const [viewStack, setViewStack] = useState<string[]>(['root']);
  const [direction, setDirection] = useState(1);
  const { settings, updateSetting, isLoaded } = useWhaleSettings(address);

  const view = viewStack[viewStack.length - 1];

  const navigate = (newView: string) => {
    setDirection(1);
    setViewStack(prev => [...prev, newView]);
  };

  const goBack = () => {
    if (viewStack.length === 1) {
      onClose();
      return;
    }
    setDirection(-1);
    setViewStack(prev => prev.slice(0, -1));
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 1 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 1 }),
  };

  if (!isLoaded) return null;

  return (
    <div className="fixed inset-0 z-[50] flex items-center justify-center pointer-events-none">
      {/* Dimmed Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
      
      {/* Brutalist Modal / Fullscreen Container */}
      <div className="relative w-full h-[100dvh] md:h-[90vh] md:w-[480px] bg-zinc-50 md:border-[3px] md:border-black pointer-events-auto flex flex-col font-mono overflow-hidden shadow-[12px_12px_0_0_rgba(0,0,0,1)] md:mr-8 md:self-end z-10 transition-all">
        
        {/* Brutalist Header */}
        <div className="flex items-center justify-between px-4 py-4 bg-white shrink-0 border-b-[3px] border-black z-10">
          <button onClick={goBack} className="text-black font-bold uppercase tracking-widest text-[14px] hover:bg-black hover:text-white px-2 py-1 transition-colors border-2 border-transparent hover:border-black">
            {view === 'root' ? '[ CLOSE ]' : '< BACK'}
          </button>
          <span className="font-black text-[18px] text-black tracking-tight uppercase">
            {view === 'root' ? 'SYSTEM SETTINGS' : view.replace('_', ' ')}
          </span>
          <div className="w-16" /> {/* Spacer */}
        </div>

        {/* View Router */}
        <div className="relative flex-1 w-full overflow-hidden bg-zinc-50">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={view}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className="absolute inset-0 w-full h-full flex flex-col bg-zinc-50 overflow-y-auto"
            >
              {view === 'root' && <RootSettingsView onNavigate={navigate} address={address} />}
              {view === 'profile' && <ProfileView address={address} />}
              {view === 'edit_profile' && <EditProfileView address={address} />}
              {view === 'notifications' && <NotificationsView s={settings} update={updateSetting} />}
              {view === 'privacy' && <PrivacySecurityView s={settings} update={updateSetting} />}
              {view === 'data' && <DataStorageView s={settings} update={updateSetting} />}
              {view === 'premium' && <PremiumView />}
              {view === 'stars' && <StarsView />}
              {view === 'personal_vault' && <PersonalVaultView />}
              {view === 'connection_log' && <ConnectionLogView />}
              {view === 'devices' && <DevicesView />}
              {view === 'workspaces' && <WorkspacesView />}
              {view === 'appearance' && <AppearanceView s={settings} update={updateSetting} />}
              {view === 'language' && <LanguageView s={settings} update={updateSetting} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── 3. ROOT SETTINGS VIEW (BRUTALIST) ──────────────────────────────────────
function RootSettingsView({ onNavigate, address }: any) {
  return (
    <div className="w-full pb-20">
      {/* ID Card */}
      <div className="w-full p-4 border-b-[3px] border-black bg-white">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-black flex items-center justify-center shrink-0 border-2 border-black">
            <span className="text-white font-black text-3xl">W</span>
          </div>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-[20px] font-black text-black uppercase truncate">Satoshi Nakamoto</span>
            <span className="text-[14px] font-bold text-black/50 truncate">@whale_architect</span>
            <span className="text-[10px] font-mono mt-1 text-black bg-zinc-100 px-2 py-1 border border-black truncate">
              {address}
            </span>
          </div>
          <button onClick={() => onNavigate('profile')} className="p-3 bg-black text-white hover:bg-zinc-800 transition-colors border-2 border-black">
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <BrutalistMenuBlock>
          <BrutalistMenuItem icon={<Bookmark/>} label="Personal Vault" onClick={() => onNavigate('personal_vault')} />
          <BrutalistMenuItem icon={<Phone/>} label="Connection Log" onClick={() => onNavigate('connection_log')} />
          <BrutalistMenuItem icon={<MonitorSmartphone/>} label="Active Devices" onClick={() => onNavigate('devices')} />
          <BrutalistMenuItem icon={<Folder/>} label="Workspaces" onClick={() => onNavigate('workspaces')} noBorder />
        </BrutalistMenuBlock>

        <BrutalistMenuBlock>
          <BrutalistMenuItem icon={<Bell/>} label="Alerts & Sounds" onClick={() => onNavigate('notifications')} />
          <BrutalistMenuItem icon={<Shield/>} label="Privacy Engine" onClick={() => onNavigate('privacy')} />
          <BrutalistMenuItem icon={<Database/>} label="Data & Storage" onClick={() => onNavigate('data')} />
          <BrutalistMenuItem icon={<Paintbrush/>} label="Aesthetics" onClick={() => onNavigate('appearance')} />
          <BrutalistMenuItem icon={<Globe/>} label="Language" onClick={() => onNavigate('language')} noBorder />
        </BrutalistMenuBlock>

        <div 
          onClick={() => onNavigate('premium')}
          className="w-full border-[3px] border-black bg-black text-white p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-900 transition-colors shadow-[6px_6px_0_0_#1c7aff]"
        >
          <div className="flex items-center gap-4">
            <Crown size={28} className="text-[#1c7aff]" />
            <div className="flex flex-col">
              <span className="text-[18px] font-black uppercase">Whale Network Pro</span>
              <span className="text-[12px] text-zinc-400">Unlock maximum capacity</span>
            </div>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('stars')}
          className="w-full border-[3px] border-black bg-yellow-400 text-black p-4 flex items-center justify-between cursor-pointer hover:bg-yellow-300 transition-colors shadow-[6px_6px_0_0_#000]"
        >
          <div className="flex items-center gap-4">
            <Star size={28} className="fill-black" />
            <div className="flex flex-col">
              <span className="text-[18px] font-black uppercase">Quantum Dust</span>
              <span className="text-[12px] font-bold">1,250 QD Balance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 4. PROFILE VIEWS ────────────────────────────────────────────────────────
function ProfileView({ address }: { address: string }) {
  const [showQR, setShowQR] = useState(false);
  return (
    <div className="w-full flex flex-col">
      <div className="w-full bg-black p-8 flex flex-col items-center justify-center text-white relative">
        <div className="w-32 h-32 bg-white border-[4px] border-zinc-500 mb-4 flex items-center justify-center overflow-hidden">
           <span className="text-black font-black text-6xl">W</span>
        </div>
        <h2 className="text-2xl font-black uppercase">Satoshi Nakamoto</h2>
        <span className="text-zinc-400 text-sm font-bold mt-1">@whale_architect</span>
        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={() => setShowQR(!showQR)} className="p-2 bg-white text-black hover:bg-zinc-200 border-2 border-transparent">
            <QrCode size={20} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {showQR && (
          <div className="bg-white border-[3px] border-black p-6 flex flex-col items-center shadow-[8px_8px_0_0_#000] mb-4">
            <QRCode value={address} size={200} fgColor="#000" />
            <span className="mt-4 text-[12px] font-bold bg-zinc-100 px-3 py-2 border border-black text-center break-all">
              {address}
            </span>
          </div>
        )}
        <div className="bg-white border-[3px] border-black p-4 shadow-[4px_4px_0_0_#000]">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-1">Bio</span>
          <p className="text-[14px] font-bold text-black">Building the Sovereign Network. Cryptography, Privacy, and Decentralization.</p>
        </div>
      </div>
    </div>
  );
}

function EditProfileView({ address }: { address: string }) {
  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-center">
        <div className="w-24 h-24 bg-white border-[3px] border-black flex items-center justify-center relative cursor-pointer group shadow-[4px_4px_0_0_#000]">
          <Camera size={32} className="text-black group-hover:scale-110 transition-transform" />
        </div>
      </div>
      <div className="space-y-4">
        <BrutalistInput label="Display Name" defaultValue="Satoshi Nakamoto" />
        <BrutalistInput label="Username" defaultValue="whale_architect" prefix="@" />
        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-black uppercase tracking-widest text-zinc-500">Biography</label>
          <textarea 
            className="w-full bg-white border-[3px] border-black p-3 text-[14px] font-bold outline-none focus:bg-yellow-50 resize-none h-24"
            defaultValue="Building the Sovereign Network. Cryptography, Privacy, and Decentralization."
          />
        </div>
      </div>
      <button className="w-full py-4 bg-black text-white font-black uppercase tracking-widest border-[3px] border-black hover:bg-zinc-800 shadow-[6px_6px_0_0_#000] active:translate-y-1 active:shadow-[2px_2px_0_0_#000]">
        SAVE PROTOCOL
      </button>
    </div>
  );
}

// ─── 5. SETTINGS MODULES ───────────────────────────────────────────────────
function NotificationsView({ s, update }: any) {
  return (
    <div className="p-4 space-y-6">
      <SectionHeader title="Message Alerts" />
      <BrutalistMenuBlock>
        <ToggleRow label="Direct Channels" checked={s.notifications_private} onChange={(v: any) => update('notifications_private', v)} />
        <ToggleRow label="Encrypted Groups" checked={s.notifications_groups} onChange={(v: any) => update('notifications_groups', v)} />
        <ToggleRow label="Workspaces" checked={s.notifications_workspaces} onChange={(v: any) => update('notifications_workspaces', v)} noBorder />
      </BrutalistMenuBlock>
      <SectionHeader title="Application Badges" />
      <BrutalistMenuBlock>
        <ToggleRow label="Show Unread Count" checked={s.badge_count} onChange={(v: any) => update('badge_count', v)} noBorder />
      </BrutalistMenuBlock>
      <button className="w-full py-4 bg-white text-red-600 font-black uppercase tracking-widest border-[3px] border-black shadow-[4px_4px_0_0_#000] active:translate-y-1">
        RESET ALERT SYSTEM
      </button>
    </div>
  );
}

function PrivacySecurityView({ s, update }: any) {
  return (
    <div className="p-4 space-y-6">
      <SectionHeader title="Security Controls" />
      <BrutalistMenuBlock>
        <ToggleRow label="Hardware Passcode" checked={s.passcode_enabled} onChange={(v: any) => update('passcode_enabled', v)} />
        <BrutalistMenuItem icon={<Lock/>} label="Blocked Addresses" onClick={() => {}} noBorder />
      </BrutalistMenuBlock>

      <SectionHeader title="Privacy Matrix" />
      <BrutalistMenuBlock>
        <ActionRow label="Last Seen Status" value={s.privacy_last_seen} onClick={() => update('privacy_last_seen', s.privacy_last_seen === 'nobody' ? 'everybody' : 'nobody')} />
        <ActionRow label="Forwarding Rights" value="Nobody" onClick={() => {}} />
        <ActionRow label="P2P Call IP Masking" value="Enabled" onClick={() => {}} noBorder />
      </BrutalistMenuBlock>

      <SectionHeader title="Self-Destruct Protocol" />
      <BrutalistMenuBlock>
        <ActionRow label="Auto-Delete Messages" value={s.auto_delete_timer} onClick={() => update('auto_delete_timer', s.auto_delete_timer === 'off' ? '1 week' : 'off')} />
        <ActionRow label="Destroy Account After" value="6 Months" onClick={() => {}} noBorder />
      </BrutalistMenuBlock>
    </div>
  );
}

function DataStorageView({ s, update }: any) {
  return (
    <div className="p-4 space-y-6">
      <div className="bg-black text-white border-[3px] border-black p-6 flex flex-col items-center shadow-[6px_6px_0_0_#1c7aff]">
        <div className="w-full flex justify-between items-end mb-4">
          <div className="flex flex-col">
             <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Sent</span>
             <span className="text-xl font-black">450 MB</span>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Rcvd</span>
             <span className="text-xl font-black text-[#1c7aff]">1.2 GB</span>
          </div>
        </div>
        <div className="w-full h-4 bg-zinc-800 border-2 border-white flex mb-4">
           <div className="h-full bg-white w-[27%]" />
           <div className="h-full bg-[#1c7aff] w-[73%]" />
        </div>
        <button className="w-full py-2 bg-white text-black font-black uppercase text-sm border-2 border-transparent hover:border-[#1c7aff]">
          PURGE CACHE
        </button>
      </div>

      <SectionHeader title="Network Automation" />
      <BrutalistMenuBlock>
        <ToggleRow label="Auto-Fetch (WiFi)" checked={s.auto_download_wifi} onChange={(v: any) => update('auto_download_wifi', v)} />
        <ToggleRow label="Auto-Fetch (Cellular)" checked={s.auto_download_cellular} onChange={(v: any) => update('auto_download_cellular', v)} noBorder />
      </BrutalistMenuBlock>

      <BrutalistMenuBlock>
        <ToggleRow label="Data-Saver WebRTC" checked={s.data_saver_calls} onChange={(v: any) => update('data_saver_calls', v)} noBorder />
      </BrutalistMenuBlock>
    </div>
  );
}

function AppearanceView({ s, update }: any) {
  return (
    <div className="p-4 space-y-6">
      <SectionHeader title="Aesthetic Matrix" />
      <div className="grid grid-cols-2 gap-4">
        {['brutalist', 'monochrome', 'neon_void', 'terminal'].map(theme => (
          <div 
            key={theme}
            onClick={() => update('theme', theme)}
            className={`border-[3px] p-4 cursor-pointer flex flex-col items-center gap-2 transition-all ${s.theme === theme ? 'bg-black text-white border-black shadow-[4px_4px_0_0_#1c7aff]' : 'bg-white border-black text-black hover:bg-zinc-100'}`}
          >
            <span className="font-black uppercase text-[12px] tracking-widest">{theme.replace('_', ' ')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LanguageView({ s, update }: any) {
  const langs = ['en', 'es', 'fr', 'de', 'jp', 'cn'];
  const labels: any = { en: 'ENGLISH', es: 'ESPAÑOL', fr: 'FRANÇAIS', de: 'DEUTSCH', jp: 'JAPANESE', cn: 'CHINESE' };
  
  return (
    <div className="p-4 space-y-4">
      <BrutalistMenuBlock>
        {langs.map((l, i) => (
          <div 
            key={l}
            onClick={() => update('language', l)}
            className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${i !== langs.length - 1 ? 'border-b-[3px] border-black' : ''} ${s.language === l ? 'bg-black text-white' : 'bg-white text-black hover:bg-zinc-100'}`}
          >
            <span className="font-black uppercase">{labels[l]}</span>
            {s.language === l && <Check size={20} />}
          </div>
        ))}
      </BrutalistMenuBlock>
    </div>
  );
}

// ─── 6. UNIQUE VIEWS (VAULT, WORKSPACES, ETC) ──────────────────────────────
function PersonalVaultView() {
  return (
    <div className="p-4 flex flex-col items-center h-full justify-center">
      <div className="w-24 h-24 border-[4px] border-black bg-white flex items-center justify-center shadow-[8px_8px_0_0_#000] mb-8">
        <Bookmark size={40} className="text-black" />
      </div>
      <h2 className="text-2xl font-black uppercase mb-4 text-center">Personal Vault</h2>
      <p className="text-sm font-bold text-zinc-500 text-center max-w-xs mb-8">
        Store encrypted notes, forward intelligence, or back up critical keys. Only you have the decryption matrix.
      </p>
      <div className="w-full bg-black text-white p-6 border-[3px] border-black flex items-center justify-center border-dashed">
        <span className="font-mono text-zinc-400">VAULT_EMPTY</span>
      </div>
    </div>
  );
}

function ConnectionLogView() {
  return (
    <div className="p-4 space-y-4">
      <BrutalistMenuBlock>
        {[1,2,3].map(i => (
          <div key={i} className={`flex items-center justify-between p-4 ${i !== 3 ? 'border-b-[3px] border-black' : ''}`}>
            <div className="flex flex-col">
              <span className="font-black text-[14px]">0xUNKN...OWN</span>
              <span className="text-[10px] font-bold text-zinc-500">P2P WEBRTC • YESTERDAY</span>
            </div>
            <Phone size={18} className="text-black" />
          </div>
        ))}
      </BrutalistMenuBlock>
    </div>
  );
}

function DevicesView() {
  return (
    <div className="p-4 space-y-6">
      <button className="w-full py-4 bg-[#1c7aff] text-white font-black uppercase tracking-widest border-[3px] border-black shadow-[6px_6px_0_0_#000] active:translate-y-1">
        LINK NEW TERMINAL
      </button>

      <SectionHeader title="Active Sessions" />
      <BrutalistMenuBlock>
        <div className="p-4 flex flex-col border-b-[3px] border-black">
          <span className="font-black text-lg">Whale Desktop Node</span>
          <span className="text-xs font-bold text-zinc-500 mb-1">Windows • Chrome</span>
          <span className="text-xs font-black text-green-600 uppercase">ONLINE</span>
        </div>
        <div className="p-4 flex flex-col">
          <span className="font-black text-lg">Whale Mobile Node</span>
          <span className="text-xs font-bold text-zinc-500 mb-1">iOS • WebKit</span>
          <span className="text-xs font-black text-zinc-400 uppercase">OFFLINE</span>
        </div>
      </BrutalistMenuBlock>

      <button className="w-full py-4 bg-white text-red-600 font-black uppercase tracking-widest border-[3px] border-black shadow-[4px_4px_0_0_#000] active:translate-y-1">
        TERMINATE ALL OTHERS
      </button>
    </div>
  );
}

function WorkspacesView() {
  return (
    <div className="p-4 space-y-6">
      <button className="w-full py-4 bg-black text-white font-black uppercase tracking-widest border-[3px] border-black shadow-[6px_6px_0_0_#1c7aff] active:translate-y-1">
        INITIALIZE WORKSPACE
      </button>
      <BrutalistMenuBlock>
        <div className="p-4 flex items-center justify-between">
          <span className="font-black uppercase">Main Operations</span>
          <Check size={20} />
        </div>
      </BrutalistMenuBlock>
    </div>
  );
}

// ─── 7. PREMIUM & QD VIEWS ────────────────────────────────────────────────
function PremiumView() {
  return (
    <div className="p-4 pb-20 flex flex-col items-center">
      <div className="w-32 h-32 border-[4px] border-[#1c7aff] bg-black flex items-center justify-center shadow-[10px_10px_0_0_#1c7aff] mb-8">
        <Crown size={48} className="text-[#1c7aff]" />
      </div>
      <h1 className="text-3xl font-black uppercase text-center mb-2">Whale Pro</h1>
      <p className="text-sm font-bold text-zinc-600 text-center mb-8 max-w-xs">
        Unlimited limits. Autonomous tooling. Complete sovereignty.
      </p>

      <div className="w-full flex gap-4 mb-8">
        <div className="flex-1 border-[3px] border-black bg-white p-4 flex flex-col shadow-[4px_4px_0_0_#000]">
          <span className="font-black text-lg">MONTHLY</span>
          <span className="font-black text-[#1c7aff] text-2xl mt-2">€4.49</span>
        </div>
        <div className="flex-1 border-[3px] border-[#1c7aff] bg-black text-white p-4 flex flex-col shadow-[4px_4px_0_0_#1c7aff]">
          <span className="text-[10px] bg-[#1c7aff] px-1 py-0.5 w-fit font-black mb-1">-35% PROMO</span>
          <span className="font-black text-lg">ANNUAL</span>
          <span className="font-black text-[#1c7aff] text-2xl mt-2">€2.83<span className="text-sm text-zinc-400">/mo</span></span>
        </div>
      </div>

      <button className="w-full py-4 bg-[#1c7aff] text-white font-black uppercase tracking-widest border-[3px] border-black shadow-[8px_8px_0_0_#000] active:translate-y-1 mb-10">
        AUTHORIZE UPGRADE
      </button>

      <div className="w-full bg-white border-[3px] border-black p-4 shadow-[6px_6px_0_0_#000] space-y-4">
        <span className="font-black uppercase text-lg border-b-2 border-black pb-2 block">Capacities</span>
        {[
          "Infinite Workspaces",
          "Encrypted Cloud 100TB",
          "Real-Time Translation",
          "Advanced Analytics",
          "Brutalist Badge",
          "Zero Advertising Protocol",
          "Voice Matrix Decryption"
        ].map(f => (
          <div key={f} className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[#1c7aff]" />
            <span className="font-bold text-sm">{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StarsView() {
  const packages = [
    { qd: 100, price: "€2.15" },
    { qd: 250, price: "€5.39" },
    { qd: 500, price: "€10.85" },
    { qd: 1000, price: "€21.40" },
    { qd: 2500, price: "€54.00" },
    { qd: 35000, price: "€700.00" },
  ];

  return (
    <div className="p-4 pb-20 flex flex-col items-center">
      <div className="w-32 h-32 border-[4px] border-black bg-yellow-400 flex items-center justify-center shadow-[10px_10px_0_0_#000] mb-8">
        <Star size={64} className="fill-black text-black" />
      </div>
      <h1 className="text-3xl font-black uppercase text-center mb-2">Quantum Dust</h1>
      <p className="text-sm font-bold text-zinc-600 text-center mb-8 max-w-xs">
        Fuel your economy. Trade, tip, and power decentralized protocols.
      </p>

      <div className="flex flex-col items-center mb-10">
        <span className="text-[12px] font-black uppercase tracking-widest text-zinc-500 mb-1">NODE BALANCE</span>
        <span className="text-5xl font-black">1,250 QD</span>
      </div>

      <div className="w-full flex flex-col gap-3">
        {packages.map((pkg, i) => (
          <div key={i} className="w-full bg-white border-[3px] border-black p-4 flex items-center justify-between shadow-[4px_4px_0_0_#000] active:translate-y-1 transition-transform cursor-pointer">
            <div className="flex items-center gap-3">
              <Star size={20} className="fill-yellow-400 text-black" />
              <span className="font-black text-xl">{pkg.qd.toLocaleString()} QD</span>
            </div>
            <div className="bg-black text-white px-4 py-2 font-black border-2 border-black">
              {pkg.price}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── UTILS ──────────────────────────────────────────────────────────────────
function BrutalistMenuBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full bg-white border-[3px] border-black shadow-[6px_6px_0_0_#000] flex flex-col">
      {children}
    </div>
  );
}

function BrutalistMenuItem({ icon, label, onClick, noBorder = false }: any) {
  return (
    <div 
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 cursor-pointer hover:bg-zinc-100 transition-colors ${noBorder ? '' : 'border-b-[3px] border-black'}`}
    >
      <div className="text-black">{icon}</div>
      <span className="font-black uppercase text-[15px]">{label}</span>
      <div className="ml-auto">
        <ChevronLeft size={20} className="rotate-180" />
      </div>
    </div>
  );
}

function BrutalistInput({ label, defaultValue, prefix }: any) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-[12px] font-black uppercase tracking-widest text-zinc-500">{label}</label>
      <div className="flex w-full">
        {prefix && (
          <div className="bg-black text-white border-[3px] border-black border-r-0 px-4 py-3 font-black flex items-center">
            {prefix}
          </div>
        )}
        <input 
          type="text" 
          defaultValue={defaultValue} 
          className="flex-1 bg-white border-[3px] border-black p-3 text-[14px] font-bold outline-none focus:bg-yellow-50"
        />
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <span className="text-[12px] font-black uppercase tracking-widest text-zinc-500 ml-2 block mb-[-8px]">{title}</span>;
}

function ToggleRow({ label, checked, onChange, noBorder = false }: any) {
  return (
    <div className={`w-full flex items-center justify-between p-4 ${noBorder ? '' : 'border-b-[3px] border-black'}`}>
      <span className="font-black uppercase text-[14px]">{label}</span>
      <button 
        onClick={() => onChange(!checked)}
        className={`w-14 h-8 border-[3px] border-black transition-colors ${checked ? 'bg-[#34c759]' : 'bg-white'}`}
      >
        <div className={`w-6 h-full border-black transition-transform bg-black ${checked ? 'translate-x-7' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

function ActionRow({ label, value, onClick, noBorder = false }: any) {
  return (
    <div 
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-100 transition-colors ${noBorder ? '' : 'border-b-[3px] border-black'}`}
    >
      <span className="font-black uppercase text-[14px]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-bold text-zinc-500 uppercase">{value}</span>
      </div>
    </div>
  );
}
