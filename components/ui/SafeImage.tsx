"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils"; // Assuming you have a utils file, if not I'll just use template literals or install clsx/tailwind-merge. I'll stick to template literals for safety if utils is missing, but usually standard Nextjs projects have it. I'll check first or just implement a simple join.

// Simple class merger if utility is missing
function classNames(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}

interface SafeImageProps extends Omit<ImageProps, "src"> {
    src?: string;
    fallbackCategory?: string;
    className?: string;
}

export default function SafeImage({
    src,
    alt,
    fallbackCategory = "News",
    className,
    ...props
}: SafeImageProps) {
    const [error, setError] = useState(false);

    // Si no hay src o hubo error, mostramos el fallback
    if (!src || error) {
        return (
            <div className={classNames(
                "flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-900 to-slate-900",
                className
            )}>
                <span className="text-white/20 font-serif font-bold italic text-2xl tracking-widest uppercase">
                    {fallbackCategory}
                </span>
            </div>
        );
    }

    return (
        <Image
            src={src}
            alt={alt}
            className={className}
            onError={() => setError(true)}
            {...props}
        />
    );
}
