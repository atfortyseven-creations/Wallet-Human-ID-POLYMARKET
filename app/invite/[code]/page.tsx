"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Gift, Trophy, TrendingUp, Users, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

export default function InvitePage() {
    const params = useParams();
    const router = useRouter();
    const { isSignedIn } = useAuth();
    const inviteCode = params.code as string;
    const [stored, setStored] = useState(false);

    useEffect(() => {
        // Store the referral code in localStorage
        if (inviteCode) {
            localStorage.setItem('referral_code', inviteCode);
            setStored(true);
        }

        // If already signed in, redirect to dashboard
        if (isSignedIn) {
            router.push('/dashboard');
        }
    }, [inviteCode, isSignedIn, router]);

    const handleJoin = () => {
        // Redirect to Clerk sign-up
        router.push('/sign-up');
    };

    // Extract referrer info from invite code (last 6 chars of address)
    const referrerShort = inviteCode?.replace('HUMAN-', '') || 'XXXXXX';

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl w-full"
            >
                {/* Main Card */}
                <div className="bg-white rounded-[32px] shadow-2xl shadow-purple-500/10 overflow-hidden">
                    {/* Header Section */}
                    <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 p-8 text-white">
                        {/* Decorative Glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px]" />
                        
                        <div className="relative z-10 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 backdrop-blur-sm border border-white/30"
                            >
                                <Gift size={40} className="text-white" />
                            </motion.div>
                            
                            <h1 className="text-4xl font-black mb-2">You've Been Invited!</h1>
                            <p className="text-white/80 text-lg">Join Human DeFi and start your journey</p>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-8">
                        {/* Referral Code Display */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-6 border border-purple-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Your Invite Code</p>
                                    <p className="text-2xl font-black text-purple-600 font-mono">{inviteCode}</p>
                                </div>
                                {stored && (
                                    <div className="flex items-center gap-2 text-green-600">
                                        <CheckCircle size={20} />
                                        <span className="text-sm font-bold">Saved</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Benefits Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <BenefitCard 
                                icon={<Trophy className="text-yellow-500" size={24} />}
                                title="Instant Rewards"
                                description="Get bonus on signup"
                            />
                            <BenefitCard 
                                icon={<TrendingUp className="text-green-500" size={24} />}
                                title="Earn Together"
                                description="10% trading fee share"
                            />
                            <BenefitCard 
                                icon={<Users className="text-purple-500" size={24} />}
                                title="VIP Access"
                                description="Premium features"
                            />
                        </div>

                        {/* CTA Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleJoin}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all"
                        >
                            Join Human DeFi
                            <ArrowRight size={20} />
                        </motion.button>

                        <p className="text-center text-sm text-gray-500 mt-4">
                            By joining, you agree to our Terms of Service
                        </p>
                    </div>
                </div>

                {/* Footer Note */}
                <p className="text-center text-sm text-gray-600 mt-6">
                    Invited by member <span className="font-mono font-bold text-purple-600">0x{referrerShort}...</span>
                </p>
            </motion.div>
        </div>
    );
}

function BenefitCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <div className="flex justify-center mb-2">{icon}</div>
            <h3 className="font-bold text-sm mb-1">{title}</h3>
            <p className="text-xs text-gray-500">{description}</p>
        </div>
    );
}
