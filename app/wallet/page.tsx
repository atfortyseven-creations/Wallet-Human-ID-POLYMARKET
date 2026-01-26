"use client";

import WalletSection from "@/components/WalletSection";

export default function WalletPage() {
    return (
        <main className="relative flex min-h-screen w-full flex-col items-center pt-24 pb-12 overflow-hidden">
            <div className="relative z-10 w-full max-w-7xl px-4">
                <WalletSection />
            </div>
        </main>
    );
}
