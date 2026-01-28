import { TreasuryCard } from "@/components/dashboard/TreasuryCard";

export default function CrystallineDashboard() {
    return (
        <div className="w-full space-y-6">
            {/* Encabezado del Dashboard */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/90 to-black/90 p-8 backdrop-blur-xl">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">
                        Panel de Mercados
                    </h2>
                    <p className="text-gray-400 max-w-lg">
                        Bienvenido a tu interfaz de predicción descentralizada. Conecta tu identidad para comenzar a operar.
                    </p>
                </div>

                {/* Efecto decorativo de fondo */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-purple-500/10 blur-3xl rounded-full pointer-events-none"></div>
            </div>

            {/* Grid Principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    {/* Placeholder for Market Activity */}
                    <div className="h-full min-h-[250px] rounded-3xl bg-[#0a0a0a] border border-white/10 p-6 flex flex-col justify-center items-center text-center text-gray-500 font-mono text-xs border-dashed gap-2 group hover:border-white/20 transition-colors cursor-wait">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <span className="animate-pulse">⚡</span>
                        </div>
                        [MARKET ACTIVITY STREAM ONLINE SOON]
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <TreasuryCard />
                </div>
            </div>
        </div>
    );
}
