import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, PhoneOff, UserPlus, Users, MoreVertical } from 'lucide-react';
import { Participant } from '@/lib/engine/WebRTCEngine';

interface GroupCallRoomProps {
  localStream: MediaStream | null;
  participants: Participant[];
  isMuted: boolean;
  isCameraOff: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onEndCall: () => void;
  onAddParticipant: () => void;
}

const VideoStream = ({ stream, isLocal, muted }: { stream: MediaStream | null; isLocal: boolean; muted: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream || stream.getVideoTracks().length === 0 || stream.getVideoTracks()[0].enabled === false) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a] rounded-2xl overflow-hidden">
         <div className="w-24 h-24 rounded-full bg-[#333] flex items-center justify-center text-white text-3xl font-bold">
           {isLocal ? 'Me' : 'Peer'}
         </div>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={isLocal || muted}
      className={`w-full h-full object-cover rounded-2xl bg-black ${isLocal ? 'scale-x-[-1]' : ''}`}
    />
  );
};

export function GroupCallRoom({
  localStream,
  participants,
  isMuted,
  isCameraOff,
  onToggleMute,
  onToggleCamera,
  onEndCall,
  onAddParticipant,
}: GroupCallRoomProps) {
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const totalParticipants = participants.length + 1; // including local
  const gridCols = totalParticipants === 1 ? 'grid-cols-1' :
                   totalParticipants === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                   totalParticipants <= 4 ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <div className="fixed inset-0 z-[1000] bg-black flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-50 bg-gradient-to-b from-black/80 to-transparent"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                <Users size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Secure Call</h3>
                <p className="text-white/60 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  End-to-End Encrypted
                </p>
              </div>
            </div>
            <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors">
              <MoreVertical size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Grid */}
      <div className="flex-1 p-4 flex items-center justify-center">
        <div className={`w-full h-full max-w-7xl max-h-[80vh] grid ${gridCols} gap-4`}>
          {/* Local Stream */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-[#111]">
            <VideoStream stream={localStream} isLocal={true} muted={true} />
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-sm font-medium flex items-center gap-2">
               You {isMuted && <MicOff size={14} className="text-red-400" />}
            </div>
          </div>

          {/* Remote Streams */}
          {participants.map((p) => (
            <div key={p.address} className="relative rounded-2xl overflow-hidden shadow-2xl bg-[#111]">
              <VideoStream stream={p.stream} isLocal={false} muted={p.isMuted} />
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-sm font-medium flex items-center gap-2">
                 {p.address.slice(0, 8)}... {p.isMuted && <MicOff size={14} className="text-red-400" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/10 backdrop-blur-xl p-4 rounded-3xl border border-white/10 z-50 shadow-2xl"
          >
            <button 
              onClick={onToggleMute}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-white text-black' : 'bg-white/20 text-white hover:bg-white/30'}`}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>

            <button 
              onClick={onToggleCamera}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isCameraOff ? 'bg-white text-black' : 'bg-white/20 text-white hover:bg-white/30'}`}
            >
              {isCameraOff ? <VideoOff size={24} /> : <Video size={24} />}
            </button>

            <button 
              onClick={onAddParticipant}
              className="w-14 h-14 rounded-full bg-white/20 text-white hover:bg-white/30 flex items-center justify-center transition-all"
            >
              <UserPlus size={24} />
            </button>

            <button 
              onClick={onEndCall}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all shadow-lg hover:shadow-red-500/50"
            >
              <PhoneOff size={28} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
