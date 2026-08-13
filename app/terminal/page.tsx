import TerminalClient from './TerminalClient';
import { NonCustodialBanner } from '@/components/compliance/NonCustodialBanner';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full w-full bg-white">
      <NonCustodialBanner />
      <div className="flex-1 overflow-hidden">
        <TerminalClient />
      </div>
    </div>
  );
}
