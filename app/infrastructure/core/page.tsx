import SystemNodeCore from '@/components/infrastructure/SystemNodeCore';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Infrastructure core | Whale Alert',
    description: 'Node monitoring and validation for Whale Alert Network infrastructure.',
};

export default function CorePage() {
    return <SystemNodeCore />;
}
