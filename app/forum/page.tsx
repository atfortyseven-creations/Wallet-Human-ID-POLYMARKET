import React from 'react';
import SystemForum from '@/components/dashboard/SystemForum';
import { WhaleMissionLoader } from '@/components/shared/WhaleMissionLoader';

export const dynamic = 'force-dynamic';

export default function ForumPage() {
  return (
    <WhaleMissionLoader>
      <div className="w-full min-h-screen h-screen bg-[#F5F5F7] dark:bg-[#050505] flex flex-col">
        <SystemForum />
      </div>
    </WhaleMissionLoader>
  );
}
