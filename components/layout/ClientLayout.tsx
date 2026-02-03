'use client';

import React from 'react';
import { TitaniumGate } from '@/components/layout/TitaniumGate';
import { DropdownNav } from '@/components/site/DropdownNav';

export function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <TitaniumGate>
            {/* Top Border Seal (Expert sub-pixel leak prevention) */}
            {/* Removed Top Border Seal to avoid yellowish tint */}

            <div className="fixed top-6 left-0 right-0 flex justify-center z-[1002] pointer-events-none">
                <DropdownNav />
            </div>
            {children}
        </TitaniumGate>
    );
}
