"use client";

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function ScrollJourney() {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef1 = useRef<HTMLHeadingElement>(null);
    const textRef2 = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Pin the container and scrub through the texts
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "+=2000", // 2000px of scroll distance to read through
                    pin: true,
                    scrub: 1,      // 1 second lag for smooth scrubbing
                }
            });

            // Entry of first text (Filosofía)
            tl.fromTo(textRef1.current, 
                { opacity: 0, scale: 0.8, filter: "blur(20px)", y: 100 },
                { opacity: 1, scale: 1, filter: "blur(0px)", y: 0, duration: 1 }
            );

            // Hold first text
            tl.to(textRef1.current, { opacity: 1, duration: 1 });

            // Exit of first text
            tl.to(textRef1.current, { opacity: 0, y: -100, filter: "blur(10px)", duration: 1 });

            // Entry of second text (Problema/Solución)
            tl.fromTo(textRef2.current, 
                { opacity: 0, scale: 1.2, filter: "blur(20px)", y: 100 },
                { opacity: 1, scale: 1, filter: "blur(0px)", y: 0, duration: 1 },
                "-=0.5" // Overlap slightly with the exit of the first text
            );

            // Hold second text
            tl.to(textRef2.current, { opacity: 1, duration: 1 });
            
            // Exit of second text
            tl.to(textRef2.current, { opacity: 0, y: -100, filter: "blur(10px)", duration: 1 });

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="relative w-full h-screen bg-[#030303] overflow-hidden flex items-center justify-center">
            
            {/* Ambient Background Glow that pulses during scroll */}
            <div className="absolute inset-0 bg-gradient-radial from-indigo-900/20 to-[#030303] opacity-50" />
            
            <div className="relative z-10 text-center w-full max-w-4xl px-6">
                
                <h2 
                    ref={textRef1} 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-4xl md:text-7xl font-black uppercase text-white tracking-tighter mix-blend-difference"
                    style={{ opacity: 0 }}
                >
                    <span className="block text-indigo-500 mb-4 text-xs tracking-[0.4em]">Phase I : The Philosophy</span>
                    El caos no existe.<br/>Solo datos mal estructurados.
                </h2>

                <h2 
                    ref={textRef2} 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-4xl md:text-7xl font-black uppercase text-white tracking-tighter mix-blend-difference"
                    style={{ opacity: 0 }}
                >
                    <span className="block text-emerald-500 mb-4 text-xs tracking-[0.4em]">Phase II : The Solution</span>
                    Descodificando <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-500">
                        the genesis block.
                    </span>
                </h2>

            </div>

            {/* Subtle Grain Overlay for cinematic texture */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png')]" />

        </section>
    );
}

