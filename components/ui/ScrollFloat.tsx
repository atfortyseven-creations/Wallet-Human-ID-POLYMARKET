"use client";

import { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils'; // Assuming a cn utility exists, or I'll use standard concatenation

// Only register plugin once in client-side environment
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

interface ScrollFloatProps {
    children: string;
    scrollContainerRef?: React.RefObject<HTMLElement>;
    containerClassName?: string;
    textClassName?: string;
    animationDuration?: number;
    ease?: string;
    scrollStart?: string;
    scrollEnd?: string;
    stagger?: number;
}

export const ScrollFloat = ({
    children,
    scrollContainerRef,
    containerClassName = '',
    textClassName = '',
    animationDuration = 1,
    ease = 'back.inOut(2)',
    scrollStart = 'center bottom+=50%',
    scrollEnd = 'bottom bottom-=40%',
    stagger = 0.03
}: ScrollFloatProps) => {
    const containerRef = useRef<HTMLHeadingElement>(null);

    const splitText = useMemo(() => {
        const text = typeof children === 'string' ? children : '';
        return text.split('').map((char, index) => (
            <span 
                className="char inline-block" 
                key={index}
                style={{ willChange: 'opacity, transform' }}
            >
                {char === ' ' ? '\u00A0' : char}
            </span>
        ));
    }, [children]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        // Use Lenis or standard window if scrollContainerRef is not provided
        const scroller = scrollContainerRef?.current || window;

        const charElements = el.querySelectorAll('.char');

        const ctx = gsap.context(() => {
            gsap.fromTo(
                charElements,
                {
                    opacity: 0,
                    yPercent: 120,
                    scaleY: 2.3,
                    scaleX: 0.7,
                    transformOrigin: '50% 0%'
                },
                {
                    duration: animationDuration,
                    ease: ease,
                    opacity: 1,
                    yPercent: 0,
                    scaleY: 1,
                    scaleX: 1,
                    stagger: stagger,
                    scrollTrigger: {
                        trigger: el,
                        scroller: scroller,
                        start: scrollStart,
                        end: scrollEnd,
                        scrub: true,
                        // markers: false, // Set to true for debugging
                    }
                }
            );
        }, el);

        return () => ctx.revert(); // Clean up on unmount
    }, [scrollContainerRef, animationDuration, ease, scrollStart, scrollEnd, stagger]);

    return (
        <h2 
            ref={containerRef} 
            className={cn("scroll-float overflow-hidden", containerClassName)}
        >
            <span className={cn("scroll-float-text inline-block font-black leading-[1.5]", textClassName)}>
                {splitText}
            </span>
        </h2>
    );
};
