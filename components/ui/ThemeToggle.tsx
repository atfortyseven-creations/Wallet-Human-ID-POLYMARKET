"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const options = [
        { id: "light", icon: Sun, label: "Light" },
        { id: "system", icon: Monitor, label: "System" },
        { id: "dark", icon: Moon, label: "Dark" },
    ];

    return (
        <div className="flex bg-black/10 border border-white/10 p-1 rounded-full backdrop-blur-sm -mx-1 mt-2">
            {options.map((option) => {
                const Icon = option.icon;
                const isActive = theme === option.id;
                return (
                    <button
                        key={option.id}
                        onClick={() => setTheme(option.id)}
                        className={`relative flex-1 flex justify-center py-1.5 rounded-full transition-all ${isActive ? "text-white" : "text-white/40 hover:text-white/70"
                            }`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="theme-pill"
                                className="absolute inset-0 bg-white/10 rounded-full border border-white/10 shadow-sm"
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            />
                        )}
                        <Icon className="w-3.5 h-3.5 relative z-10" strokeWidth={2} />
                    </button>
                );
            })}
        </div>
    );
}
