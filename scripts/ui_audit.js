const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'terminal', 'LedgerChat.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace sent chat bubbles
content = content.replace(/'bg-blue-500 text-white'/g, "'bg-[#050505] text-white'");
content = content.replace(/'bg-white border border-black\\/8 text-gray-900'/g, "'bg-[#f5f5f7] text-[#050505] border-transparent'");

// 2. Remove gradients and colored backgrounds
content = content.replace(/bg-blue-500\/5 blur-\[100px\]/g, 'hidden');
content = content.replace(/bg-blue-400\/10 rounded-full blur-\[100px\]/g, 'hidden');
content = content.replace(/bg-gradient-to-br from-indigo-500 to-blue-600/g, 'bg-[#050505]');
content = content.replace(/from-emerald-500 to-teal-600 border-emerald-400\/30/g, 'bg-[#050505] border-[#050505]');
content = content.replace(/from-emerald-50 to-teal-50 border-emerald-200 text-emerald-900/g, 'bg-[#f5f5f7] border-transparent text-[#050505]');
content = content.replace(/text-emerald-600/g, 'text-[#050505]');

// 3. Replace generic blue styling with monochrome
content = content.replace(/bg-blue-500/g, 'bg-[#050505]');
content = content.replace(/bg-blue-600/g, 'bg-[#050505]');
content = content.replace(/bg-blue-700/g, 'bg-[#050505]');
content = content.replace(/text-blue-500/g, 'text-[#050505]');
content = content.replace(/text-blue-600/g, 'text-[#050505]');
content = content.replace(/text-blue-700/g, 'text-[#050505]');
content = content.replace(/border-blue-100/g, 'border-black/5');
content = content.replace(/border-blue-500/g, 'border-black');
content = content.replace(/border-blue-600\/30/g, 'border-black/10');
content = content.replace(/bg-blue-50\/50/g, 'bg-[#f5f5f7]');
content = content.replace(/bg-blue-50\/80/g, 'bg-[#f5f5f7]');
content = content.replace(/bg-blue-50/g, 'bg-[#f5f5f7]');
content = content.replace(/bg-blue-100/g, 'bg-[#e5e5ea]');
content = content.replace(/hover:bg-blue-100/g, 'hover:bg-[#e5e5ea]');
content = content.replace(/hover:bg-blue-600/g, 'hover:opacity-80');
content = content.replace(/shadow-\[0_0_8px_rgba\(59,130,246,0\.8\)\]/g, 'shadow-sm');
content = content.replace(/shadow-\[0_0_6px_rgba\(59,130,246,0\.8\)\]/g, 'shadow-sm');

// 4. Secret Chat Background (remove dark gradient, use white)
content = content.replace(/bg-\[radial-gradient\(ellipse_at_top,_var\(--tw-gradient-stops\)\)\] from-neutral-900 via-black to-black/g, 'bg-white');
content = content.replace(/bg-red-500\/10 border-red-500\/20/g, 'bg-[#f5f5f7] border-black/10');
content = content.replace(/text-red-500/g, 'text-[#050505]');
content = content.replace(/bg-red-500 text-white hover:bg-red-600/g, 'bg-[#050505] text-white hover:opacity-80');

// 5. Call UI gradients -> pure monochrome
content = content.replace(/style={{ background: 'linear-gradient\(180deg, #1a1a2e 0%, #0f3460 100%\)' }}/g, 'className="w-full h-full flex flex-col items-center justify-center gap-4 bg-white"');
content = content.replace(/style={{ background: 'linear-gradient\(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%\)' }}/g, 'className="w-full h-full flex flex-col items-center justify-center bg-white"');
content = content.replace(/style={{ background: 'linear-gradient\(135deg, #4f46e5, #6366f1\)' }}/g, 'className="w-28 h-28 rounded-full flex items-center justify-center shadow-xl relative z-10 bg-[#f5f5f7]"');
content = content.replace(/style={{ width: 140 \+ audioLevel \* 1\.5, height: 140 \+ audioLevel \* 1\.5, opacity: Math.min\(1, audioLevel \/ 50 \+ 0\.1\) }}/g, 'className="absolute rounded-full border border-black/10 transition-all duration-75" style={{ width: 140 + audioLevel * 1.5, height: 140 + audioLevel * 1.5, opacity: Math.min(1, audioLevel / 50 + 0.1) }}');
content = content.replace(/style={{ width: 120 \+ audioLevel, height: 120 \+ audioLevel, opacity: Math.min\(1, audioLevel \/ 100 \+ 0\.2\) }}/g, 'className="absolute rounded-full bg-black/5 transition-all duration-75" style={{ width: 120 + audioLevel, height: 120 + audioLevel, opacity: Math.min(1, audioLevel / 100 + 0.2) }}');
content = content.replace(/bg-indigo-500\/20/g, 'bg-black/5');
content = content.replace(/bg-indigo-500\/10/g, 'bg-black/5');
content = content.replace(/border-indigo-400\/30/g, 'border-black/10');
content = content.replace(/shadow-\[0_0_80px_rgba\(99,102,241,0\.4\)\]/g, 'shadow-lg');
content = content.replace(/bg-indigo-500/g, 'bg-[#050505]');
content = content.replace(/text-amber-400/g, 'text-black/50');
content = content.replace(/bg-amber-400/g, 'bg-black/50');
content = content.replace(/text-emerald-400/g, 'text-black/80');
content = content.replace(/bg-emerald-400/g, 'bg-black/80');
content = content.replace(/text-white text-5xl font-black/g, 'text-black text-5xl font-black');
content = content.replace(/text-white text-4xl font-black/g, 'text-black text-4xl font-black');
content = content.replace(/text-white text-\[30px\] font-black tracking-tight mb-2/g, 'text-black text-[30px] font-black tracking-tight mb-2');
content = content.replace(/text-white\/40 text-\[13px\] font-mono uppercase tracking-widest animate-pulse/g, 'text-black/40 text-[13px] font-mono uppercase tracking-widest animate-pulse');
content = content.replace(/text-white\/60 text-sm font-mono uppercase tracking-widest animate-pulse/g, 'text-black/40 text-[13px] font-mono uppercase tracking-widest animate-pulse');

// 6. Call UI top bar / controls
content = content.replace(/bg-black\/40 backdrop-blur-xl rounded-2xl px-4 py-2\.5 border border-white\/10/g, 'bg-white/80 backdrop-blur-xl rounded-2xl px-4 py-2.5 border border-black/10 shadow-sm');
content = content.replace(/text-white text-\[13px\] font-bold leading-none/g, 'text-black text-[13px] font-bold leading-none');
content = content.replace(/text-white\/50 text-\[10px\] font-mono mt-0\.5/g, 'text-black/50 text-[10px] font-mono mt-0.5');
content = content.replace(/bg-black\/30 hover:bg-black\/50/g, 'bg-white/80 hover:bg-white');
content = content.replace(/border-white\/20/g, 'border-black/10');
content = content.replace(/border-white/g, 'border-black');
content = content.replace(/border-b-2 border-l-2 border-white/g, 'border-b-2 border-l-2 border-black');
content = content.replace(/bg-black\/40 backdrop-blur-2xl/g, 'bg-white/90 backdrop-blur-2xl');
content = content.replace(/border border-white\/10 shadow-2xl/g, 'border border-black/10 shadow-xl');
content = content.replace(/bg-white\/10 text-white hover:bg-white\/20/g, 'bg-[#f5f5f7] text-black hover:bg-[#e5e5ea]');
content = content.replace(/bg-white text-black/g, 'bg-[#050505] text-white');
content = content.replace(/text-white border border-white\/10/g, 'text-black border border-black/10');

// 7. General fixes for poll colors
content = content.replace(/border-white\/50 bg-white\/20/g, 'border-white bg-white/20'); // IsMe sent poll
content = content.replace(/border-white\/20 bg-white\/10 hover:bg-white\/20/g, 'border-transparent bg-white/10 hover:bg-white/20');
content = content.replace(/bg-gray-50 hover:bg-gray-100 text-gray-800/g, 'bg-[#f5f5f7] hover:bg-[#e5e5ea] text-[#050505]');
content = content.replace(/text-white\/50/g, 'text-white/70');

fs.writeFileSync(filePath, content, 'utf8');
console.log('LedgerChat UI Minimalist Audit Complete');
