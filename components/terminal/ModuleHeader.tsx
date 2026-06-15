"use client";

import React from 'react';
import { MODULE_EXPLANATIONS } from './ModuleExplanations';

interface ModuleHeaderProps {
    moduleId: string;
}

export function ModuleHeader({ moduleId }: ModuleHeaderProps) {
    const explanation = MODULE_EXPLANATIONS[moduleId];
    
    if (!explanation) return null;

    return (
        <div className="flex flex-col items-center text-center gap-0 shrink-0 z-10 px-4 md:px-0 mb-8 mt-2">
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-[0.2em] text-[#050505] ">
                {explanation.title}
            </h1>
        </div>
    );
}
