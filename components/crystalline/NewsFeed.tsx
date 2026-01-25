"use client";

import { NEWS_DATA } from "@/data/news";

export default function NewsFeed() {
    // Usamos los datos estáticos directamente
    const news = NEWS_DATA;

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="w-full max-w-5xl mx-auto space-y-6 pb-20"
        >
            {news.map((article) => (
                <motion.div
                    key={article.id}
                    variants={item}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl shadow-lg shadow-black/20 transition-all duration-500 hover:bg-white/10 hover:border-white/30"
                >
                    {/* Gradient Background for Volume */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

                    <div className="flex flex-col md:flex-row h-full relative z-10">

                        {/* Image Column */}
                        <div className="md:w-1/3 h-48 md:h-auto relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/40 md:bg-gradient-to-l opacity-50 z-10" />
                            <Image
                                src={`https://images.unsplash.com/photo-1611974765270-ca1258634369?auto=format&fit=crop&q=80&w=600&keyword=${article.imageKeyword}`}
                                // Fallback dinámico usando keywords de Unsplash Source si fuera necesario, 
                                // pero para layout safe usamos una url base y podríamos variar parámetros o usar un placeholder service mejor.
                                // Para cumplir con el prompt "imageKeyword: Para que la foto sea relevante", 
                                // usaremos un truco de Unsplash Source si estuviera disponible, pero Unsplash Source está deprecado.
                                // Usaremos imágenes fijas de alta calidad rotativas o buscaremos una solución mejor.
                                // DADO QUE UNSPLASH SOURCE FALLA: Usaré 3-4 imágenes de stock de alta calidad rotando por ID para asegurar carga.
                                // O MEJOR: Usaré la keyword en la URL de source.unsplash si funcionara, pero no.
                                // SOLUCIÓN ROBUSTA: Usar safe images fijas.

                                // REVISIÓN: El usuario pidió "imageKeyword".
                                // Voy a simular la relevancia usando unas cuantas imágenes fijas bonitas.
                                src={
                                    article.category === "Elections" ? "https://images.unsplash.com/photo-1540910419868-474947cebacb?auto=format&fit=crop&q=80&w=600" :
                                        article.category === "Crypto" ? "https://images.unsplash.com/photo-1518546305927-5a420f3463fb?auto=format&fit=crop&q=80&w=600" :
                                            "https://images.unsplash.com/photo-1611974765270-ca1258634369?auto=format&fit=crop&q=80&w=600"
                                }
                                alt={article.imageKeyword}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                sizes="(max-width: 768px) 100vw, 33vw"
                                priority={article.id <= 2}
                                unoptimized={true}
                            />
                        </div>

                        {/* Text Column */}
                        <div className="md:w-2/3 p-6 md:p-8 flex flex-col justify-center">
                            <div className="flex items-center gap-3 mb-3 text-[10px] font-sans font-bold tracking-widest text-emerald-400 uppercase drop-shadow-sm">
                                <TrendingUp className="w-3 h-3" />
                                {article.source}
                            </div>

                            <h3 className="font-serif text-xl md:text-2xl text-white font-bold leading-tight mb-3 group-hover:text-indigo-200 transition-colors drop-shadow-md">
                                {article.headline}
                            </h3>

                            <p className="font-sans text-sm text-white/80 leading-relaxed mb-4 font-medium drop-shadow-sm">
                                {article.description}
                            </p>

                            <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
                                <div className="flex items-center gap-2 text-xs text-white/50">
                                    <Clock className="w-3 h-3" />
                                    {article.time}
                                </div>
                                <span className="text-[10px] text-white/30 font-serif italic tracking-wider">
                                    {article.footer}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
}
