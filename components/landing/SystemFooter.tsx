import Link from "next/link";
import React from "react";

export function SystemFooter() {
  return (
    <footer className="w-full bg-white text-black border-t border-black/10 py-12 px-6">
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 text-center md:text-left">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 text-[13px] font-bold">
            <span>Humanity Ledger</span>
            <span className="w-1 h-1 rounded-full bg-black/20" />
            <span>Ledger Chat</span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 text-[13px] font-medium text-black/60">
            <Link href="/docs/status" className="hover:text-black transition-colors">Status</Link>
            <Link href="/security" className="hover:text-black transition-colors">Security</Link>
            <Link href="/legal/terms" className="hover:text-black transition-colors">Terms</Link>
            <Link href="/legal/privacy" className="hover:text-black transition-colors">Privacy</Link>
            <a href="https://github.com/humanityledger/Humanity-Ledger" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">GitHub</a>
          </div>
        </div>

        <div className="border-t border-black/5 pt-6 text-[12px] text-black/40 leading-relaxed text-center">
          <p>Hosted on Web2 infrastructure. Not a financial institution. Not affiliated with Humanity Protocol.</p>
        </div>
      </div>
    </footer>
  );
}
