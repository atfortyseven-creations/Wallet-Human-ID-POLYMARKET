"use client";
// WhaleDashboard v3  11 tabs, KYC removed
import React, { useMemo } from 'react';

import { WhaleProShell } from '@/components/dashboard/WhaleProShell';
import { DashboardErrorBoundary } from '@/components/dashboard/DashboardErrorBoundary';
import { useSystemAccount } from '@/hooks/useSystemAccount';
import dynamic from 'next/dynamic';

// --- Architectural Hooks ---
import { useQuantumSessionVisibility } from '@/hooks/useQuantumSessionVisibility';
import { useAztecStateSync } from '@/hooks/useAztecStateSync';

// --- Static Imports ---
import { GoldTicketPanel } from '@/components/dashboard/GoldTicketPanel';

// --- Dynamic Module Registry ---
const LoadingPanel = () => (
  <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-transparent">
    <div className="w-6 h-6 border-2 border-[#050505]  border-t-transparent rounded-full animate-spin" />
  </div>
);

const Registry = {
  WhaleSupport: dynamic(() => import('@/components/dashboard/WhaleSupport').then(m => ({ default: m.WhaleSupport })), { ssr: false, loading: LoadingPanel }),
  InstitutionalLedger: dynamic(() => import('@/components/dashboard/InstitutionalLedger'), { ssr: false, loading: LoadingPanel }),
  MassTransferIntel: dynamic(() => import('@/components/dashboard/MassTransferIntel').then(m => ({ default: m.MassTransferIntel })), { ssr: false, loading: LoadingPanel }),
  SessionLogsPanel: dynamic(() => import('@/components/dashboard/SessionLogsPanel').then(m => ({ default: m.SessionLogsPanel })), { ssr: false, loading: LoadingPanel }),

  HumanityLedger: dynamic(() => import('@/components/dashboard/HumanityLedger'), { ssr: false, loading: LoadingPanel }),
  PortfolioDashboard: dynamic(() => import('@/components/dashboard/PortfolioDashboard'), { ssr: false, loading: LoadingPanel }),
  InstitutionalMarkets: dynamic(() => import('@/components/dashboard/InstitutionalMarkets').then(m => ({ default: m.InstitutionalMarkets })), { ssr: false, loading: LoadingPanel }),
  WhaleChat: dynamic(() => import('@/components/dashboard/WhaleChat').then(m => ({ default: m.WhaleChat })), { ssr: false, loading: LoadingPanel })
} as const;

import "@/app/dashboard/dashboard.css";

import { motion, AnimatePresence } from 'framer-motion';

// --- Route Renderer Strategy ---
interface RouteRendererProps {
    route: string;
    reconciliationKey: number;
}

const PANEL_STYLE = "flex-1 w-full h-full min-h-0 flex flex-col";

const RouteRenderer = React.memo(({ route, reconciliationKey }: RouteRendererProps) => {
    const ComponentMap: Record<string, JSX.Element> = {
        'zk-identity': <GoldTicketPanel />,
        'gold': <GoldTicketPanel />,
        'chat': <Registry.WhaleChat />,
        'portfolio': <Registry.PortfolioDashboard />,

        'humanity-ledger': <Registry.HumanityLedger />,
        'markets': <Registry.InstitutionalMarkets />,
        'inst-ledger': <Registry.InstitutionalLedger />,
        'mass-transfer': <Registry.MassTransferIntel />,
        'logs': <Registry.SessionLogsPanel />,
        'support': <Registry.WhaleSupport />,
        'community': <Registry.WhaleChat />,
        'privacy': <Registry.SessionLogsPanel />
    };

    const targetComponent = ComponentMap[route] || <GoldTicketPanel />;
    const strictKey = `${route}-${reconciliationKey}`;

    return (
        <div className={PANEL_STYLE}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={route}
                    initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full h-full flex flex-col"
                >
                    <DashboardErrorBoundary key={strictKey}>
                        {targetComponent}
                    </DashboardErrorBoundary>
                </motion.div>
            </AnimatePresence>
        </div>
    );
});
RouteRenderer.displayName = 'RouteRenderer';

// --- Main Architecture ---
export default function WhaleDashboard() {
    const { isChecking } = useSystemAccount();
    
    const [reconciliationKey, forceReconciliation] = useQuantumSessionVisibility();
    const { activeRoute, mutateRoute } = useAztecStateSync(forceReconciliation);

    // ZK Guard Clause
    if (isChecking) {
        return (
            <div className="min-h-screen bg-[#FFFFFF]  flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-[#050505]  border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <WhaleProShell
            activeTab={activeRoute}
            onTabChange={mutateRoute}
            isExternalEmbed={false}
            isZkVerified={true}
        >
            <div className="flex flex-col w-full h-full min-h-0">
                <RouteRenderer route={activeRoute} reconciliationKey={reconciliationKey} />
            </div>
        </WhaleProShell>
    );
}
