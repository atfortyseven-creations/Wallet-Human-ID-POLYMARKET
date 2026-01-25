"use client";

import { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface SafeImageProps extends Omit<ImageProps, "src" | "fallbackSrc"> {
    src?: string | null;
    fallbackCategory?: string;
    className?: string;
}

// Map categories to high-quality curated Unsplash collections/images
const FALLBACK_IMAGES: Record<string, string> = {
    "Crypto": "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&q=80&w=1000",
    "Finance": "https://images.unsplash.com/photo-1611974765270-ca1258634369?auto=format&fit=crop&q=80&w=1000",
    "Tech": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000",
    "Politics": "https://images.unsplash.com/photo-1529101091760-6149d3c80a9c?auto=format&fit=crop&q=80&w=1000",
    "Sports": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=1000",
    "Climate & Science": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=1000",
    "Culture": "https://images.unsplash.com/photo-1514525253440-b393452e8d03?auto=format&fit=crop&q=80&w=1000",
    "World": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000",
    "Trending": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1000",
    "Default": "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=1000"
};

export default function SafeImage({
    src,
    alt,
    fallbackCategory = "Trending",
    className,
    ...props
}: SafeImageProps) {
    // Determine start state: error if src is missing or empty
    const [hasError, setHasError] = useState(!src || src === "");
    const [imgSrc, setImgSrc] = useState<string | null>(src || null);

    useEffect(() => {
        setHasError(!src || src === "");
        setImgSrc(src || null);
    }, [src]);

    const handleOnError = () => {
        setHasError(true);
    };

    // Determine final source
    let finalSrc = imgSrc;
    if (hasError) {
        const category = Object.keys(FALLBACK_IMAGES).find(key =>
            (fallbackCategory || "Default").toLowerCase().includes(key.toLowerCase())
        ) || "Default";
        finalSrc = FALLBACK_IMAGES[category];
    }

    if (!finalSrc) return null;

    return (
        <div className={`relative overflow-hidden bg-gray-800 w-full h-full ${className}`}>
            <img
                src={finalSrc}
                alt={alt}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                loading="lazy"
                referrerPolicy="no-referrer" // Critical for hotlinking
                onError={handleOnError}
            />
            {/* Visual overlay for better text readability if used as background */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent pointer-events-none" />
        </div>
    );
}
