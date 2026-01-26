'use client';

import { IDKitWidget, VerificationLevel, ISuccessResult } from '@worldcoin/idkit';
import { useWorld } from '@/src/context/WorldContext';
import { ScanFace } from 'lucide-react';
import { Toaster, toast } from 'sonner';

export const WorldGate = ({ children }: { children: React.ReactNode }) => {
    const { isHuman, verifyHumanity } = useWorld();

    const handleProof = async (result: ISuccessResult) => {
        const toastId = toast.loading("Verificando prueba criptográfica (ZK-Proof)...");

        try {
            // 1. Enviar prueba al Backend
            const res = await fetch('/api/verify-human', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(result),
            });

            const data = await res.json();

            if (!res.ok || !data.verified) {
                throw new Error(data.detail || "Verificación fallida");
            }

            // 2. Éxito: Desbloquear UI
            toast.dismiss(toastId);
            toast.success("✨ Identidad Soberana Verificada");
            verifyHumanity(data);

        } catch (error) {
            toast.dismiss(toastId);
            toast.error("Error: No se pudo verificar tu humanidad.");
            console.error(error);
        }
    };

    return (
        <>
            {!isHuman && (
                <div className="fixed bottom-10 right-10 z-[100] animate-bounce-slow">
                    <IDKitWidget
                        app_id={process.env.NEXT_PUBLIC_WLD_APP_ID || "app_staging_560824623761352378912739"}
                        action="login"
                        onSuccess={handleProof}
                        handleVerify={async (proof: unknown) => {
                            // World ID requiere esta función, pero validamos en onSuccess
                            return;
                        }}
                        verification_level={VerificationLevel.Orb}
                    >
                        {({ open }: { open: () => void }) => (
                            <button
                                onClick={open}
                                className="flex items-center gap-3 bg-white text-black px-6 py-4 rounded-full font-bold shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-105 transition-transform border-4 border-white/20 backdrop-blur-md"
                            >
                                <ScanFace size={24} className="animate-pulse" />
                                <span>VERIFY HUMANITY</span>
                            </button>
                        )}
                    </IDKitWidget>
                </div>
            )}
            {children}
        </>
    );
};
