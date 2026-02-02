'use client';

import React from 'react';
import { TitaniumGate } from '@/components/layout/TitaniumGate';
import { DropdownNav } from '@/components/site/DropdownNav';

export function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <TitaniumGate>
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
                <DropdownNav />
            </div>
            {children}
        </TitaniumGate>
    );
}
