"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LineChart, Globe, Target, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function MobileNavBar() {
    const pathname = usePathname();

    const navItems = [
        { href: '/dashboard', label: 'Dashboard',     icon: LayoutDashboard },
        { href: '/news',      label: 'Analytics',  icon: Globe },
        { href: '/',          label: 'Home',          icon: Home },
        { href: '/portfolio', label: 'Portfolio',     icon: LineChart },
        { href: '/registry',  label: 'Registry',      icon: Target },
    ];

    return (
        <motion.nav 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 z-[100] md:hidden bg-white  backdrop-blur-3xl border-t border-black/5  pb-[env(safe-area-inset-bottom)] transform-gpu transition-colors duration-300"
        >
            <div className="flex justify-evenly items-center px-2 py-2">
                {navItems.map((item, index) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    const isCenter = index === 2;
                    
                    return (
                        <Link 
                            key={item.href} 
                            href={item.href}
                            className="relative flex flex-col items-center justify-center w-full h-14 group"
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                            {/* Active top line */}
                            {isActive && !isCenter && (
                                <motion.div
                                    layoutId="activeTabMobile"
                                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-black  rounded-b-full"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                            
                            <div className={cn(
                                "flex items-center justify-center transition-all duration-300",
                                isCenter ? "w-12 h-12 bg-black  rounded-full shadow-lg -translate-y-4" : "w-10 h-10 rounded-2xl",
                                isActive && !isCenter ? "text-black " : "text-black/40 "
                            )}>
                                <Icon 
                                    size={isCenter ? 22 : 20} 
                                    strokeWidth={isActive || isCenter ? 2.5 : 2}
                                    className={cn(
                                        "transition-colors duration-300",
                                        isCenter ? "text-white " : "group-hover:text-black "
                                    )}
                                />
                            </div>
                            
                            {!isCenter && (
                                <span className={cn(
                                    "text-[9px] font-mono tracking-widest uppercase transition-colors duration-300 mt-0.5",
                                    isActive ? "text-black  font-bold" : "text-black/40  font-medium group-hover:text-black/70 "
                                )}>
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </div>
        </motion.nav>
    );
}

