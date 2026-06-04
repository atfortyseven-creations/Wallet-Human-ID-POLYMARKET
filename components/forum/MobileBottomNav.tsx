"use client";

import { useRouter, usePathname } from 'next/navigation';

export function MobileBottomNav() {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <nav className="mobile-bottom-nav lg:hidden fixed bottom-0 left-0 right-0 border-t border-slate-200/60  bg-white/90  backdrop-blur-md flex items-center justify-around px-1 shrink-0 z-50 transition-colors w-full" style={{ minHeight: 'calc(64px + env(safe-area-inset-bottom, 0px))', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
            {[
                { id: 'markets',     icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>, label: 'Telemetry' },
                { id: 'portfolio',   icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>, label: 'Portfolio' },
                { id: 'chat',        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>, label: 'Chat' },
                { id: 'menu',        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>, label: 'Menu' },
            ].map(tab => {
                return (
                    <button
                        key={tab.id}
                        onClick={() => {
                            if (tab.id === 'menu') {
                                router.push('/dashboard?tab=menu');
                            }
                            else if (tab.id === 'chat') router.push('/chat');
                            else if (tab.id === 'portfolio') router.push('/portfolio');
                            else router.push('/dashboard?tab=markets');
                        }}
                        style={{ minHeight: 0, minWidth: 0 }}
                        className={`relative flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors py-2 text-[var(--forum-text-muted)] hover:text-[var(--forum-text)]`}
                    >
                        <span className="transition-transform">
                            {tab.icon}
                        </span>
                        <span className="font-mono text-[9px] font-bold uppercase tracking-widest">{tab.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
