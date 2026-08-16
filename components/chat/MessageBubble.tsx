"use client";

import React, { useState } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { Smile, Clock, MapPin } from 'lucide-react';
// import { CustomAudioPlayer } from './CustomAudioPlayer'; // Assuming it's in the same folder or we adjust

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
}

export const MessageBubble = React.memo(({
  msg,
  isMe,
  showDate,
  dateStr,
  isSecretChat,
  fontFamily,
  fontSizePx,
  clientInboxId,
  onReply,
  onReact,
  onContextMenu,
  onOpenLightbox,
  formatMessagePreview
}: MessageProps) => {
  const controls = useAnimation();
  const [showReactions, setShowReactions] = useState(false);

  const sentTime = typeof msg.sentAtNs === 'number' ? new Date(msg.sentAtNs) : (msg.sent || msg.sentAt || new Date());
  
  const isBurning = !!msg.burnAtNs;
  const secondsLeft = isBurning ? Math.max(0, Math.ceil((msg.burnAtNs - Date.now()) / 1000)) : null;

  let content = typeof msg.content === 'string' ? msg.content : (msg.fallback || 'Encrypted Data');
  
  let replyMsg = null;
  if (typeof content === 'string' && content.startsWith('__REPLY__')) {
    const parts = content.split('__::');
    if (parts.length >= 2) {
      const replyToId = parts[0].replace('__REPLY__', '');
      content = parts.slice(1).join('__::');
      replyMsg = { id: replyToId, content: "Replied Message" };
    }
  }

  const isLocation = content.startsWith('[LOCATION]');
  const locationCoords = isLocation ? content.slice('[LOCATION]'.length) : null;
  
  const attachmentMatch = typeof content === 'string' ? content.match(/^\[ATTACHMENT:([^\]]*)\](.*?)\|(.*)$/is) : null;
  const attachment = attachmentMatch ? { mime: attachmentMatch[1] || 'application/octet-stream', url: attachmentMatch[2], name: attachmentMatch[3] } : null;

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.x < -50) {
      onReply(msg);
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
    }
    controls.start({ x: 0, transition: { type: "spring", stiffness: 400, damping: 30 } });
  };

  return (
    <React.Fragment>
      {showDate && (
        <div className="flex justify-center my-3">
          <span className="px-3 py-1 bg-black/5 rounded-full text-[9px] font-mono font-bold text-black/40 uppercase tracking-widest shadow-sm">
            {dateStr}
          </span>
        </div>
      )}
      
      <div className={`flex flex-col relative w-full ${isMe ? 'items-end' : 'items-start'}`}>
        <motion.div 
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={{ left: 0.2, right: 0 }}
          onDragEnd={handleDragEnd}
          animate={controls}
          className={`flex flex-col max-w-[80%] group relative ${isMe ? 'items-end' : 'items-start'}`}
          onContextMenu={(e) => { e.preventDefault(); onContextMenu(e, msg.id, content); }}
        >
          {isLocation && locationCoords ? (
            <div className={`px-4 py-3 rounded-2xl flex flex-col gap-2 relative z-20 shadow-sm ${isMe ? 'bg-[#050505] text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}>
              <div className="flex items-center gap-2">
                 <MapPin size={14} className={isMe ? 'text-white/70' : 'text-black'} />
                 <span className="text-[10px] font-mono uppercase font-bold">Real-time Location</span>
              </div>
              <a href={`https://www.google.com/maps?q=${locationCoords}`} target="_blank" rel="noopener noreferrer" className={`text-[11px] underline mt-1 font-mono ${isMe ? 'text-white/80' : 'text-black'}`}>
                Open in Maps ({locationCoords})
              </a>
            </div>
          ) : attachment ? (
            <div className={`mt-1 overflow-hidden rounded-xl border shadow-sm ${isMe ? 'border-transparent bg-black' : 'border-transparent bg-white'}`}>
              {attachment.mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(attachment.name.split('.').pop()?.toLowerCase() || '') ? (
                <button type="button" onClick={() => onOpenLightbox(attachment.url)} className="block p-1">
                  <img src={attachment.url} alt={attachment.name} className="max-w-[240px] max-h-[300px] object-cover rounded-xl" />
                </button>
              ) : attachment.mime.startsWith('video/') || ['mp4', 'webm', 'mov'].includes(attachment.name.split('.').pop()?.toLowerCase() || '') ? (
                <video src={attachment.url} controls className="max-w-[260px] max-h-[300px] object-contain bg-black" />
              ) : (
                <a href={attachment.url} download={attachment.name} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 px-4 py-3 ${isMe ? 'text-white' : 'text-gray-900'}`}>
                   <span className="font-mono text-[11px] underline break-all line-clamp-2">{attachment.name}</span>
                </a>
              )}
            </div>
          ) : (
            <div className="relative">
              <div className={`relative z-20 px-4 py-2.5 rounded-2xl shadow-sm border flex flex-col min-w-0 break-words ${
                isMe ? 'bg-[#050505] text-[#f5f5f7] border-transparent rounded-br-sm' : 'bg-white text-[#050505] border-black/5 rounded-bl-sm'
              }`}>
                {replyMsg && (
                   <div className={`text-[11px] mb-1.5 pl-2 border-l-2 py-0.5 max-w-[200px] ${isMe ? 'border-white/20 text-white/60' : 'border-black/20 text-black/60'}`}>
                      <p className="font-bold mb-0.5">Replying to</p>
                      <p className="truncate opacity-80">{formatMessagePreview(replyMsg.content)}</p>
                   </div>
                )}
                {content.startsWith('[GIF]') ? (
                  <img src={content.slice(5)} alt="gif" className="rounded-xl max-w-[200px] mt-1" />
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {content}
                    {msg.edited && <span className="text-[10px] opacity-70 ml-1.5 italic">(edited)</span>}
                  </p>
                )}
                
                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5 -ml-1 relative z-10">
                    {Object.entries(msg.reactions).map(([emoji, users]: [string, any]) => (
                      <button 
                        key={emoji} 
                        onClick={() => onReact(msg.id, emoji)}
                        className={`text-[12px] px-1.5 py-0.5 rounded-full flex items-center gap-1 transition-all ${users.includes(clientInboxId || 'me') ? 'bg-[#050505]/20 border-black/20' : 'bg-black/5 hover:bg-black/10'} border shadow-sm`}
                      >
                        <span>{emoji}</span>
                        {users.length > 1 && <span className="font-bold font-mono text-[10px] opacity-70">{users.length}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="absolute top-1/2 -translate-y-1/2 -right-16 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-10">
                {isBurning && (
                   <span className="mr-1 text-[10px] font-mono font-bold text-[#050505] bg-[#f5f5f7] px-1.5 py-0.5 rounded shadow-sm border border-black/10">{secondsLeft}s</span>
                )}
                <button
                  onClick={() => onReply(msg)}
                  className="p-1.5 hover:bg-black/5 rounded-full text-black/40 hover:text-black transition-colors bg-white/50 backdrop-blur-sm shadow-sm border border-black/5"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path></svg>
                </button>
              </div>
            </div>
          )}

          <div className={`text-[9px] text-black/25 mt-1 px-1 font-mono flex items-center gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
            {new Date(sentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {isMe && (
              <span className={`text-[12px] -mt-0.5 ${msg.status === 'read' ? 'text-blue-500' : 'text-black/40'}`}>
                {msg.status === 'scheduled' ? <Clock size={10} className="inline ml-0.5 mb-0.5 text-orange-400" /> : msg.status === 'read' ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </React.Fragment>
  );
});
