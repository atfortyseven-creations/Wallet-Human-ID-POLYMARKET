"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useAnimation, PanInfo, AnimatePresence } from 'framer-motion';
import { FastForward, MapPin, Clock, PhoneOff, Phone, Video, Check, CheckCheck, Pencil } from 'lucide-react';
import { CustomAudioPlayer } from './CustomAudioPlayer';

export interface MessageProps {
  msg: any;
  isMe: boolean;
  showDate: boolean;
  dateStr: string;
  isSecretChat: boolean;
  fontFamily: string;
  fontSizePx: number;
  clientInboxId: string | undefined;
  onReply: (msg: any) => void;
  onReact: (msgId: string, emoji: string) => void;
  onContextMenu: (e: any, id: string, content: string) => void;
  onOpenLightbox: (url: string) => void;
  formatMessagePreview: (c: string) => string;
  onVotePoll?: (pollId: string, optionIndex: number) => void;
  onEditMsg?: (id: string, currentContent: string) => void;
}

const SPRING = { type: 'spring', stiffness: 480, damping: 34, mass: 0.8 } as const;
const STICKERS = ['🔥','💎','🐋','⚡','🌊','🦋','🌙','✨','🎯','🚀','💫','🎭','🏆','💡','🌍'];
const TAPBACKS = ['❤️', '👍', '👎', '😂', '!!', '?'];

const PollBubble = React.memo(({ content, msg, isMe, onVotePoll, clientInboxId }: {
  content: string; msg: any; isMe: boolean; onVotePoll?: (pollId: string, idx: number) => void; clientInboxId?: string;
}) => {
  const parts = content.replace('__POLL__', '').split('__::');
  // [FIX] Use the deterministic pollId from the payload, not the XMTP message ID, 
  // to avoid orphaned votes when optimistic messages are swapped.
  const pollId = parts[0]; 
  const question = parts[1] || 'Poll';
  const options = (parts[2] || '').split('|').filter(Boolean);
  const votes: Record<string, number> = msg.pollVotes || {};
  const totalVotes = Object.keys(votes).length;
  const myVote = votes[clientInboxId || ''] ?? -1;

  return (
    <div className={`rounded-[18px] overflow-hidden shadow-lg min-w-[220px] max-w-[280px] border ${isMe ? 'bg-[#1c7aff] border-transparent' : 'bg-white border-black/8'}`}>
      <div className="px-4 pt-3 pb-2">
        <p className={`text-[13px] font-semibold leading-tight mb-3 ${isMe ? 'text-white' : 'text-[#1c1c1e]'}`}>{question}</p>
        <div className="flex flex-col gap-1.5">
          {options.map((opt, i) => {
            const count = Object.values(votes).filter(v => v === i).length;
            const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            const isSelected = myVote === i;
            return (
              <button
                key={i}
                onClick={() => onVotePoll?.(pollId, i)}
                className={`relative w-full text-left rounded-full px-3 py-1.5 overflow-hidden transition-all active:scale-[0.97] ${
                  isMe
                    ? isSelected ? 'bg-white/30' : 'bg-white/15 hover:bg-white/25'
                    : isSelected ? 'bg-[#1c7aff]/15 border border-[#1c7aff]/30' : 'bg-[#f2f2f7] hover:bg-[#e8e8ed]'
                }`}
              >
                {totalVotes > 0 && (
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${isMe ? 'bg-white/20' : 'bg-[#1c7aff]/10'}`}
                    style={{ width: `${pct}%` }}
                  />
                )}
                <div className="relative flex items-center justify-between gap-2">
                  <span className={`text-[12px] font-medium ${isMe ? 'text-white' : 'text-[#1c1c1e]'}`}>{opt}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    {isSelected && <Check size={10} className={isMe ? 'text-white' : 'text-[#1c7aff]'} />}
                    {totalVotes > 0 && <span className={`text-[11px] font-mono ${isMe ? 'text-white/70' : 'text-black/40'}`}>{pct}%</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <p className={`text-[10px] mt-2 ${isMe ? 'text-white/50' : 'text-black/30'}`}>{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</p>
      </div>
    </div>
  );
});
PollBubble.displayName = 'PollBubble';

const PaymentBubble = React.memo(({ content, isMe }: { content: string; isMe: boolean }) => {
  const raw = content.replace('__PAYMENT__::', '');
  let amount = '?', recipient = '';
  try {
    const parsed = JSON.parse(raw);
    amount = parsed.amount ?? parsed;
    recipient = parsed.to ? `${String(parsed.to).slice(0, 6)}...${String(parsed.to).slice(-4)}` : '';
  } catch { amount = raw; }
  return (
    <div className={`rounded-[18px] min-w-[180px] overflow-hidden shadow-lg border ${isMe ? 'bg-[#30d158] border-transparent' : 'bg-white border-black/8'}`}>
      <div className="px-4 py-3 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isMe ? 'bg-white/25' : 'bg-[#30d158]/15'}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isMe ? 'white' : '#30d158'} strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          </div>
          <span className={`text-[11px] font-bold uppercase tracking-widest ${isMe ? 'text-white/80' : 'text-[#30d158]'}`}>QD Transfer</span>
        </div>
        <p className={`text-[22px] font-black tracking-tight ${isMe ? 'text-white' : 'text-[#1c1c1e]'}`}>{amount} <span className="text-[14px] font-semibold opacity-70">QDs</span></p>
        {recipient && <p className={`text-[11px] font-mono ${isMe ? 'text-white/60' : 'text-black/40'}`}>→ {recipient}</p>}
      </div>
    </div>
  );
});
PaymentBubble.displayName = 'PaymentBubble';

const CallOfferBubble = React.memo(({ content, isMe }: { content: string; isMe: boolean }) => {
  const isVideo = content.includes(':video');
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-[18px] min-w-[160px] shadow border ${isMe ? 'bg-[#1c7aff] border-transparent' : 'bg-white border-black/8'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isMe ? 'bg-white/20' : 'bg-[#ff3b30]/10'}`}>
        <PhoneOff size={16} className={isMe ? 'text-white' : 'text-[#ff3b30]'} />
      </div>
      <div className="flex flex-col">
        <span className={`text-[13px] font-semibold ${isMe ? 'text-white' : 'text-[#1c1c1e]'}`}>{isVideo ? 'Video Call' : 'Voice Call'}</span>
        <span className={`text-[11px] ${isMe ? 'text-white/50' : 'text-black/30'}`}>Missed</span>
      </div>
    </div>
  );
});
CallOfferBubble.displayName = 'CallOfferBubble';

const StickerBubble = React.memo(({ content }: { content: string }) => {
  const sticker = content.replace('__STICKER__', '');
  // [FIX] Removed nested framer-motion animations. 
  // Nested transforms (scale inside scale) cause massive layout jank on iOS Safari.
  // We let the parent MessageBubble handle the entrance animation cleanly.
  return (
    <div
      className="text-[64px] leading-none select-none cursor-default"
      style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}
    >
      {sticker}
    </div>
  );
});
StickerBubble.displayName = 'StickerBubble';

const IMessageContextMenu = React.memo(({
  isMe, content, onClose, onReply, onEdit, onCopy, onRevoke, msgId
}: {
  isMe: boolean; content: string; msgId: string;
  onClose: () => void; onReply: () => void; onEdit: () => void;
  onCopy: () => void; onRevoke: () => void;
}) => {
  const actions = [
    { label: 'Reply', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>, fn: onReply },
    { label: 'Add Sticker', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>, fn: onClose },
    ...(isMe ? [{ label: 'Undo Send', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>, fn: onRevoke }] : []),
    ...(isMe ? [{ label: 'Edit', icon: <Pencil size={16} />, fn: onEdit }] : []),
    { label: 'Copy', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>, fn: onCopy },
    { label: 'Translate', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 8l6 6"/><path d="M4 14l6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="M22 22l-5-10-5 10"/><path d="M14 18h6"/></svg>, fn: onClose },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: 10 }}
      transition={SPRING}
      className="absolute z-50 w-52 bg-[#1c1c1e]/95 backdrop-blur-2xl rounded-[16px] shadow-2xl overflow-hidden border border-white/10"
      style={{ bottom: '100%', ...(isMe ? { right: 0 } : { left: 0 }), marginBottom: 8 }}
      onClick={e => e.stopPropagation()}
    >
      {actions.map((a, i) => (
        <React.Fragment key={a.label}>
          <button
            onClick={() => { a.fn(); onClose(); }}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/10 transition-colors text-white"
          >
            <span className="text-[15px] font-normal">{a.label}</span>
            <span className="text-white/50">{a.icon}</span>
          </button>
          {i < actions.length - 1 && <div className="h-[0.5px] bg-white/10" />}
        </React.Fragment>
      ))}
    </motion.div>
  );
});
IMessageContextMenu.displayName = 'IMessageContextMenu';

const TapbackPicker = React.memo(({ isMe, onReact, onClose }: {
  isMe: boolean; onReact: (e: string) => void; onClose: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.7, y: 6 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.7, y: 6 }}
    transition={SPRING}
    className="absolute z-50 flex items-center gap-0.5 px-2 py-1.5 bg-[#1c1c1e]/90 backdrop-blur-2xl rounded-full shadow-2xl border border-white/10"
    style={{ bottom: 'calc(100% + 8px)', ...(isMe ? { right: 0 } : { left: 0 }) }}
    onClick={e => e.stopPropagation()}
  >
    {TAPBACKS.map((t, i) => (
      <motion.button
        key={t}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...SPRING, delay: i * 0.03 }}
        onClick={() => { onReact(t); onClose(); }}
        className="w-9 h-9 flex items-center justify-center text-[20px] hover:scale-125 transition-transform active:scale-110"
      >
        {t}
      </motion.button>
    ))}
  </motion.div>
));
TapbackPicker.displayName = 'TapbackPicker';

export const StickerPicker = React.memo(({ onSend, onClose }: {
  onSend: (s: string) => void; onClose: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 16 }}
    transition={SPRING}
    className="absolute bottom-full mb-2 left-0 right-0 bg-white/95 backdrop-blur-2xl border border-black/8 rounded-[20px] shadow-2xl p-3 z-50"
    onClick={e => e.stopPropagation()}
  >
    <div className="flex items-center justify-between mb-2 px-1">
      <span className="text-[11px] font-black uppercase tracking-widest text-black/40">Stickers</span>
      <button onClick={onClose} className="text-black/30 hover:text-black/60 transition-colors">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div className="grid grid-cols-5 gap-1">
      {STICKERS.map(s => (
        <motion.button
          key={s}
          whileHover={{ scale: 1.3 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => { onSend(s); onClose(); }}
          className="w-full aspect-square flex items-center justify-center text-[28px] rounded-xl hover:bg-black/5 transition-colors"
        >
          {s}
        </motion.button>
      ))}
    </div>
  </motion.div>
));
StickerPicker.displayName = 'StickerPicker';

export const MessageBubble = React.memo(({
  msg, isMe, showDate, dateStr, isSecretChat, fontFamily, fontSizePx,
  clientInboxId, onReply, onReact, onContextMenu, onOpenLightbox,
  formatMessagePreview, onVotePoll, onEditMsg,
}: MessageProps) => {
  const controls = useAnimation();
  const [showTapback, setShowTapback] = useState(false);
  const [showCtxMenu, setShowCtxMenu] = useState(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sentTime = typeof msg.sentAtNs === 'number' ? new Date(msg.sentAtNs) : (msg.sent || msg.sentAt || new Date());
  const isBurning = !!msg.burnAtNs;
  const secondsLeft = isBurning ? Math.max(0, Math.ceil((msg.burnAtNs - Date.now()) / 1000)) : null;

  let content = typeof msg.content === 'string' ? msg.content : (msg.fallback || 'Encrypted Data');

  let forwardFrom: string | null = null;
  if (content.startsWith('__FORWARD__')) {
    const p = content.split('__::');
    if (p.length >= 2) { forwardFrom = p[0].replace('__FORWARD__', ''); content = p.slice(1).join('__::'); }
  }

  let replyMsg: { id: string; content: string } | null = null;
  if (content.startsWith('__REPLY__')) {
    const p = content.split('__::');
    if (p.length >= 2) {
      const replyToId = p[0].replace('__REPLY__', '');
      content = p.slice(1).join('__::');
      replyMsg = { id: replyToId, content: 'Replied Message' };
    }
  }

  const isCallOffer  = content.startsWith('__CALL_OFFER__:');
  const isPoll       = content.startsWith('__POLL__');
  const isPayment    = content.startsWith('__PAYMENT__');
  const isSticker    = content.startsWith('__STICKER__');
  const isAudio      = content.startsWith('__AUDIO__');
  const isGif        = content.startsWith('[GIF]');
  const isLocation   = content.startsWith('[LOCATION]');
  const isSystemMsg  = content.startsWith('__PIN__') || content.startsWith('__REVOKE__') || content.startsWith('__READ__');
  const audioSrc     = isAudio ? content.slice('__AUDIO__'.length) : null;
  const gifUrl       = isGif ? content.slice('[GIF]'.length) : null;
  const locationCoords = isLocation ? content.slice('[LOCATION]'.length) : null;
  const attachmentMatch = (!isAudio && !isGif) ? content.match(/^\[ATTACHMENT:([^\]]*)\](.*?)\|(.*)$/is) : null;
  const attachment   = attachmentMatch ? { mime: attachmentMatch[1] || 'application/octet-stream', url: attachmentMatch[2], name: attachmentMatch[3] } : null;

  if (isSystemMsg) return null;

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -50) {
      onReply(msg);
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
    }
    controls.start({ x: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } });
  };

  const handleLongPressStart = () => {
    pressTimer.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(10);
      setShowTapback(true);
    }, 500);
  };

  const handleLongPressEnd = () => { if (pressTimer.current) clearTimeout(pressTimer.current); };

  const handleDoubleTap = () => {
    onReact(msg.id, '❤️');
    if (navigator.vibrate) navigator.vibrate([10, 10, 10]);
  };

  const handleCopy = () => { navigator.clipboard?.writeText(content).catch(() => {}); };
  const handleRevoke = () => { onContextMenu({ type: 'revoke' }, msg.id, content); };
  const handleEdit = () => { onEditMsg?.(msg.id, content); };

  const jumpToReply = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (replyMsg?.id) {
      const el = document.getElementById(`msg-${replyMsg.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-[#1c7aff]/30', 'scale-[1.02]', 'transition-all', 'duration-300');
        setTimeout(() => el.classList.remove('ring-2', 'ring-[#1c7aff]/30', 'scale-[1.02]', 'transition-all', 'duration-300'), 1500);
      }
    }
  };

  useEffect(() => {
    if (!showTapback && !showCtxMenu) return;
    const handler = () => { setShowTapback(false); setShowCtxMenu(false); };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [showTapback, showCtxMenu]);

  return (
    <React.Fragment>
      {showDate && (
        <div className="flex justify-center my-4">
          <span className="px-3 py-1 bg-black/6 rounded-full text-[11px] font-semibold text-black/40 uppercase tracking-widest">{dateStr}</span>
        </div>
      )}

      <AnimatePresence>
        {(showTapback || showCtxMenu) && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={() => { setShowTapback(false); setShowCtxMenu(false); }}
          />
        )}
      </AnimatePresence>

      <motion.div
        id={`msg-${msg.id}`}
        initial={{ opacity: 0, y: isMe ? 6 : -6, x: isMe ? 12 : -12 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ ...SPRING }}
        className={`flex flex-col relative w-full ${isMe ? 'items-end' : 'items-start'} transition-transform duration-200`}
        style={{ marginBottom: 2 }}
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={{ left: 0.2, right: 0 }}
          onDragEnd={handleDragEnd}
          animate={controls}
          className={`flex flex-col relative ${isMe ? 'items-end' : 'items-start'} max-w-[80vw] md:max-w-[65%] min-w-0`}
          style={{ touchAction: 'pan-y', WebkitUserSelect: 'none' } as React.CSSProperties}
          onDoubleClick={handleDoubleTap}
          onTouchStart={handleLongPressStart}
          onTouchEnd={handleLongPressEnd}
          onMouseDown={handleLongPressStart}
          onMouseUp={handleLongPressEnd}
          onMouseLeave={handleLongPressEnd}
          onContextMenu={(e) => { e.preventDefault(); setShowCtxMenu(true); setShowTapback(false); }}
        >
          {forwardFrom && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold font-mono mb-1 text-black/40 px-2">
              <FastForward size={10} /> Forwarded from {forwardFrom.substring(0, 8)}...
            </div>
          )}

          <div className="relative">
            <AnimatePresence>
              {showTapback && (
                <TapbackPicker isMe={isMe} onReact={(e) => onReact(msg.id, e)} onClose={() => setShowTapback(false)} />
              )}
            </AnimatePresence>
            <AnimatePresence>
              {showCtxMenu && (
                <IMessageContextMenu
                  isMe={isMe} content={content} msgId={msg.id}
                  onClose={() => setShowCtxMenu(false)}
                  onReply={() => onReply(msg)}
                  onEdit={handleEdit}
                  onCopy={handleCopy}
                  onRevoke={handleRevoke}
                />
              )}
            </AnimatePresence>

            {isSticker ? (
              <StickerBubble content={content} />
            ) : isPoll ? (
              <PollBubble content={content} msg={msg} isMe={isMe} onVotePoll={onVotePoll} clientInboxId={clientInboxId} />
            ) : isPayment ? (
              <PaymentBubble content={content} isMe={isMe} />
            ) : isCallOffer ? (
              <CallOfferBubble content={content} isMe={isMe} />
            ) : isGif && gifUrl ? (
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => onOpenLightbox(gifUrl)}
                className={`rounded-[18px] overflow-hidden shadow-lg border ${isMe ? 'border-transparent rounded-br-[4px]' : 'border-black/8 rounded-bl-[4px]'}`}
              >
                <img src={gifUrl} alt="GIF" className="max-w-[220px] max-h-[200px] object-cover" loading="lazy" />
              </motion.button>
            ) : isAudio && audioSrc ? (
              <div className={`px-3 py-2 rounded-[18px] shadow border ${isMe ? 'bg-[#1c7aff] border-transparent rounded-br-[4px]' : 'bg-white border-black/8 rounded-bl-[4px]'}`}>
                <CustomAudioPlayer src={audioSrc} isMe={isMe} />
              </div>
            ) : isLocation && locationCoords ? (
              <a
                href={`https://www.google.com/maps?q=${locationCoords}`}
                target="_blank" rel="noopener noreferrer"
                className={`flex items-center gap-2.5 px-4 py-3 rounded-[18px] shadow border ${isMe ? 'bg-[#1c7aff] text-white border-transparent rounded-br-[4px]' : 'bg-white text-[#1c1c1e] border-black/8 rounded-bl-[4px]'}`}
              >
                <MapPin size={16} className={isMe ? 'text-white/80' : 'text-[#ff3b30]'} />
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold">Real-time Location</span>
                  <span className="text-[11px] font-mono opacity-60">{locationCoords}</span>
                </div>
              </a>
            ) : attachment ? (
              <div className={`rounded-[18px] overflow-hidden border shadow ${isMe ? 'bg-[#1c7aff] border-transparent rounded-br-[4px]' : 'bg-white border-black/8 rounded-bl-[4px]'}`}>
                {attachment.mime.startsWith('image/') || ['jpg','jpeg','png','gif','webp'].includes(attachment.name.split('.').pop()?.toLowerCase() || '') ? (
                  <button onClick={() => onOpenLightbox(attachment.url)} className="block">
                    <img src={attachment.url} alt={attachment.name} className="max-w-[220px] max-h-[280px] object-cover" />
                  </button>
                ) : attachment.mime.startsWith('video/') ? (
                  <video src={attachment.url} controls className="max-w-[240px] max-h-[200px] bg-black" />
                ) : (
                  <a href={attachment.url} download={attachment.name} className={`flex items-center gap-2 px-4 py-3 ${isMe ? 'text-white' : 'text-[#1c1c1e]'}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <span className="text-[12px] font-mono underline break-all">{attachment.name}</span>
                  </a>
                )}
              </div>
            ) : (
              <div className="relative">
                {replyMsg && (
                  <button
                    onClick={jumpToReply}
                    className={`flex items-start gap-1.5 mb-1 px-3 py-1.5 rounded-[12px] border max-w-[200px] text-left transition-opacity hover:opacity-70 ${
                      isMe ? 'bg-white/10 border-white/10' : 'bg-black/5 border-black/8'
                    }`}
                  >
                    <div className={`w-0.5 self-stretch rounded-full ${isMe ? 'bg-white/60' : 'bg-[#1c7aff]'}`} />
                    <div className="flex flex-col min-w-0">
                      <p className={`text-[10px] font-bold mb-0.5 ${isMe ? 'text-white/70' : 'text-[#1c7aff]'}`}>Replying to</p>
                      <p className={`text-[11px] truncate ${isMe ? 'text-white/60' : 'text-black/50'}`}>{formatMessagePreview(replyMsg.content)}</p>
                    </div>
                  </button>
                )}
                <div
                  className={`relative px-4 py-2.5 shadow-md ${
                    isMe ? 'rounded-[20px] rounded-br-[5px]' : 'rounded-[20px] rounded-bl-[5px]'
                  }`}
                  style={{
                    background: isMe
                      ? 'linear-gradient(135deg, #1c7aff 0%, #0a5fd8 100%)'
                      : '#e9e9eb',
                  }}
                >
                  <p
                    className={`whitespace-pre-wrap leading-relaxed select-text ${
                      isMe ? 'text-white' : 'text-[#1c1c1e]'
                    }`}
                    style={{ fontSize: `${fontSizePx}px`, fontFamily, WebkitUserSelect: 'text', userSelect: 'text' } as React.CSSProperties}
                  >
                    {content}
                    {msg.edited && (
                      <span className={`text-[9px] ml-1.5 italic ${isMe ? 'text-white/40' : 'text-black/30'}`}>edited</span>
                    )}
                  </p>
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {Object.entries(msg.reactions).map(([emoji, users]: [string, any]) => (
                        <motion.button
                          key={emoji}
                          whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                          onClick={() => onReact(msg.id, emoji)}
                          className={`text-[13px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border transition-all ${
                            users.includes(clientInboxId || '')
                              ? 'bg-[#1c7aff] border-[#1c7aff] text-white'
                              : 'bg-white border-black/10 text-[#1c1c1e]'
                          }`}
                        >
                          <span>{emoji}</span>
                          {users.length > 1 && <span className="text-[10px] font-bold">{users.length}</span>}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
            {isBurning && <span className="text-[9px] font-mono font-bold text-[#ff3b30]">{secondsLeft}s</span>}
            <span className={`text-[11px] ${isMe ? 'text-black/30' : 'text-black/30'}`}>
              {new Date(sentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {isMe && (
              <span className={msg.status === 'read' ? 'text-[#1c7aff]' : 'text-black/25'}>
                {msg.status === 'scheduled'
                  ? <Clock size={10} className="text-orange-400 inline" />
                  : msg.status === 'read'
                    ? <CheckCheck size={12} />
                    : <Check size={12} />}
              </span>
            )}
          </div>
        </motion.div>
      </motion.div>
    </React.Fragment>
  );
});

MessageBubble.displayName = 'MessageBubble';
