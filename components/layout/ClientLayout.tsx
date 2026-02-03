'use client';

import React from 'react';
import { TitaniumGate } from '@/components/layout/TitaniumGate';
import { DropdownNav } from '@/components/site/DropdownNav';

export function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <TitaniumGate>
            {/* Top Border Seal (Expert sub-pixel leak prevention) */}
            <div className="fixed top-0 left-0 right-0 h-10 bg-gradient-to-b from-[#EAEADF] via-[#EAEADF]/80 to-transparent z-[1001] pointer-events-none backdrop-blur-[2px]" />

            <div className="fixed top-0 left-0 right-0 flex justify-center z-[1002] pointer-events-none pt-6">
                <div className="pointer-events-auto">
                    <DropdownNav />
                </div>
            </div>
            {children}
        </TitaniumGate>
    );
}
