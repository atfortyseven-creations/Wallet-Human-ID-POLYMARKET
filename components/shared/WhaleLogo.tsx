import Image from 'next/image';

/**
 *  WHALE BRAND IDENTITY ENGINE
 * Centrally manages the official Humanity Ledger logo visualization.
 */
export function WhaleLogo({ 
    className = "w-10 h-10", 
    priority = true 
}: { className?: string; priority?: boolean }) {
    // Reference the sovereign logo
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <Image
                src="/official-whale-monochrome.png"
                alt="Humanity Ledger"
                fill
                className="object-contain transition-all duration-300 transform-gpu"
                priority={priority}
                unoptimized
            />
        </div>
    );
}
