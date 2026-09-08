import React from "react";
import { LedgerMissionLoader } from '@/components/shared/LedgerMissionLoader';
import { getAcademyData } from "@/app/actions/academy-actions";
import { AcademyInteractiveEngine } from "@/components/academy/AcademyInteractiveEngine";
import { TOPIC_CATEGORIES } from "@/lib/data/academy-curriculum";
import { SystemFooter } from "@/components/landing/SystemFooter";
import { LedgerChatLink } from "@/components/shared/LedgerChatLink";
import { TuringAcademicShield } from "@/components/academy/TuringAcademicShield";

export const dynamic = 'force-dynamic';

export default async function AcademyPage() {
    let dbCourses: any[] = [];
    try {
        dbCourses = await getAcademyData();
    } catch (e) {
        console.error("LMS DB Connection Missing", e);
    }
    
    const isDatabaseSeeded = dbCourses.length > 0;

    return (
        <LedgerMissionLoader>
            <div className="flex flex-col bg-white text-slate-900 w-full">
              {/* Main content area — grows freely, never clips children */}
              <div className="w-full flex flex-col items-center justify-start p-4 md:p-8">

                {/* Academy interactive engine card */}
                <div className="w-full max-w-[1200px] bg-white/80 backdrop-blur-2xl border border-slate-200/60 rounded-[2rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.07)] flex flex-col transition-all duration-500 mt-16 md:mt-24 p-8 md:p-16">
                    <AcademyInteractiveEngine 
                        dbCourses={dbCourses} 
                        isSeeded={isDatabaseSeeded}
                        expectedCategories={TOPIC_CATEGORIES.length} 
                    />
                </div>
                
                {/* ── Visual Separator ── */}
                <div className="w-full max-w-[1200px] mt-16 mb-6 flex flex-col gap-3">
                  <div className="h-px w-full bg-slate-200" />
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-slate-400">
                        Academic Integrity Engine
                      </h2>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                        Turing Shield — Anti-Plagiarism System
                      </h3>
                      <p className="text-[13px] text-slate-500 font-medium leading-relaxed max-w-2xl">
                        Zero-Knowledge proof engine for academic integrity verification. 
                        Paste or upload your document to generate a cryptographic authenticity certificate anchored on Aztec Network.
                      </p>
                    </div>
                  </div>
                </div>

                {/* ── ICAIEPHE 2026 ZK Anti-Plagiarism Engine ── */}
                <div className="w-full max-w-[1200px] pb-16 flex flex-col">
                   <TuringAcademicShield />
                </div>
                
                <LedgerChatLink />
              </div>
              <SystemFooter />
            </div>
        </LedgerMissionLoader>
    );
}
