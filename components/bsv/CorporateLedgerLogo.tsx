import Image from 'next/image';
import { SplashContainer } from '@/components/shared/SplashContainer';

export function CorporateHLLogo({ className = "" }: { className?: string }) {
    return (
        <SplashContainer className={`${className}`}>
            <Image
                src="/official-ledger-monochrome.png"
                alt="Ledger Logo"
                fill
                className="object-contain"
                priority
                unoptimized={true}
            />
        </SplashContainer>
    );
}
