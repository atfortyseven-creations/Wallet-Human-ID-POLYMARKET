'use client';

import React from 'react';
import { TitaniumGate } from '@/components/layout/TitaniumGate';
import { SiteHeader } from '@/components/site/SiteHeader';

export function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <TitaniumGate>
            {/* Header is now inside TitaniumGate, so it can access the context */}
            <SiteHeader />
            {children}
        </TitaniumGate>
    );
}
