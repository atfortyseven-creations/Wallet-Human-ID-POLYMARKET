'use client';

import { IDKitWidget, VerificationLevel, ISuccessResult } from '@worldcoin/idkit';
import { useWorld } from '@/src/context/WorldContext';
import { ScanFace } from 'lucide-react';
import { Toaster, toast } from 'sonner';

export const WorldGate = ({ children }: { children: React.ReactNode }) => {
    const { isHuman, verifyHumanity } = useWorld();

    const onSuccess = (result: ISuccessResult) => {
        verifyHumanity(result);
        toast.success("Humanity Verified: Protocol Unlocked", {
            description: "Welcome to the Sovereign Layer."
        });
        // Optional: Reload to ensure all components re-render if context isn't enough for some deep trees (though context should work)
        // window.location.reload(); 
    };

    return (
        <>
            {/* CAPA DE VERIFICACIÓN FLOTANTE (Solo visible si NO es humano) */}
            {!isHuman && (
                <div className="fixed bottom-8 right-8 z-[100] animate-bounce-slow">
                    <IDKitWidget
                        app_id="app_staging_560824623761352378912739" // Example Staging ID
                        action="login"
                        onSuccess={onSuccess}
                        handleVerify={async (proof: unknown) => {
                            // Simulación de verificación backend
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            return;
                        }}
                        verification_level={VerificationLevel.Orb}
                    >
                        {({ open }: { open: () => void }) => (
                            <button
                                onClick={open}
                                className="flex items-center gap-3 bg-white text-black px-6 py-4 rounded-full font-bold shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform"
                            >
                                <ScanFace size={24} />
                                <span>Verify Humanity</span>
                            </button>
                        )}
                    </IDKitWidget>
                </div>
            )}

            {/* RENDERIZADO DEL CONTENIDO */}
            {children}
        </>
    );
};
