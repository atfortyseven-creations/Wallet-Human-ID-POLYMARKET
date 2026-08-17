"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, User, Bell, Lock, Database, Paintbrush,
  Globe, Star, Phone, Folder, MonitorSmartphone, Bookmark,
  QrCode, Edit2, Check, Shield, Trash2, Camera, Crown, Share,
  Volume2, PieChart, Info, DownloadCloud, Zap, MessageCircle
} from 'lucide-react';

interface WhaleChatSettingsProps {
  onClose: () => void;
  address: string;
}

type ViewState = 
  | 'main' | 'profile' | 'edit_profile' | 'saved_messages' | 'recent_calls' 
  | 'devices' | 'chat_folders' | 'notifications' | 'privacy' | 'data' 
  | 'appearance' | 'language' | 'premium' | 'stars';

export function WhaleChatSettings({ onClose, address }: WhaleChatSettingsProps) {
  const [view, setView] = useState<ViewState>('main');
  const [direction, setDirection] = useState(1);

  const navigate = (newView: ViewState) => {
    setDirection(1);
    setView(newView);
  };

  const goBack = () => {
    setDirection(-1);
    setView('main');
  };

  const shortAddr = address ? `${address.slice(0,6)}...${address.slice(-4)}` : '';
  const hash = `0x${Math.random().toString(16).slice(2,10).toUpperCase()}`;

  // Fake states for interactivity
  const [nickname, setNickname] = useState('@whale_user');
  const [bio, setBio] = useState('Building the private internet on Aztec.');
  const [name, setName] = useState('Satoshi');

  // Animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-[#f5f5f7] z-[500000] overflow-hidden flex flex-col font-sans">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={view}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute inset-0 w-full h-full flex flex-col bg-[#f5f5f7]"
        >
          {/* HEADER */}
          <div className="pt-[max(16px,env(safe-area-inset-top,16px))] bg-white/80 backdrop-blur-xl border-b border-black/5 shrink-0 px-4 h-14 flex items-center justify-between relative z-10">
            {view === 'main' ? (
              <button onClick={onClose} className="text-[#1c7aff] text-[15px] font-semibold flex items-center h-full">
                Cancel
              </button>
            ) : (
              <button onClick={goBack} className="text-[#1c7aff] text-[15px] font-semibold flex items-center gap-1 h-full">
                <ChevronLeft size={20} className="-ml-1" />
                Settings
              </button>
            )}
            
            <span className="text-[16px] font-bold text-black capitalize absolute left-1/2 -translate-x-1/2 pointer-events-none">
              {view === 'main' ? 'Settings' : view.replace('_', ' ')}
            </span>

            {view === 'main' ? (
              <button onClick={() => navigate('edit_profile')} className="text-[#1c7aff] text-[15px] font-semibold">
                Edit
              </button>
            ) : (
              <div className="w-12" />
            )}
          </div>

          {/* CONTENT */}
          <div className="flex-1 overflow-y-auto w-full relative pb-[max(32px,env(safe-area-inset-bottom,32px))] scrollbar-none">
            {view === 'main' && <MainSettingsView navigate={navigate} address={address} name={name} nickname={nickname} />}
            {view === 'profile' && <ProfileView address={address} hash={hash} name={name} nickname={nickname} bio={bio} />}
            {view === 'edit_profile' && <EditProfileView name={name} setName={setName} bio={bio} setBio={setBio} nickname={nickname} setNickname={setNickname} />}
            {view === 'notifications' && <NotificationsView />}
            {view === 'privacy' && <PrivacyView />}
            {view === 'data' && <DataStorageView />}
            {view === 'premium' && <PremiumView />}
            {view === 'stars' && <StarsView />}
            {view === 'saved_messages' && <SavedMessagesView />}
            {view === 'recent_calls' && <RecentCallsView />}
            {view === 'devices' && <DevicesView />}
            {view === 'chat_folders' && <ChatFoldersView />}
            {view === 'appearance' && <AppearanceView />}
            {view === 'language' && <LanguageView />}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── 1. MAIN SETTINGS VIEW ──────────────────────────────────────────────────
function MainSettingsView({ navigate, address, name, nickname }: any) {
  return (
    <div className="w-full max-w-lg mx-auto py-6 px-4 flex flex-col gap-6">
      {/* Search Bar */}
      <div className="w-full relative">
        <input type="text" placeholder="Search Settings" className="w-full bg-black/5 rounded-[10px] py-2 px-4 text-[15px] text-black placeholder:text-black/30 outline-none" />
      </div>

      {/* Profile Card */}
      <div 
        onClick={() => navigate('profile')}
        className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-black/5 cursor-pointer active:scale-[0.98] transition-all"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 shrink-0 border-2 border-black/5" />
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h2 className="text-[20px] font-bold tracking-tight text-black leading-tight truncate">{name}</h2>
          <p className="text-[14px] text-black/50 truncate mb-0.5">{nickname}</p>
          <p className="text-[12px] font-mono text-black/30 truncate">{address}</p>
        </div>
        <ChevronLeft size={20} className="rotate-180 text-black/20 shrink-0" />
      </div>

      {/* Group 1: General */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5">
        <SettingsRow icon={<Bookmark size={20} className="text-white" />} color="bg-blue-500" label="Saved Messages" onClick={() => navigate('saved_messages')} />
        <SettingsRow icon={<Phone size={20} className="text-white" />} color="bg-green-500" label="Recent Calls" onClick={() => navigate('recent_calls')} />
        <SettingsRow icon={<MonitorSmartphone size={20} className="text-white" />} color="bg-orange-500" label="Devices" onClick={() => navigate('devices')} />
        <SettingsRow icon={<Folder size={20} className="text-white" />} color="bg-indigo-500" label="Chat Folders" onClick={() => navigate('chat_folders')} border={false} />
      </div>

      {/* Group 2: Core Settings */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5">
        <SettingsRow icon={<Bell size={20} className="text-white" />} color="bg-red-500" label="Notifications and Sounds" onClick={() => navigate('notifications')} />
        <SettingsRow icon={<Lock size={20} className="text-white" />} color="bg-gray-500" label="Privacy and Security" onClick={() => navigate('privacy')} />
        <SettingsRow icon={<Database size={20} className="text-white" />} color="bg-green-500" label="Data and Storage" onClick={() => navigate('data')} />
        <SettingsRow icon={<Paintbrush size={20} className="text-white" />} color="bg-cyan-500" label="Appearance" onClick={() => navigate('appearance')} />
        <SettingsRow icon={<Globe size={20} className="text-white" />} color="bg-purple-500" label="Language" onClick={() => navigate('language')} border={false} />
      </div>

      {/* Group 3: Premium */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5">
        <SettingsRow icon={<Crown size={20} className="text-white" />} color="bg-gradient-to-r from-purple-500 to-pink-500" label="Whale Chat Premium" onClick={() => navigate('premium')} />
        <SettingsRow icon={<Star size={20} className="text-white" />} color="bg-yellow-400" label="My Stars" onClick={() => navigate('stars')} border={false} />
      </div>
    </div>
  );
}

function SettingsRow({ icon, color, label, onClick, border = true }: any) {
  return (
    <button onClick={onClick} className="w-full flex items-center px-4 bg-white active:bg-black/5 transition-colors text-left">
      <div className={`w-[30px] h-[30px] rounded-lg ${color} flex items-center justify-center shrink-0 my-2`}>
        {icon}
      </div>
      <div className={`flex-1 flex items-center justify-between ml-4 py-3 ${border ? 'border-b border-black/5' : ''}`}>
        <span className="text-[16px] text-black">{label}</span>
        <ChevronLeft size={18} className="rotate-180 text-black/20" />
      </div>
    </button>
  );
}

// ─── 2. PROFILE VIEW ────────────────────────────────────────────────────────
function ProfileView({ address, hash, name, nickname, bio }: any) {
  return (
    <div className="w-full max-w-lg mx-auto py-6 px-4 flex flex-col gap-6">
      <div className="flex flex-col items-center mt-4">
        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 mb-4 shadow-xl border-4 border-white relative">
          <button className="absolute bottom-0 right-0 w-10 h-10 bg-[#1c7aff] rounded-full flex items-center justify-center border-2 border-white shadow-md active:scale-90 transition-all">
            <Camera size={18} className="text-white" />
          </button>
        </div>
        <h1 className="text-2xl font-black text-black">{name}</h1>
        <p className="text-sm font-semibold text-[#1c7aff]">online</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-4 flex flex-col gap-4">
        <div>
          <p className="text-[11px] font-bold text-black/40 uppercase tracking-widest mb-1">Account</p>
          <div className="flex items-center justify-between">
            <p className="text-[16px] text-black">{nickname}</p>
            <button className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
              <QrCode size={16} className="text-[#1c7aff]" />
            </button>
          </div>
          <p className="text-[13px] text-black/40 mt-1">Username</p>
        </div>
        <div className="h-[1px] w-full bg-black/5" />
        <div>
          <p className="text-[16px] text-black">{bio}</p>
          <p className="text-[13px] text-black/40 mt-1">Bio</p>
        </div>
        <div className="h-[1px] w-full bg-black/5" />
        <div>
          <p className="text-[14px] font-mono text-black">{address}</p>
          <p className="text-[13px] text-black/40 mt-1">Wallet Address</p>
        </div>
        <div className="h-[1px] w-full bg-black/5" />
        <div>
          <p className="text-[14px] font-mono text-black">{hash}</p>
          <p className="text-[13px] text-black/40 mt-1">ZKP Identity Hash</p>
        </div>
      </div>
    </div>
  );
}

function EditProfileView({ name, setName, bio, setBio, nickname, setNickname }: any) {
  return (
    <div className="w-full max-w-lg mx-auto py-6 px-4 flex flex-col gap-6">
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-4 flex flex-col gap-4">
        <div>
          <p className="text-[11px] font-bold text-black/40 uppercase tracking-widest mb-1">Name</p>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full text-[16px] text-black outline-none border-b border-black/10 pb-2 focus:border-[#1c7aff]" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-black/40 uppercase tracking-widest mb-1">Username</p>
          <input value={nickname} onChange={e => setNickname(e.target.value)} className="w-full text-[16px] text-black outline-none border-b border-black/10 pb-2 focus:border-[#1c7aff]" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-black/40 uppercase tracking-widest mb-1">Bio</p>
          <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full text-[16px] text-black outline-none border-b border-black/10 pb-2 resize-none h-20 focus:border-[#1c7aff]" />
          <p className="text-[11px] text-black/40 mt-2">Any details such as age, occupation or city. Example: 23 y.o. designer from SF.</p>
        </div>
      </div>
    </div>
  );
}

// ─── 3. NOTIFICATIONS VIEW ──────────────────────────────────────────────────
function NotificationsView() {
  return (
    <div className="w-full max-w-lg mx-auto py-6 px-4 flex flex-col gap-6">
      <p className="text-[13px] font-bold text-black/50 uppercase tracking-widest ml-4 mb-[-12px]">Message Notifications</p>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5">
        <ToggleRow label="Private Chats" defaultOn />
        <ToggleRow label="Group Chats" defaultOn />
        <ToggleRow label="Channels" defaultOn />
        <ToggleRow label="Stories" defaultOn={false} />
        <ToggleRow label="Reactions" defaultOn border={false} />
      </div>

      <p className="text-[13px] font-bold text-black/50 uppercase tracking-widest ml-4 mb-[-12px]">Badge Counter</p>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5">
        <ToggleRow label="Include Channels" defaultOn />
        <ToggleRow label="Count Unread Messages" defaultOn />
        <ToggleRow label="New Contacts" defaultOn={false} border={false} />
      </div>

      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5">
        <button className="w-full py-3 text-red-500 font-medium text-[16px]">Reset All Notifications</button>
      </div>
    </div>
  );
}

// ─── 4. PRIVACY VIEW ────────────────────────────────────────────────────────
function PrivacyView() {
  return (
    <div className="w-full max-w-lg mx-auto py-6 px-4 flex flex-col gap-6">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5">
        <SettingsRow icon={<Shield size={20} className="text-white" />} color="bg-red-500" label="Blocked Users" />
        <SettingsRow icon={<Lock size={20} className="text-white" />} color="bg-gray-500" label="Passcode & Face ID" />
        <SettingsRow icon={<Trash2 size={20} className="text-white" />} color="bg-orange-500" label="Auto-Delete Messages" border={false} />
      </div>

      <p className="text-[13px] font-bold text-black/50 uppercase tracking-widest ml-4 mb-[-12px]">Privacy</p>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5">
        <PrivacyRow label="Last Seen & Online" value="Everybody" />
        <PrivacyRow label="Profile Photos" value="Everybody" />
        <PrivacyRow label="Bio" value="Everybody" />
        <PrivacyRow label="Gifts" value="Everybody" />
        <PrivacyRow label="Forwarded Messages" value="Everybody" />
        <PrivacyRow label="Calls" value="Everybody" />
        <PrivacyRow label="Voice Messages" value="Nobody" border={false} />
      </div>

      <p className="text-[13px] font-bold text-black/50 uppercase tracking-widest ml-4 mb-[-12px]">Automatically Delete My Account</p>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5">
        <PrivacyRow label="If Away For" value="6 months" border={false} />
      </div>
    </div>
  );
}

function PrivacyRow({ label, value, border = true }: any) {
  return (
    <button className={`w-full flex items-center justify-between px-4 py-3 bg-white active:bg-black/5 transition-colors text-left ${border ? 'border-b border-black/5' : ''}`}>
      <span className="text-[16px] text-black">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[16px] text-black/40">{value}</span>
        <ChevronLeft size={18} className="rotate-180 text-black/20" />
      </div>
    </button>
  );
}

// ─── 5. DATA AND STORAGE VIEW ───────────────────────────────────────────────
function DataStorageView() {
  return (
    <div className="w-full max-w-lg mx-auto py-6 px-4 flex flex-col gap-6">
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 flex flex-col items-center">
        <div className="relative w-48 h-48 mb-6">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#f0f0f0" strokeWidth="16" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#1c7aff" strokeWidth="16" strokeDasharray="251.2" strokeDashoffset="180" className="transition-all duration-1000" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#34c759" strokeWidth="16" strokeDasharray="251.2" strokeDashoffset="220" className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-black">4.2 GB</span>
            <span className="text-xs font-bold text-black/40 uppercase tracking-widest">Used</span>
          </div>
        </div>
        <p className="text-sm font-semibold text-black/60 mb-6 text-center">Whale Chat uses 1.2% of your free disk space.</p>
        
        <div className="w-full flex flex-col gap-3 mb-6">
          <div className="flex items-center justify-between text-sm"><div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#1c7aff]"/> <span className="font-medium text-black">Videos</span></div> <span className="font-mono text-black/60">3.1 GB</span></div>
          <div className="flex items-center justify-between text-sm"><div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#34c759]"/> <span className="font-medium text-black">Photos</span></div> <span className="font-mono text-black/60">800 MB</span></div>
          <div className="flex items-center justify-between text-sm"><div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#ffcc00]"/> <span className="font-medium text-black">Stickers</span></div> <span className="font-mono text-black/60">300 MB</span></div>
        </div>

        <button className="w-full py-3 rounded-xl bg-red-50 text-red-500 font-bold text-[16px] active:scale-95 transition-all">Clear Entire Cache</button>
      </div>

      <p className="text-[13px] font-bold text-black/50 uppercase tracking-widest ml-4 mb-[-12px]">Automatic Media Download</p>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5">
        <ToggleRow label="Using Cellular" defaultOn={false} />
        <ToggleRow label="Using Wi-Fi" defaultOn border={false} />
      </div>

      <p className="text-[13px] font-bold text-black/50 uppercase tracking-widest ml-4 mb-[-12px]">Save to Photos</p>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5">
        <ToggleRow label="Private Chats" defaultOn />
        <ToggleRow label="Group Chats" defaultOn={false} />
        <ToggleRow label="Channels" defaultOn={false} border={false} />
      </div>

      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5">
        <ToggleRow label="Use Less Data for Calls" defaultOn={false} border={false} />
      </div>
    </div>
  );
}

// ─── 6. PREMIUM VIEW ────────────────────────────────────────────────────────
function PremiumView() {
  const features = [
    { title: "Stories", desc: "Unlimited posting, priority order, stealth mode, permanent view history." },
    { title: "Unlimited Cloud Storage", desc: "4GB per each document, unlimited storage for your chats and media overall." },
    { title: "Doubled Limits", desc: "Up to 1000 channels, 30 folders, 10 pins, 20 public links, 4 accounts and more." },
    { title: "Whale Chat Business", desc: "Upgrade your account with business features such as location, opening hours and quick replies." },
    { title: "Last Seen Times", desc: "View the last seen and read times of others even if you hide yours." },
    { title: "Voice-to-Text Conversion", desc: "Ability to read the transcript of any incoming voice message." },
    { title: "Faster Download Speed", desc: "No more limits on the speed with which media and documents are downloaded." },
    { title: "Real-Time Translation", desc: "Real-Time translation of chats and channels into other languages." },
    { title: "Animated Emoji", desc: "Include animated emoji from different packs in any message you send." },
    { title: "Emoji Statuses", desc: "Choose from thousands of emoji to display current activity next to your name." },
    { title: "Tags for Messages", desc: "Organize your Saved Messages with tags for quicker access." },
    { title: "Name and Profile Colors", desc: "Choose a color and logo for your profile and replies to your messages." },
    { title: "Wallpapers for Both Sides", desc: "Set custom wallpapers for you and your chat partner." },
    { title: "Profile Badge", desc: "An exclusive badge next to your name showing that you subscribe to Whale Chat Premium." },
    { title: "Message Privacy", desc: "Limit messages from strangers or charge for incoming messages." },
    { title: "Disable Sharing", desc: "Prevent forwarding, saving and copying content in private chats." },
    { title: "Advanced Chat Mangement", desc: "Tools to set the default folder, auto-archive and hide new chats from non-contacts." },
    { title: "No Ads", desc: "No more ads in public channels where Whale Chat sometimes shows ads." },
    { title: "Whale Chat App Icon", desc: "Choose from a selection of Telegram app icons for your homescreen." },
    { title: "Infinite Reactions", desc: "React with thousands of emoji using multimple reactions per message." },
    { title: "Animated Profile Pictures", desc: "Video avatars animated in chat lists and chats to allow for additional self-expression." },
    { title: "Premium Stickers", desc: "Exclusive enlarged stickers featuring additional effects, updated regularly." },
    { title: "Message Effects", desc: "Add over 500 animated effects to private messages." },
    { title: "Ai Tools", desc: "Transfor your messages and entire chats in your preferred style and language." },
    { title: "Formating Tools", desc: "Add headers, tables, inline media and AI content to messages." },
    { title: "Checklists", desc: "Plan, assign and complete tasks seamlessly and efficiently." }
  ];

  return (
    <div className="w-full h-full bg-gradient-to-b from-[#1c7aff]/10 to-transparent overflow-y-auto">
      <div className="w-full max-w-lg mx-auto pb-20 pt-10 px-4 flex flex-col items-center">
        {/* Animated Premium Whale */}
        <motion.div 
          animate={{ y: [0, -10, 0], rotate: [0, 2, -2, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="w-40 h-40 relative mb-6"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-[#1c7aff] rounded-full blur-[40px] opacity-40 animate-pulse" />
          <img src="/official-whale-monochrome.png" className="w-full h-full object-contain relative z-10 drop-shadow-2xl" style={{ filter: 'drop-shadow(0 10px 20px rgba(28,122,255,0.4))' }} alt="Whale" />
        </motion.div>
        
        <h1 className="text-3xl font-black text-black tracking-tight mb-2">Whale Chat Premium</h1>
        <p className="text-[15px] text-black/60 text-center mb-8">Subscribe to unlock exclusive features and support the decentralized network.</p>

        {/* Pricing */}
        <div className="w-full flex gap-3 mb-8">
          <div className="flex-1 bg-white border-2 border-[#1c7aff] rounded-2xl p-4 flex flex-col relative overflow-hidden shadow-md">
            <div className="absolute top-0 inset-x-0 bg-[#1c7aff] text-white text-[10px] font-bold uppercase tracking-widest text-center py-0.5">-35% Discount</div>
            <span className="text-[16px] font-bold text-black mt-4">Annual</span>
            <span className="text-2xl font-black text-[#1c7aff] mt-1">€2.83<span className="text-sm text-black/40 font-medium">/mo</span></span>
            <span className="text-[12px] text-black/50 mt-1">€33.99 billed yearly</span>
          </div>
          <div className="flex-1 bg-white border border-black/10 rounded-2xl p-4 flex flex-col shadow-sm">
            <span className="text-[16px] font-bold text-black mt-4">Monthly</span>
            <span className="text-2xl font-black text-black mt-1">€4.49<span className="text-sm text-black/40 font-medium">/mo</span></span>
            <span className="text-[12px] text-black/50 mt-1">Billed monthly</span>
          </div>
        </div>

        {/* Subscribe CTA */}
        <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-[#1c7aff] text-white font-bold text-[18px] shadow-lg active:scale-95 transition-all mb-8">
          Subscribe for €33.99 / year
        </button>

        {/* Features List */}
        <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-black/5 flex flex-col gap-6">
          <h3 className="text-[14px] font-bold text-black/40 uppercase tracking-widest">What's Included</h3>
          {features.map((f, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-[#1c7aff] shrink-0 flex items-center justify-center">
                <Check size={16} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[16px] font-bold text-black">{f.title}</span>
                <span className="text-[14px] text-black/50 leading-snug">{f.desc}</span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[12px] text-black/40 mt-8 text-center px-4">
          By subscribing, you agree to the <a href="#" className="text-[#1c7aff]">Terms of Service</a> and <a href="#" className="text-[#1c7aff]">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}

// ─── 7. STARS VIEW ──────────────────────────────────────────────────────────
function StarsView() {
  const packages = [
    { stars: 100, price: "€2.15" },
    { stars: 250, price: "€5.39" },
    { stars: 500, price: "€10.85" },
    { stars: 1000, price: "€21.40" },
    { stars: 2500, price: "€54.00" },
    { stars: 10000, price: "€215.00" },
    { stars: 35000, price: "€700.00" },
  ];

  return (
    <div className="w-full h-full bg-gradient-to-b from-yellow-400/10 to-transparent overflow-y-auto">
      <div className="w-full max-w-lg mx-auto pb-20 pt-10 px-4 flex flex-col items-center">
        
        {/* Animated Star */}
        <motion.div 
          whileTap={{ scale: 0.9 }}
          className="w-40 h-40 relative mb-8 cursor-pointer group"
        >
          <div className="absolute inset-0 bg-yellow-400 rounded-full blur-[50px] opacity-50 group-active:opacity-80 transition-opacity" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="w-full h-full flex items-center justify-center relative z-10"
          >
            <Star size={120} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] fill-yellow-400" />
          </motion.div>
        </motion.div>
        
        <h1 className="text-3xl font-black text-black tracking-tight mb-2">Whale Stars (QDs)</h1>
        <p className="text-[15px] text-black/60 text-center mb-8 px-4">Buy Stars to unlock content and services in mini apps on Whale Chat.</p>

        {/* Balance */}
        <div className="flex flex-col items-center mb-10">
          <span className="text-[12px] font-bold text-black/40 uppercase tracking-widest mb-2">Your Balance</span>
          <div className="flex items-center gap-3">
            <Star size={32} className="text-yellow-400 fill-yellow-400" />
            <span className="text-5xl font-black text-black">0</span>
          </div>
        </div>

        <h3 className="text-[14px] font-bold text-black/40 uppercase tracking-widest w-full text-left ml-4 mb-4">Buy More Stars</h3>
        <div className="w-full flex flex-col gap-3">
          {packages.map((pkg, i) => (
            <div key={i} className="w-full bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-black/5 active:scale-[0.98] transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <Star size={24} className="text-yellow-400 fill-yellow-400" />
                <span className="text-[18px] font-black text-black">{pkg.stars}</span>
              </div>
              <button className="bg-[#1c7aff] text-white px-4 py-1.5 rounded-full font-bold text-[14px]">
                {pkg.price}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 8. SAVED MESSAGES VIEW ────────────────────────────────────────────────
function SavedMessagesView() {
  return (
    <div className="w-full max-w-lg mx-auto py-6 px-4 flex flex-col items-center">
      <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-6">
        <Bookmark size={40} className="text-[#1c7aff]" />
      </div>
      <h2 className="text-xl font-bold text-black mb-2">Saved Messages</h2>
      <p className="text-[14px] text-black/50 text-center mb-6">Forward messages here to save them. Send messages to yourself to store data.</p>
      <div className="w-full bg-white rounded-2xl p-4 shadow-sm border border-black/5 flex items-center justify-center h-32">
        <span className="text-black/30 font-medium">No saved messages yet.</span>
      </div>
    </div>
  );
}

// ─── 9. RECENT CALLS VIEW ──────────────────────────────────────────────────
function RecentCallsView() {
  return (
    <div className="w-full max-w-lg mx-auto py-6 px-4 flex flex-col items-center">
      <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
        <Phone size={40} className="text-green-500" />
      </div>
      <h2 className="text-xl font-bold text-black mb-2">Recent Calls</h2>
      <p className="text-[14px] text-black/50 text-center mb-6">Your recent voice and video calls will appear here.</p>
      <div className="w-full bg-white rounded-2xl p-4 shadow-sm border border-black/5 flex flex-col gap-4">
        {[1,2,3].map(i => (
          <div key={i} className={`flex items-center justify-between pb-4 ${i !== 3 ? 'border-b border-black/5' : ''}`}>
            <div className="flex flex-col">
              <span className="text-[16px] font-bold text-black">Unknown Caller</span>
              <span className="text-[13px] text-black/40">Yesterday, 14:30</span>
            </div>
            <Phone size={18} className="text-[#1c7aff]" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 10. DEVICES VIEW ──────────────────────────────────────────────────────
function DevicesView() {
  return (
    <div className="w-full max-w-lg mx-auto py-6 px-4 flex flex-col gap-6">
      <div className="w-full flex justify-center mb-4">
        <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center">
          <MonitorSmartphone size={40} className="text-orange-500" />
        </div>
      </div>
      <button className="w-full py-3 rounded-2xl bg-[#1c7aff] text-white font-bold text-[16px] shadow-sm">
        Link Desktop Device
      </button>

      <p className="text-[13px] font-bold text-black/50 uppercase tracking-widest ml-4 mb-[-12px]">This Device</p>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5 flex flex-col">
        <span className="text-[16px] font-bold text-black">Whale Chat Mobile</span>
        <span className="text-[13px] text-black/50">iOS 17 • Safari</span>
        <span className="text-[13px] text-green-500 font-medium mt-1">Online</span>
      </div>

      <p className="text-[13px] font-bold text-black/50 uppercase tracking-widest ml-4 mb-[-12px]">Active Sessions</p>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5 flex flex-col">
        <span className="text-[16px] font-bold text-black">Whale Chat Web</span>
        <span className="text-[13px] text-black/50">macOS • Chrome</span>
        <span className="text-[13px] text-black/40 mt-1">Active 2 days ago</span>
      </div>

      <button className="w-full py-3 rounded-xl bg-red-50 text-red-500 font-bold text-[16px] mt-4">
        Terminate All Other Sessions
      </button>
    </div>
  );
}

// ─── 11. CHAT FOLDERS VIEW ─────────────────────────────────────────────────
function ChatFoldersView() {
  return (
    <div className="w-full max-w-lg mx-auto py-6 px-4 flex flex-col gap-6">
      <div className="w-full flex justify-center mb-4">
        <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center">
          <Folder size={40} className="text-indigo-500" />
        </div>
      </div>
      <p className="text-[14px] text-black/60 text-center mb-2 px-4">Create folders for different groups of chats and quickly switch between them.</p>

      <button className="w-full py-3 rounded-2xl bg-[#1c7aff] text-white font-bold text-[16px] shadow-sm">
        Create a Folder
      </button>

      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5 mt-4">
        <div className="w-full flex items-center justify-between px-4 py-3 bg-white border-b border-black/5">
          <span className="text-[16px] font-medium text-black">All Chats</span>
          <Check size={18} className="text-[#1c7aff]" />
        </div>
        <ToggleRow label="Show Folder Tags" defaultOn border={false} />
      </div>
    </div>
  );
}

// ─── 12. APPEARANCE VIEW ───────────────────────────────────────────────────
function AppearanceView() {
  return (
    <div className="w-full max-w-lg mx-auto py-6 px-4 flex flex-col gap-6">
      <p className="text-[13px] font-bold text-black/50 uppercase tracking-widest ml-4 mb-[-12px]">Color Theme</p>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5 grid grid-cols-4 gap-4">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-[#1c7aff] ring-2 ring-offset-2 ring-[#1c7aff]" />
          <span className="text-[11px] font-medium text-black">Classic</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-black" />
          <span className="text-[11px] font-medium text-black">Dark</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-purple-500" />
          <span className="text-[11px] font-medium text-black">Purple</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-emerald-500" />
          <span className="text-[11px] font-medium text-black">Nature</span>
        </div>
      </div>

      <p className="text-[13px] font-bold text-black/50 uppercase tracking-widest ml-4 mb-[-12px]">Text Size</p>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5 flex items-center gap-4">
        <span className="text-sm font-medium">A</span>
        <input type="range" className="flex-1" min="1" max="5" defaultValue="3" />
        <span className="text-xl font-medium">A</span>
      </div>

      <p className="text-[13px] font-bold text-black/50 uppercase tracking-widest ml-4 mb-[-12px]">Chat Background</p>
      <button className="w-full py-3 rounded-2xl bg-white border border-black/5 text-[#1c7aff] font-bold text-[16px] shadow-sm">
        Change Chat Wallpaper
      </button>
    </div>
  );
}

// ─── 13. LANGUAGE VIEW ─────────────────────────────────────────────────────
function LanguageView() {
  const languages = ['English', 'Spanish (Español)', 'French (Français)', 'German (Deutsch)', 'Italian (Italiano)', 'Portuguese (Português)', 'Russian (Русский)', 'Chinese (中文)', 'Japanese (日本語)'];
  
  return (
    <div className="w-full max-w-lg mx-auto py-6 px-4 flex flex-col gap-6">
      <div className="w-full relative mb-2">
        <input type="text" placeholder="Search Languages" className="w-full bg-black/5 rounded-[10px] py-2 px-4 text-[15px] text-black placeholder:text-black/30 outline-none" />
      </div>

      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5">
        {languages.map((lang, i) => (
          <div key={lang} className={`w-full flex items-center justify-between px-4 py-3 bg-white ${i !== languages.length -1 ? 'border-b border-black/5' : ''}`}>
            <span className="text-[16px] font-medium text-black">{lang}</span>
            {i === 0 && <Check size={18} className="text-[#1c7aff]" />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── UTILS ──────────────────────────────────────────────────────────────────
function ToggleRow({ label, defaultOn = false, border = true }: any) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className={`w-full flex items-center justify-between px-4 py-3 bg-white ${border ? 'border-b border-black/5' : ''}`}>
      <span className="text-[16px] text-black">{label}</span>
      <button 
        onClick={() => setOn(!on)}
        className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${on ? 'bg-[#34c759]' : 'bg-gray-300'}`}
      >
        <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${on ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}
