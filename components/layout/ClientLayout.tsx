'use client';

import React from 'react';
import { TitaniumGate } from '@/components/layout/TitaniumGate';
import { DropdownNav } from '@/components/site/DropdownNav';

export function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <TitaniumGate>
            <div className="fixed top-6 left-0 right-0 flex justify-center z-[1000] pointer-events-none">
                <div className="pointer-events-auto">
                    <DropdownNav />
                </div>
            </div>
            {children}
        </TitaniumGate>
    );
}
