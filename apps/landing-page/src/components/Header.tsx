'use client';

import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';

const navItems = [
  'Dashboard', 'Studio', 'Markets', 'Roadmap', 'Identity', 
  'TOKEN', 'MAP', 'Chat', 'Portfolio', 'Community', '+', 
  'STATUS', 'PRIVACY'
];

export default function Header() {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();

  return (
    <header className="w-full bg-parchment border-b-2 border-ink sticky top-0 z-50 flex flex-col">
      {/* Top Bar */}
      <div className="px-6 py-4 flex justify-between items-center border-b-2 border-ink">
        <div className="flex flex-col">
          <div className="font-serif font-bold text-2xl tracking-tight text-ink">
            Ledger Network
          </div>
          <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-ink/70">
            Powered by Aztec Network
          </div>
        </div>
        
        <button 
          onClick={() => open()}
          className="bg-ink text-parchment px-6 py-2 text-sm font-bold border-2 border-ink hover:bg-transparent hover:text-ink transition-colors uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
        >
          {isConnected ? `${address?.substring(0, 6)}...${address?.substring(address.length - 4)}` : 'Connect Wallet'}
        </button>
      </div>

      {/* Navigation Bar */}
      <nav className="w-full overflow-x-auto no-scrollbar border-b border-ink/10 bg-parchment">
        <ul className="flex items-center px-4 py-2 min-w-max gap-6 text-sm font-sans font-bold uppercase tracking-wider text-ink/80">
          {navItems.map((item, idx) => (
            <li key={idx}>
              <a href="#" className="hover:text-orchid hover:underline decoration-2 underline-offset-4 transition-all">
                {item}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
