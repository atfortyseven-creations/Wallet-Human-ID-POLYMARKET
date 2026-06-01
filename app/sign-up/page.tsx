"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { QuantumVaultOnboarding } from "@/components/auth/QuantumVaultOnboarding";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

/**
 * /sign-up — Wallet creation entry point.
 *
 * [PERSISTENCE NOTE] All persistence work (setupPassword, system_accounts write,
 * system-verify call, cloudSync) is now handled inside QuantumVaultOnboarding.sealVault().
 * handleComplete() only handles navigation so there is NO race condition or duplicate indexation.
 */
export default function SignUpPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleComplete = useCallback(() => {
    // Wallet sealed, session established, DB indexed.
    // Always send the user to the landing page so they choose what to do next.
    router.replace("/");
  }, [router]);

  if (!mounted) {
    return (
      <div className="min-h-[100dvh] bg-white flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-black/15 border-t-black/50 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-white text-[#0A0A0A] relative overflow-x-hidden z-[100]">
      <Link href="/login" className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50 flex items-center gap-2 text-black/40 hover:text-black transition-colors group px-4 py-2 bg-white/70 backdrop-blur-md rounded-full border border-black/10 shadow-sm">
        <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
        <span className="font-mono text-[13px] uppercase tracking-[0.2em] font-bold">Go Back</span>
      </Link>

      <QuantumVaultOnboarding onComplete={handleComplete} />
    </div>
  );
}
