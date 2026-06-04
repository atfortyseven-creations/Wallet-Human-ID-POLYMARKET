import React from 'react';

export function BadgesTab({ badges }: { badges: any[] }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-[10px] font-mono text-[#050505]/40 uppercase tracking-widest border-b border-[#E0E0E0] pb-2">
        {badges.length} Badges Earned
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {badges.map((badge) => (
          <div key={badge.id} className="border border-[#E0E0E0] p-4 flex flex-col gap-3 hover:bg-[#F5F5F5] transition-colors relative group overflow-hidden">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 flex items-center justify-center rounded-sm ${
                badge.type === 'gold' ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 
                badge.type === 'silver' ? 'bg-[#A8A9AD]/10 text-[#A8A9AD]' : 
                'bg-[#CD7F32]/10 text-[#CD7F32]'
              }`}>
                <span className="text-[16px]"></span>
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-mono font-black text-[#050505]">{badge.name}</span>
                <span className={`text-[9px] font-mono uppercase tracking-widest ${
                  badge.type === 'gold' ? 'text-[#D4AF37]' : 
                  badge.type === 'silver' ? 'text-[#A8A9AD]' : 
                  'text-[#CD7F32]'
                }`}>
                  {badge.type}
                </span>
              </div>
            </div>
            
            <p className="text-[10px] font-mono text-[#050505]/60 leading-relaxed min-h-[30px]">
              {badge.description}
            </p>
          </div>
        ))}

        {badges.length === 0 && (
          <div className="col-span-full py-20 text-center text-[10px] font-mono uppercase tracking-[0.2em] text-[#050505]/20">
            [ NO BADGES EARNED ]
          </div>
        )}
      </div>
    </div>
  );
}
