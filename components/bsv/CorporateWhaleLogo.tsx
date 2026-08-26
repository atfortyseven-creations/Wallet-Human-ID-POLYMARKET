import Image from 'next/image';
import { SplashContainer } from '@/components/shared/SplashContainer';

export function CorporateHLLogo({ className = "" }: { className?: string }) {
    return (
        <SplashContainer className={`${className}`}>
            <Image
                src="/official-whale-monochrome.png"
                alt="Whale Logo"
                fill
                className="object-contain"
                priority
                unoptimized={true}
            />
        </SplashContainer>
    );
}
