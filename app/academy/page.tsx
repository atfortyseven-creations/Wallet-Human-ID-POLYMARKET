import React from "react";
import { WhaleMissionLoader } from '@/components/shared/WhaleMissionLoader';
import { getAcademyData } from "@/app/actions/academy-actions";
import { AcademyInteractiveEngine } from "@/components/academy/AcademyInteractiveEngine";
import { TOPIC_CATEGORIES } from "@/lib/data/academy-curriculum";
import { SystemFooter } from "@/components/landing/SystemFooter";
import { WhaleChatLink } from "@/components/shared/WhaleChatLink";
import { TuringAcademicShield } from "@/components/academy/TuringAcademicShield";

export const revalidate = 60;

export default async function AcademyPage() {
    let dbCourses: any[] = [];
    try {
        dbCourses = await getAcademyData();
    } catch (e) {
        console.error("LMS DB Connection Missing", e);
    }
    
    const isDatabaseSeeded = dbCourses.length > 0;

    return (
        <WhaleMissionLoader>
            <div className="flex-1 flex flex-col bg-white text-slate-900 w-full min-h-screen">
              <div className="w-full flex flex-col items-center justify-start p-4 md:p-8 relative min-h-screen">
                <div className="w-full max-w-[1200px] bg-white/80 backdrop-blur-2xl border border-slate-200/60 rounded-[2rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.07)] flex flex-col transition-all duration-500 z-10 mt-16 md:mt-24 p-8 md:p-16">
                    <AcademyInteractiveEngine 
                        dbCourses={dbCourses} 
                        isSeeded={isDatabaseSeeded}
                        expectedCategories={TOPIC_CATEGORIES.length} 
                    />
                </div>
                
                {/* ── ICAIEPHE 2026 ZK Anti-Plagiarism Engine ── */}
                <div className="w-full max-w-[1200px] mt-12 bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl flex flex-col p-8 md:p-16 z-10 overflow-hidden relative">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500" />
                   <TuringAcademicShield />
                </div>
              </div>
              <WhaleChatLink />
              <SystemFooter />
            </div>
        </WhaleMissionLoader>
    );
}
