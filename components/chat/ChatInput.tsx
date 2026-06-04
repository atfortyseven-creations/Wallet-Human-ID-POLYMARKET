'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Paperclip, Smile, Mic, Timer,
  X, Reply, Square, Flame, MapPin
} from 'lucide-react';
import { useSystemAccount } from '@/hooks/useSystemAccount';

export type AutoDestructPreset = 'off' | '1m' | '1h' | '24h' | '7d';

interface ChatInputProps {
  onSendText:    (text: string) => void;
  onSendVoice:   (blob: Blob, durationMs: number) => void;
  onSendFile:    (file: File) => void;
  onSendEmoji:   (emoji: string) => void;
  onTyping?:     (typing: boolean) => void;
  replyingTo?:   { id: string; preview: string };
  onCancelReply: () => void;
  autoDestruct:  AutoDestructPreset;
  onAutoDestructChange: (val: AutoDestructPreset) => void;
  disabled?: boolean;
}

const EMOJI_GRID = [
  '','','','','','','','',
  '','','','','','','','',
  '','','','','️','','','',
];

const LOCATION_DURATION_OPTS = [
  { value: 300000, label: '5 Minutos' },
  { value: 3600000, label: '1 Hora' },
  { value: 86400000, label: '24 Horas' },
  { value: 0, label: 'Permanente' },
];

// Pick best supported mime type
function getSupportedMimeType(): string {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4',
    '',
  ];
  for (const t of types) {
    if (!t || MediaRecorder.isTypeSupported(t)) return t;
  }
  return '';
}

export default function ChatInput({
  onSendText, onSendVoice, onSendFile, onSendEmoji, onTyping,
  replyingTo, onCancelReply, autoDestruct, onAutoDestructChange, disabled = false,
}: ChatInputProps) {
  const { address } = useSystemAccount();
  const walletKey = address ? address.toLowerCase() : 'guest';

  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showDestruct, setShowDestruct] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingMs, setRecordingMs] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [showLocationSelect, setShowLocationSelect] = useState(false);
  const [isRetrievingLocation, setIsRetrievingLocation] = useState(false);
  const [preferredDuration, setPreferredDuration] = useState<number>(300000); // default 5 minutes

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const key = `preferred_location_duration_${walletKey}`;
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        setPreferredDuration(parseInt(saved, 10));
      }
    }
  }, [walletKey]);

  const inputRef    = useRef<HTMLTextAreaElement>(null);
  const mediaRef    = useRef<MediaRecorder | null>(null);
  const chunksRef   = useRef<BlobPart[]>([]);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationRef = useRef<number>(0); //  fix: use ref so onstop always has latest value
  const fileRef     = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 140) + 'px';
    }
  }, [text]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSendText(trimmed);
    setText('');
    inputRef.current?.focus();
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const triggerLocationSend = (durationMs: number) => {
    if (disabled) return;
    setIsRetrievingLocation(true);

    const saveToCache = (lat: number, lon: number) => {
      try {
        localStorage.setItem('last_known_system_location', JSON.stringify({
          lat,
          lon,
          timestamp: Date.now()
        }));
      } catch (e) {}
    };

    const getFromCache = () => {
      try {
        const cached = localStorage.getItem('last_known_system_location');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < 86400000) {
            return parsed;
          }
        }
      } catch (e) {}
      return null;
    };

    const fetchIP1 = async () => {
      const res = await fetch('https://ipapi.co/json/');
      if (!res.ok) throw new Error('ipapi.co failed');
      const data = await res.json();
      if (data.latitude && data.longitude) return { lat: data.latitude, lon: data.longitude, source: 'ipapi' };
      throw new Error('Coords missing in ipapi');
    };

    const fetchIP2 = async () => {
      const res = await fetch('https://ip-api.com/json/');
      if (!res.ok) throw new Error('ip-api.com failed');
      const data = await res.json();
      if (data.lat && data.lon) return { lat: data.lat, lon: data.lon, source: 'ip-api' };
      throw new Error('Coords missing in ip-api');
    };

    const fetchIP3 = async () => {
      const res = await fetch('https://ipinfo.io/json');
      if (!res.ok) throw new Error('ipinfo.io failed');
      const data = await res.json();
      if (data.loc) {
        const [latStr, lonStr] = data.loc.split(',');
        const lat = parseFloat(latStr);
        const lon = parseFloat(lonStr);
        if (!isNaN(lat) && !isNaN(lon)) return { lat, lon, source: 'ipinfo' };
      }
      throw new Error('Coords missing in ipinfo');
    };

    const getNativePos = (highAccuracy: boolean): Promise<{ lat: number, lon: number, source: string }> => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation not supported'));
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              lat: pos.coords.latitude,
              lon: pos.coords.longitude,
              source: highAccuracy ? 'native-gps' : 'native-network'
            });
          },
          (err) => reject(err),
          {
            enableHighAccuracy: highAccuracy,
            timeout: highAccuracy ? 3500 : 7000,
            maximumAge: highAccuracy ? 0 : 300000
          }
        );
      });
    };

    (async () => {
      let resolved = false;

      const handleSuccess = (lat: number, lon: number, source: string) => {
        if (resolved) return;
        resolved = true;
        console.log(`[CoreGeo] Resolved via ${source}: ${lat}, ${lon}`);
        saveToCache(lat, lon);
        onSendText(`[LOCATION]${lat},${lon}|${durationMs}`);
        setIsRetrievingLocation(false);
      };

      try {
        const gpsPromise = getNativePos(true);
        const timeoutGps = new Promise<never>((_, rej) => setTimeout(() => rej(new Error('GPS Timeout')), 3500));
        
        const fastGps = await Promise.race([gpsPromise, timeoutGps]);
        handleSuccess(fastGps.lat, fastGps.lon, fastGps.source);
        return;
      } catch (gpsError) {
        console.warn('[CoreGeo] Precise GPS failed or timed out. Racing network and IP targets...', gpsError);
      }

      if (resolved) return;

      try {
        const networkPromise = getNativePos(false);
        const ipPromise1 = fetchIP1();
        const ipPromise2 = fetchIP2();
        const ipPromise3 = fetchIP3();

        const winner = await Promise.any([networkPromise, ipPromise1, ipPromise2, ipPromise3]);
        handleSuccess(winner.lat, winner.lon, winner.source);
        return;
      } catch (raceError) {
        console.error('[CoreGeo] Parallel race failed. Trying last cached position...', raceError);
      }

      if (resolved) return;

      const cached = getFromCache();
      if (cached) {
        handleSuccess(cached.lat, cached.lon, 'cache-fallback');
        return;
      }

      alert("Unable to retrieve your location automatically. Please enable location services or check your browser permissions.");
      setIsRetrievingLocation(false);
    })();
  };

  //  Voice recording 

  const startRecording = async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const mimeType = getSupportedMimeType();
      const opts: MediaRecorderOptions = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(stream, opts);

      chunksRef.current  = [];
      durationRef.current = 0;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        // Use durationRef  immune to stale closure
        const finalMs = durationRef.current;
        stream.getTracks().forEach(t => t.stop());
        if (chunksRef.current.length === 0) return;
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' });
        onSendVoice(blob, finalMs);
        setRecordingMs(0);
        durationRef.current = 0;
      };

      // timeslice=250ms ensures ondataavailable fires regularly
      recorder.start(250);
      mediaRef.current = recorder;
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingMs(p => {
          const next = p + 100;
          durationRef.current = next;
          return next;
        });
      }, 100);
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      if (msg.includes('Permission') || msg.includes('NotAllowed')) {
        setMicError('Microphone access denied. Allow mic in browser settings.');
      } else {
        setMicError('Could not start recording: ' + msg);
      }
    }
  };

  const stopRecording = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (mediaRef.current && mediaRef.current.state !== 'inactive') {
      mediaRef.current.stop();
    }
    setIsRecording(false);
  };

  const cancelRecording = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (mediaRef.current && mediaRef.current.state !== 'inactive') {
      mediaRef.current.ondataavailable = null;
      mediaRef.current.onstop = null;
      mediaRef.current.stop();
      (mediaRef.current as any).stream?.getTracks().forEach((t: MediaStreamTrack) => t.stop());
    }
    chunksRef.current = [];
    durationRef.current = 0;
    setIsRecording(false);
    setRecordingMs(0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onSendFile(file);
    e.target.value = '';
  };

  const formatDuration = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  };

  const DESTRUCT_OPTS: { value: AutoDestructPreset; label: string }[] = [
    { value: 'off', label: 'Off' }, { value: '1m', label: '1 min' },
    { value: '1h', label: '1 hr' }, { value: '24h', label: '24 hrs' }, { value: '7d', label: '7 d' },
  ];

  return (
    <div className="border-t border-black/6 bg-white px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shrink-0">

      {/* Reply indicator */}
      {replyingTo && (
        <div className="flex items-center justify-between bg-black/[0.03] border border-black/8 rounded-xl px-4 py-2 mb-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <Reply size={13} className="text-black/40 shrink-0" />
            <p className="text-[11px] font-mono text-black/50 truncate">{replyingTo.preview}</p>
          </div>
          <button onClick={onCancelReply} className="text-black/30 hover:text-black transition-colors">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Auto-destruct indicator (removed) */}

      {/* Mic error */}
      {micError && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-2 mb-2">
          <p className="text-[11px] font-mono text-red-600 flex-1">{micError}</p>
          <button onClick={() => setMicError(null)}><X size={13} className="text-red-400" /></button>
        </div>
      )}

      {/* Recording UI */}
      {isRecording ? (
        <div className="flex items-center gap-3">
          <button onClick={cancelRecording} className="text-black/30 hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
          <div className="flex-1 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono text-[13px] text-black font-bold">{formatDuration(recordingMs)}</span>
            <span className="font-mono text-[10px] text-black/35 ml-auto">Recording</span>
          </div>
          <button
            onClick={stopRecording}
            className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-white shadow"
          >
            <Square size={18} fill="white" />
          </button>
        </div>
      ) : (
        <div className="flex items-end gap-2">
          {/* File picker */}
          <input ref={fileRef} type="file" className="hidden" onChange={handleFileChange} />
          <button
            onClick={() => fileRef.current?.click()}
            title="Attach file"
            className="w-[50px] h-[50px] rounded-2xl bg-[#F5F5F5] border border-black/[0.04] flex items-center justify-center text-black/40 hover:text-black hover:bg-black/[0.06] transition-all shrink-0"
          >
            <Paperclip size={20} />
          </button>
          
          <button
            onClick={() => {
              if (isRetrievingLocation) return;
              setShowLocationSelect(p => !p);
              setShowEmoji(false);
              setShowDestruct(false);
            }}
            title="Share Location"
            className={`w-[50px] h-[50px] rounded-2xl border transition-all flex items-center justify-center shrink-0 ${
              showLocationSelect
                ? 'bg-black text-white border-black'
                : 'bg-[#F5F5F5] border-black/[0.04] text-black/40 hover:text-black hover:bg-black/[0.06]'
            }`}
            disabled={isRetrievingLocation || disabled}
          >
            {isRetrievingLocation ? (
              <div className="w-4 h-4 rounded-full border-2 border-black/25 border-t-black animate-spin" />
            ) : (
              <MapPin size={20} />
            )}
          </button>

          {/* Textarea Container */}
          <div className="flex-1 relative bg-[#F5F5F5] border border-black/[0.04] rounded-2xl min-h-[50px] flex items-end">
            <textarea
              ref={inputRef}
              value={text}
              onChange={e => {
                setText(e.target.value);
                onTyping?.(e.target.value.length > 0);
              }}
              onKeyDown={handleKey}
              disabled={disabled}
              placeholder={disabled ? 'Connection unavailable' : 'Encrypted message'}
              rows={1}
              className="w-full bg-transparent px-4 py-[14px] text-[15px] font-mono text-black resize-none focus:outline-none placeholder:text-black/30 transition-colors pr-[15px] leading-relaxed disabled:opacity-40"
            />
          </div>

          {/* Send / Mic */}
          {text.trim() ? (
            <button
              onClick={handleSend}
              disabled={disabled}
              className="w-[50px] h-[50px] rounded-2xl bg-black flex items-center justify-center text-white disabled:opacity-30 hover:bg-black/80 transition-all shrink-0 shadow-md"
            >
              <Send size={18} className="ml-0.5" />
            </button>
          ) : (
            <button
              onClick={startRecording}
              title="Record voice"
              className="w-[50px] h-[50px] rounded-2xl bg-[#F5F5F5] border border-black/[0.04] flex items-center justify-center text-black/40 hover:text-black hover:bg-black/[0.06] transition-all shrink-0"
            >
              <Mic size={22} />
            </button>
          )}
        </div>
      )}

      {/* Self-destruct selector (removed) */}

      {/* Location duration selector */}
      {showLocationSelect && !isRecording && (
        <div className="mt-2 bg-white border border-black/8 rounded-2xl p-3 flex flex-col gap-2 shadow-sm">
          <p className="font-mono text-[10px] text-black/40 uppercase tracking-widest px-1">Duración en pantalla:</p>
          <div className="flex gap-2 flex-wrap">
            {LOCATION_DURATION_OPTS.map(o => (
              <button
                key={o.value}
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.setItem(`preferred_location_duration_${walletKey}`, o.value.toString());
                  }
                  setPreferredDuration(o.value);
                  setShowLocationSelect(false);
                  triggerLocationSend(o.value);
                }}
                className={`px-3 py-1.5 rounded-lg font-mono text-[11px] border transition-all ${
                  preferredDuration === o.value
                    ? 'bg-black text-white border-black'
                    : 'bg-black/[0.03] border-black/8 text-black/50 hover:text-black hover:bg-black/[0.06]'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
