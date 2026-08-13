import SystemNodeCore from '@/components/infrastructure/SystemNodeCore';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Infrastructure core | Humanity Ledger',
    description: 'Node monitoring and validation for Humanity Ledger infrastructure.',
};

export default function CorePage() {
    return <SystemNodeCore />;
}
