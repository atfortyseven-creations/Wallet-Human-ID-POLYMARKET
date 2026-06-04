import NodesOverview from '@/components/nodes/NodesOverview';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Dedicated Node Infrastructure | Whale Alert',
    description: 'Private, Elite-grade blockchain infrastructure for high-performance needs.',
};

export default function NodesPage() {
    return <NodesOverview />;
}
