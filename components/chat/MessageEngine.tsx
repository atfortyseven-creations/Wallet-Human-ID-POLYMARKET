'use client';

import React, { useRef, useState, useCallback } from 'react';
import {
  Pin, Trash2, Copy, Reply, Forward, Timer,
  CheckCheck, Check, ShieldCheck, Flame,
  FileText, Download, Image as ImageIcon, Video, Music, Paperclip
} from 'lucide-react';
import { toast } from 'sonner';
import { useSystemFormatter } from '@/hooks/useSystemFormatter';

import type { ChatSettings } from '@/components/chat/AdvancedSettingsModal';

export interface Reaction { emoji: string; count: number; reacted: boolean };

export interface RenderableMessage {
  id: string;
  senderAddress: string;
  content: string;                 // decrypted text or [VOICE] / [FILE:name]
  sentAt: number;                  // unix ms
  isMine: boolean;
  isPinned: boolean;
  isDestructing: boolean;
  destructsAt?: number;            // unix ms
  readAt?: number;                 // unix ms (undefined = not read)
  reactions: Reaction[];
  replyToId?: string;
  attestationScore?: number;       // 0100 whale score
}

export interface MessageEngineProps {
  messages: RenderableMessage[];
  onReact:  (messageId: string, emoji: string) => void;
  onPin:    (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onReply:  (messageId: string) => void;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  settings?: ChatSettings;
}

import { motion, AnimatePresence } from 'framer-motion';

//  Constants 

const QUICK_REACTIONS = ['', '', '', '', '', '️', '', ''];

//  Component 

export default function MessageEngine({
  messages, onReact, onPin, onDelete, onReply, bottomRef, settings
}: MessageEngineProps) {
  const [menuState, setMenuState] = useState<{ id: string; content: string; x: number; y: number } | null>(null);
  const { formatDate } = useSystemFormatter();

  const openMenu = useCallback((e: React.MouseEvent | React.TouchEvent, id: string, content: string) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuState({ id, content, x: rect.left, y: rect.top });
  }, []);

  const closeMenu = () => setMenuState(null);

  return (
    <div className="flex-1 overflow-y-auto overscroll-y-contain touch-pan-y px-6 py-4 space-y-1" onClick={closeMenu}>
      <AnimatePresence initial={false}>
      {(() => {
        let lastDate = '';
        return messages
          .filter(msg => !(typeof msg.content === 'string' && msg.content.includes('initiatedByInboxId')))
          .map((msg, index) => {
            const dateStr = formatDate(msg.sentAt);
            const showDate = dateStr !== lastDate;
            lastDate = dateStr;
            const replyToMsg = msg.replyToId ? messages.find(m => m.id === msg.replyToId) : undefined;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {showDate && (
                  <div className="flex justify-center my-6">
                    <div className="bg-black/[0.03] border border-black/[0.06] px-4 py-1.5 rounded-full shadow-sm">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-black/50">{dateStr}</span>
                    </div>
                  </div>
                )}
                <MessageBubble
                  msg={msg}
                  replyToMsg={replyToMsg}
                  onContextMenu={(e) => openMenu(e, msg.id, msg.content)}
                  onReact={onReact}
                  settings={settings}
                />
              </motion.div>
            );
          });
      })()}
      </AnimatePresence>
      <div ref={bottomRef} className="h-4" />

      {/* Floating Context Menu */}
      {menuState && (
        <ContextMenu
          messageId={menuState.id}
          content={menuState.content}
          x={menuState.x}
          y={menuState.y}
          onReact={(emoji) => { onReact(menuState.id, emoji); closeMenu(); }}
          onPin={() => { onPin(menuState.id); closeMenu(); }}
          onDelete={() => { onDelete(menuState.id); closeMenu(); }}
          onReply={() => { onReply(menuState.id); closeMenu(); }}
          onClose={closeMenu}
        />
      )}
    </div>
  );
}

//  MessageBubble 

function MessageBubble({ msg, replyToMsg, onContextMenu, onReact, settings }: {
  msg: RenderableMessage;
  replyToMsg?: RenderableMessage;
  onContextMenu: (e: React.MouseEvent) => void;
  onReact: (id: string, emoji: string) => void;
  settings?: ChatSettings;
}) {
  const { formatTime } = useSystemFormatter();
  const now = Date.now();
  const secondsLeft = msg.destructsAt ? Math.max(0, Math.round((msg.destructsAt - now) / 1000)) : null;

  const match = typeof msg.content === 'string' ? msg.content.match(/^\[ATTACHMENT:([^\]]*)\](.*?)\|(.*)$/is) : null;
  const attachment = match ? { mime: match[1] || 'application/octet-stream', url: match[2], name: match[3] } : null;

  const locMatch = typeof msg.content === 'string' ? msg.content.match(/^\[LOCATION\]([^|]*)(?:\|(\d+))?$/) : null;
  const isLocation = !!locMatch;
  const durationMs = locMatch && locMatch[2] ? parseInt(locMatch[2], 10) : 0;
  const expiryTimestamp = durationMs > 0 ? msg.sentAt + durationMs : 0;

  return (
    <div className={`flex flex-col max-w-[75%] ${msg.isMine ? 'self-end items-end ml-auto' : 'self-start items-start'}`}>

      {/* Pin indicator */}
      {msg.isPinned && (
        <div className="flex items-center gap-1 text-[9px] font-mono text-black/30 mb-1 px-1">
          <Pin size={9} /> Pinned
        </div>
      )}

      {/* Bubble */}
      <div
        onContextMenu={onContextMenu}
        data-bubble-mine={msg.isMine ? '' : undefined}
        data-bubble-peer={!msg.isMine ? '' : undefined}
        className={`relative group px-4 py-3 rounded-2xl cursor-default select-text transition-all backdrop-blur-md border ${
          msg.isMine
            ? 'bg-black/90 text-white border-black/20 rounded-br-sm shadow-[0_4px_24px_rgba(0,0,0,0.12)]'
            : 'bg-white/80  border-black/10  text-black  rounded-bl-sm shadow-[0_4px_24px_rgba(0,0,0,0.04)]'
        } ${msg.isDestructing ? 'opacity-60' : ''}`}
      >
        {/* Reply Quote preview inside bubble */}
        {replyToMsg && (
          <div className={`mb-2 pl-2 border-l-2 text-[11px] font-mono leading-snug rounded p-1.5 flex flex-col gap-0.5 max-w-[280px] ${
            msg.isMine 
              ? 'border-white/30 text-white/75 bg-white/10' 
              : 'border-black/20  text-black/60  bg-black/[0.03] '
          }`}>
            <span className="font-bold text-[9px] uppercase tracking-wider opacity-60">
              {replyToMsg.isMine ? 'You' : 'Peer Address'}
            </span>
            <span className="truncate block">
              {replyToMsg.content.includes('[ATTACHMENT:') ? ' Attachment' : replyToMsg.content}
            </span>
          </div>
        )}

        {/* Attestation badge */}
        {msg.attestationScore && msg.attestationScore >= 95 && (
          <div className="flex items-center gap-1 text-[9px] font-mono text-white/50 mb-2">
            <ShieldCheck size={10} /> ZK-VERIFIED · {msg.attestationScore}
          </div>
        )}

        {attachment ? (
          <AttachmentRenderer attachment={attachment} isMine={msg.isMine} />
        ) : isLocation && locMatch ? (
          <LocationBubble
            coords={locMatch[1]}
            expiryTimestamp={expiryTimestamp}
            isMine={msg.isMine}
          />
        ) : (
          <p className="leading-relaxed break-words whitespace-pre-wrap font-mono" style={{ fontSize: ((settings?.textSize ?? 4) * 2 + 6) + 'px' }}>
            {settings?.privacyMode === 'stealth' ? msg.content.replace(/[a-zA-Z0-9]/g, '*') : msg.content}
          </p>
        )}

        {secondsLeft !== null && (
          <div className="flex items-center gap-1 mt-2 text-[9px] font-mono text-red-400">
            <Flame size={10} /> {secondsLeft}s
          </div>
        )}
      </div>

      {/* Reactions row */}
      {msg.reactions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1 px-1">
          {msg.reactions.map(r => (
            <button
              key={r.emoji}
              onClick={() => onReact(msg.id, r.emoji)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border transition-all ${
                r.reacted
                  ? 'bg-black/8 border-black/20 text-black'
                  : 'bg-black/[0.02] border-black/8 text-black/50 hover:border-black/20'
              }`}
            >
              {r.emoji} <span className="font-mono text-[10px]">{r.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Timestamp + read receipt */}
      <div data-chat-meta className="flex items-center gap-1.5 mt-1 px-1 text-[9px] font-mono text-black/30">
        {settings?.privacyMode !== 'stealth' && formatTime(msg.sentAt)}
        {msg.isMine && settings?.showReadReceipts !== false && (
          (msg.readAt || (now - msg.sentAt > 2500))
            ? <CheckCheck size={13} className="text-blue-500" />
            : <Check size={13} className="text-black/30" />
        )}
      </div>
    </div>
  );
}

//  AttachmentRenderer 

function AttachmentRenderer({ attachment, isMine }: { attachment: { mime: string, url: string, name: string }, isMine: boolean }) {
  const { mime, url, name } = attachment;
  const ext = name.split('.').pop()?.toLowerCase() || '';
  const isImg = mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
  const isVid = mime.startsWith('video/') || ['mp4', 'webm', 'mov', 'mkv'].includes(ext);
  const isAud = mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a'].includes(ext);

  if (isImg) {
    return (
      <div className="mt-1 relative group cursor-pointer overflow-hidden rounded-xl border border-white/10 shadow-sm">
        <a href={url} target="_blank" rel="noopener noreferrer" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={name} className="max-w-[240px] md:max-w-[320px] max-h-[300px] object-cover transition-transform duration-300 group-hover:scale-105" />
        </a>
      </div>
    );
  }

  if (isVid) {
    return (
      <div className="mt-1 relative w-full max-w-[260px] md:max-w-[320px] overflow-hidden rounded-xl border border-white/10 shadow-sm bg-black">
        <video src={url} controls controlsList="nodownload" playsInline className="w-full max-h-[300px] object-contain" />
      </div>
    );
  }

  if (isAud) {
    return (
      <div className={`mt-1 flex items-center p-2 rounded-xl shadow-sm border ${isMine ? 'bg-white/10 border-white/20' : 'bg-black/5 border-black/10'}`}>
        <audio src={url} controls className="h-10 w-[200px] md:w-[260px]" />
      </div>
    );
  }

  // Generic document (PDF, Word, etc.)
  return (
    <a
      href={url}
      download={name}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-3 p-3 mt-1 rounded-xl border transition-all hover:opacity-80 ${
        isMine ? 'bg-white/10 border-white/20' : 'bg-black/5 border-black/10'
      }`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isMine ? 'bg-white/20' : 'bg-black/10'}`}>
        <FileText size={18} className={isMine ? 'text-white' : 'text-black'} />
      </div>
      <div className="flex-1 min-w-0 overflow-hidden">
        <p className="font-mono text-[12px] font-bold truncate" title={name}>{name}</p>
        <p className={`font-mono text-[9px] uppercase mt-0.5 ${isMine ? 'text-white/60' : 'text-black/50'}`}>
          {mime.split('/')[1]?.toUpperCase() || 'DOCUMENT'}
        </p>
      </div>
      <Download size={16} className={isMine ? 'text-white/70' : 'text-black/50'} />
    </a>
  );
}

//  ContextMenu 

function ContextMenu({ messageId, content, x, y, onReact, onPin, onDelete, onReply, onClose }: {
  messageId: string;
  content: string;
  x: number; y: number;
  onReact: (emoji: string) => void;
  onPin: () => void;
  onDelete: () => void;
  onReply: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed z-[300] bg-white border border-black/8 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-3 w-[260px] flex flex-col gap-1"
      style={{ top: Math.min(y, window.innerHeight - 280), left: Math.min(x, window.innerWidth - 280) }}
      onClick={e => e.stopPropagation()}
    >
      {/* Quick reactions */}
      <div className="flex gap-1 flex-wrap pb-3 border-b border-black/6 mb-1">
        {QUICK_REACTIONS.map(e => (
          <button
            key={e}
            onClick={() => onReact(e)}
            className="w-9 h-9 rounded-xl text-[18px] hover:bg-black/5 flex items-center justify-center transition-colors"
          >
            {e}
          </button>
        ))}
      </div>

      {[
        { icon: Reply,   label: 'Reply',        action: onReply  },
        { icon: Pin,     label: 'Pin Message',  action: onPin    },
        { icon: Copy,    label: 'Copy Text',    action: () => {
          try {
            navigator.clipboard.writeText(content);
            toast.success('Message text copied to clipboard.');
          } catch (err) {
            toast.error('Failed to copy message text.');
          }
          onClose();
        } },
        { icon: Forward, label: 'Forward',      action: () => {
          toast.info('Forwarding is disabled for secure end-to-end encrypted ZK messages.');
          onClose();
        } },
        { icon: Trash2,  label: 'Delete',       action: onDelete, danger: true },
      ].map(({ icon: Icon, label, action, danger }) => (
        <button
          key={label}
          onClick={action}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-mono transition-all ${
            danger ? 'text-red-500 hover:bg-red-50' : 'text-black/60 hover:bg-black/[0.04] hover:text-black'
          }`}
        >
          <Icon size={15} />{label}
        </button>
      ))}
    </div>
  );
}

function LocationBubble({
  coords,
  expiryTimestamp,
  isMine
}: {
  coords: string;
  expiryTimestamp: number;
  isMine: boolean;
}) {
  const [timeText, setTimeText] = useState<string>('');
  const [isExpired, setIsExpired] = useState<boolean>(false);

  React.useEffect(() => {
    if (expiryTimestamp === 0) {
      setTimeText('Ubicación Permanente');
      setIsExpired(false);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = expiryTimestamp - now;
      if (diff <= 0) {
        setTimeText('Ubicación Expirada');
        setIsExpired(true);
      } else {
        const totalSecs = Math.floor(diff / 1000);
        const hours = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;
        
        if (hours > 0) {
          setTimeText(`Expira en ${hours}h ${mins}m`);
        } else if (mins > 0) {
          setTimeText(`Expira en ${mins}m ${secs}s`);
        } else {
          setTimeText(`Expira en ${secs}s`);
        }
        setIsExpired(false);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiryTimestamp]);

  if (isExpired) {
    return (
      <div className={`mt-1 p-3 rounded-xl border ${isMine ? 'bg-white/5 border-white/10 opacity-50' : 'bg-black/[0.02] border-black/5 opacity-50'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-black/10 ">
            
          </div>
          <div>
            <p className={`font-mono text-[12px] font-bold ${isMine ? 'text-white/60' : 'text-black/60'}`}>Ubicación Expirada</p>
            <p className={`font-mono text-[9px] uppercase mt-0.5 ${isMine ? 'text-white/40' : 'text-black/40'}`}>{timeText}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`mt-1 relative group cursor-pointer overflow-hidden rounded-xl shadow-sm border ${isMine ? 'border-white/10' : 'border-black/5'}`}>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coords)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`block p-3 transition-colors ${isMine ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isMine ? 'bg-white/20' : 'bg-black/10'}`}>
            
          </div>
          <div>
            <p className={`font-mono text-[12px] font-bold ${isMine ? 'text-white' : 'text-black'}`}>Ubicación Exacta</p>
            <p className={`font-mono text-[9px] uppercase mt-0.5 tracking-wider ${isMine ? 'text-white/60' : 'text-black/50'}`}>{timeText}</p>
          </div>
        </div>
      </a>
    </div>
  );
}
