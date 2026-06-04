"use client";

import React from 'react';
import { motion } from 'framer-motion';

export function WaveFooter() {
  return (
    <div className="relative w-full overflow-hidden mt-32 leading-[0] pt-[15%] pointer-events-none">
       {/* Deep glowing background behind waves */}
       <div className="absolute bottom-0 left-0 w-full h-[50%] bg-[#00f5ff]/5 blur-3xl" />
       
       <motion.svg 
          className="absolute top-0 left-0 w-[200%] h-full"
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
       >
          <path 
             fill="rgba(0, 245, 255, 0.05)" 
             d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118,130.85,121.75,195.45,108.41,239.5,99.39,281.33,76.54,321.39,56.44Z"
          />
       </motion.svg>

       <motion.svg 
          className="absolute top-0 left-0 w-[200%] h-full mix-blend-screen"
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          animate={{ x: ["-50%", "0%"] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
       >
          <path 
             fill="rgba(159, 0, 255, 0.1)" 
             d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118,130.85,121.75,195.45,108.41,239.5,99.39,281.33,76.54,321.39,56.44Z"
          />
       </motion.svg>
       
       <div className="absolute bottom-0 w-full h-8 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
    </div>
  );
}
