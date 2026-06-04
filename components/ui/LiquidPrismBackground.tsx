"use client";

export function LiquidPrismBackground() {
    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-[#000000]">
            {/* Moving Colors Layer  400Hz Pure CSS, Zero Network Fetch */}
            <div className="absolute inset-0 opacity-100 mix-blend-screen overflow-hidden">
                <div className="absolute inset-[-100%] bg-gradient-to-tr from-[#2d3080] via-[#8b31ff] to-[#ff176f] animate-[liquid_2s_infinite_linear] opacity-80 blur-[80px]" />
                <div className="absolute inset-[-100%] bg-gradient-to-bl from-[#00d794] via-[#1a4de6] to-[#af1fb8] animate-[liquid_2.5s_infinite_linear_reverse] opacity-80 blur-[80px] delay-100" />
            </div>
            {/* Premium CSS Mesh Gradient  replaces jpg for zero-latency rendering */}
            <div
                className="absolute inset-0 animate-prism-shift opacity-70"
                style={{
                    background: "radial-gradient(ellipse at 20% 50%, #2d3080 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #8b31ff 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, #af1fb8 0%, transparent 50%), #000000",
                }}
            />
            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
        </div>
    );
}


