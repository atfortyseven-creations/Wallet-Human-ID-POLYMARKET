import Image from 'next/image';

/**
 *  WHALE BRAND IDENTITY ENGINE
 * Centrally manages the official Whale Alert Network logo visualization.
 */
export function WhaleLogo({ 
    className = "w-10 h-10", 
    priority = true 
}: { className?: string; priority?: boolean }) {
    // Reference the institutional logo
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <Image
                src="/official-whale-monochrome.png"
                alt="Whale Alert Network"
                fill
                className="object-contain transition-all duration-300 transform-gpu"
                priority={priority}
                unoptimized
            />
        </div>
    );
}
