// components/MainVault.tsx
import { useWLD } from '../hooks/useWLD'

export const MainVault = () => {
    const { balance, symbol, status, isLoading } = useWLD()

    return (
        <div className="bg-[#0a0a0a] p-8 rounded-3xl border border-white/5 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <p className="text-gray-500 text-sm font-medium flex items-center gap-2">
                        Net Worth Estimate <span className="rotate-180">↺</span>
                    </p>
                    <h2 className="text-6xl font-bold mt-2 tracking-tighter">
                        ${isLoading ? '...' : (Number(balance) * 0.45).toFixed(2)}
                        <span className="text-lg align-top ml-1 text-gray-400">,00</span>
                    </h2>
                </div>
                <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-xs font-bold">
                    ↗ 0%
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-6">
                <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-widest">WLD Balance</p>
                    <p className="text-xl font-mono font-semibold">
                        {isLoading ? '---' : `${parseFloat(balance).toFixed(4)}`}
                    </p>
                </div>
                <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-widest">Status</p>
                    <p className={`text-sm font-bold ${status === 'connected' ? 'text-blue-400' : 'text-red-400'}`}>
                        {status.toUpperCase()}
                    </p>
                </div>
                <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-widest">WLD Price</p>
                    <p className="text-xl font-mono font-semibold">$0.458581</p>
                </div>
            </div>
        </div>
    )
}
