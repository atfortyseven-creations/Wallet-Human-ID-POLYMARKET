"use client";

import { useState } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Shield, Fingerprint, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePasskeyLogin = async () => {
    setIsLoading(true);
    try {
      // 1. Get options from server
      const resp = await fetch('/api/auth/webauthn/authenticate');
      const options = await resp.json();

      if (options.error) throw new Error(options.error);

      // 2. Start authentication with browser
      const asseResp = await startAuthentication(options);

      // 3. Verify with server
      const verifyResp = await fetch('/api/auth/webauthn/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asseResp),
      });

      const verification = await verifyResp.json();

      if (verification.verified) {
        toast.success('Authenticated successfully');
        router.push('/wallet'); // Redirect to wallet/dashboard
      } else {
        throw new Error(verification.error || 'Verification failed');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EAEADF] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 shadow-xl border border-[#1F1F1F]/5"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#1F1F1F] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3 group hover:rotate-6 transition-transform">
                <Shield className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-black text-[#1F1F1F] mb-2 tracking-tight">Human ID</h1>
            <p className="text-[#1F1F1F]/60">Secure Biometric Access</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handlePasskeyLogin}
              disabled={isLoading}
              className="w-full bg-[#1F1F1F] text-white h-14 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-[#1F1F1F]/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Fingerprint size={24} className="text-[#EAEADF]" />
                  <span>Sign in with Passkey</span>
                </>
              )}
            </button>

            <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#1F1F1F]/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-[#1F1F1F]/40 font-bold">Or continue with</span>
                </div>
            </div>

            <button
                disabled
                className="w-full bg-white border-2 border-[#1F1F1F]/5 text-[#1F1F1F] h-12 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#EAEADF]/50 transition-colors opacity-50 cursor-not-allowed"
            >
                Email & Password
            </button>
          </div>
          
          <div className="mt-8 text-center text-xs text-[#1F1F1F]/30 font-medium">
            Protected by Human Protocol v4.0
          </div>
        </motion.div>
      </div>
    </div>
  );
}
