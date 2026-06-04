import React from "react";
import { WhaleMissionLoader } from '@/components/shared/WhaleMissionLoader';
import { getAcademyData } from "@/app/actions/academy-actions";
import { AcademyInteractiveEngine } from "@/components/academy/AcademyInteractiveEngine";
import { TOPIC_CATEGORIES } from "@/lib/data/academy-curriculum";
import { SystemFooter } from "@/components/landing/SystemFooter";
import { WhaleChatLink } from "@/components/shared/WhaleChatLink";

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
              </div>
              <WhaleChatLink />
              <SystemFooter />
            </div>
        </WhaleMissionLoader>
    );
}
