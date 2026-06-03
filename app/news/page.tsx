import { NewsOfToday } from '@/components/dashboard/NewsOfToday';

export const metadata = {
    title: 'The Whale Post | Live Intelligence',
    description: 'Cryptographically verified macroeconomic signal aggregation.',
};

export default function NewsPage() {
    return (
        <div className="min-h-screen bg-[#F5F5F7] pt-24 pb-20 flex flex-col">
            <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col h-[calc(100vh-10rem)]">
                <NewsOfToday />
            </div>
        </div>
    );
}
