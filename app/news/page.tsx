import { NewsOfToday } from '@/components/dashboard/NewsOfToday';

export const metadata = {
    title: 'The Whale Post | Live Intelligence',
    description: 'Cryptographically verified macroeconomic signal aggregation.',
};

export default function NewsPage() {
    return (
        <div className="fixed inset-0 bg-white z-10 flex flex-col overflow-hidden">
            <NewsOfToday />
        </div>
    );
}
