"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const AztecCursor = () => {
    const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
    
    useEffect(() => {
        const updateMousePosition = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
        window.addEventListener("mousemove", updateMousePosition);
        return () => window.removeEventListener("mousemove", updateMousePosition);
    }, []);

    return (
        <motion.div 
            className="fixed top-0 left-0 w-5 h-5 pointer-events-none z-[10000] mix-blend-difference hidden md:flex items-center justify-center"
            animate={{ x: mousePosition.x - 10, y: mousePosition.y - 10 }}
            transition={{ type: "spring", damping: 40, stiffness: 400, mass: 0.1 }}
        >
            <div className="relative w-full h-full border border-white/50 rounded-full flex items-center justify-center animate-[spin_4s_linear_infinite]">
                <div className="absolute top-0 w-[2px] h-[4px] bg-white/80" />
                <div className="absolute bottom-0 w-[2px] h-[4px] bg-white/80" />
                <div className="absolute left-0 w-[4px] h-[2px] bg-white/80" />
                <div className="absolute right-0 w-[4px] h-[2px] bg-white/80" />
            </div>
            <div className="absolute w-1 h-1 bg-[var(--aztec-orchid)] rounded-full mix-blend-screen" />
        </motion.div>
    );
};
