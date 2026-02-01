"use client";

import React from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

interface Props {
    variant: 'hero' | 'side-peek' | 'floating' | 'footer-guard' | 'center';
    progress?: MotionValue<number>; // Optional external scroll progress
}

export function ImmersiveKittens({ variant, progress }: Props) {
    // Determine layout and animation based on variant
    
    // 1. HERO VARIANT (Classic Left/Right)
    if (variant === 'hero') {
        return (
            <div className="absolute inset-0 pointer-events-none z-10 flex justify-between items-end pb-0 md:pb-10 px-4 md:px-20 w-full max-w-[1800px] mx-auto transform-gpu">
                {/* Left Cat */}
                <motion.div 
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="w-[40%] md:w-[25%] max-w-[400px] will-change-transform"
                >
                    <img 
                        src="/models/cat12.png" 
                        alt="Human DeFi Cat Left" 
                        className="w-full h-auto object-contain drop-shadow-2xl"
                    />
                </motion.div>

                {/* Right Cat */}
                <motion.div 
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="w-[40%] md:w-[25%] max-w-[400px] will-change-transform"
                >
                    <img 
                        src="/models/cat12.png" 
                        alt="Human DeFi Cat Right" 
                        className="w-full h-auto object-contain drop-shadow-2xl transform scale-x-[-1]" 
                    />
                </motion.div>
            </div>
        );
    }

    // 2. SIDE PEEK VARIANT (For Stacked Content)
    // Cats peek from the sides as you scroll
    if (variant === 'side-peek') {
        return (
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden h-full w-full">
               {/* Left Peeker */}
               <motion.div 
                   className="fixed top-1/2 left-0 w-[15vw] max-w-[200px] -translate-y-1/2 -translate-x-1/2"
                   animate={{ x: [-20, 0, -20], rotate: [0, 5, 0] }}
                   transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
               >
                    <img src="/models/cat12.png" className="w-full drop-shadow-xl" />
               </motion.div>
               
               {/* Right Peeker */}
               <motion.div 
                   className="fixed top-2/3 right-0 w-[15vw] max-w-[200px] -translate-y-1/2 translate-x-1/2 scale-x-[-1]"
                   animate={{ x: [20, 0, 20], rotate: [0, -5, 0] }}
                   transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
               >
                     <img src="/models/cat12.png" className="w-full drop-shadow-xl" />
               </motion.div>
            </div>
        );
    }

    // 3. FLOATING VARIANT (For Developer/Less crowded pages)
    // Cats float gently in 3D space
    if (variant === 'floating') {
        return (
             <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <motion.div
                    className="absolute top-[20%] right-[10%] w-[20vw] max-w-[300px] opacity-20 blur-[1px]"
                    animate={{ 
                        y: [0, -40, 0],
                        rotate: [0, 10, 0]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                >
                    <img src="/models/cat12.png" className="w-full" />
                </motion.div>

                <motion.div
                    className="absolute bottom-[20%] left-[10%] w-[15vw] max-w-[250px] opacity-20 blur-[1px] scale-x-[-1]"
                    animate={{ 
                        y: [0, -30, 0],
                        rotate: [0, -10, 0]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                >
                    <img src="/models/cat12.png" className="w-full" />
                </motion.div>
             </div>
        );
    }

     // 4. CENTER VARIANT (For Wallet/Card - Focus)
    if (variant === 'center') {
        return (
             <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
                <motion.div
                    className="absolute bottom-[-10%] w-[60vw] max-w-[600px] opacity-10"
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                >
                    <img src="/models/cat12.png" className="w-full" />
                </motion.div>
             </div>
        );
    }

    return null;
}
