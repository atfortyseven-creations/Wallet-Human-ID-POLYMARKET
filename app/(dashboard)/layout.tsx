import VerificationGuard from "@/components/guards/VerificationGuard";

export default function InternalLayout({ children }: { children: React.ReactNode }) {
    return (
        <VerificationGuard>
            <div className="relative min-h-screen bg-black overflow-x-hidden">

                {/* 2. EL CONTENIDO (Encima del globo con z-index) */}
                <div className="relative z-20">
                    <main className="container mx-auto px-4 py-8">
                        {children}
                    </main>
                </div>
            </div>
        </VerificationGuard>
    );
}
