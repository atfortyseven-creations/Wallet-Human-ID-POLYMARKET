"use client";

import dynamic from 'next/dynamic';
import { DashboardErrorBoundary } from '@/components/dashboard/DashboardErrorBoundary';

const WhaleDashboard = dynamic(
  () => import('@/components/dashboard/WhaleDashboard'),
  { ssr: false, loading: () => <div className="min-h-screen bg-transparent flex items-center justify-center"><div className="w-6 h-6 rounded-full border-2 border-[#050505] dark:border-white border-t-transparent animate-spin"/></div> }
);

export default function DashboardClient() {
  return (
    <DashboardErrorBoundary fallbackMessage="Failed to initialize dashboard. Auto-recovering...">
      <WhaleDashboard />
    </DashboardErrorBoundary>
  );
}
