import Image from 'next/image';
import { SplashContainer } from '@/components/shared/SplashContainer';

export function CorporateWhaleLogo({ className = "" }: { className?: string }) {
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
