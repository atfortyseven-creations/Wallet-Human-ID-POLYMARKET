export const NewsSkeleton = () => (
    <div className="flex flex-col bg-gray-900/50 rounded-xl border border-white/10 h-full animate-pulse overflow-hidden">
        <div className="w-full aspect-[16/9] bg-white/5" />
        <div className="p-4 flex-1 flex flex-col">
            <div className="h-3 w-20 bg-white/10 rounded mb-3" />
            <div className="h-4 w-full bg-white/10 rounded mb-2" />
            <div className="h-4 w-2/3 bg-white/10 rounded mb-4" />
            <div className="mt-auto pt-4 border-t border-white/5">
                <div className="flex justify-between items-center">
                    <div className="h-3 w-24 bg-white/10 rounded" />
                    <div className="h-3 w-3 bg-white/10 rounded-full" />
                </div>
            </div>
        </div>
    </div>
);
