

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
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <rect width="40" height="40" rx="8" fill="#1C1C1E" />
                <path d="M12 12V28M28 12V28M12 20H28" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
    );
}
