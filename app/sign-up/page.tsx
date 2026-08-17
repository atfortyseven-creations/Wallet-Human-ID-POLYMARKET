"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * /sign-up — Legacy wallet creation route.
 * The old QuantumVaultOnboarding (Humanity Ledger vault) flow is deprecated.
 * New users authenticate via Email OTP or Google OAuth on the main landing page.
 */
export default function SignUpPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Redirect to main landing page which contains the new auth flow
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
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-white text-[#0A0A0A]">
      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30 animate-pulse">
        Redirecting...
      </div>
    </div>
  );
}
