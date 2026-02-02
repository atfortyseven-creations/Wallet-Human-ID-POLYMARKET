import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen bg-[#EAEADF] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background Ambient Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-8 animate-fade-in-up">
            {/* Custom Logo Section */}
            <div className="flex flex-col items-center">
                 <img 
                    src="/brand-logo.png" 
                    alt="Human DeFi Logo" 
                    className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-2xl mb-4 hover:scale-105 transition-transform duration-500"
                 />
                 <h1 className="text-4xl md:text-5xl font-black text-[#1F1F1F] tracking-tighter mb-2 text-center">
                    HUMAN<span className="text-[#1F1F1F]/40">DeFi</span>
                 </h1>
                 <p className="text-[#1F1F1F]/60 font-medium text-center max-w-sm leading-relaxed">
                    Billetera Soberana Inteligente: <br/> 
                    IA, Privacidad zkSNARKs y Control Total.
                 </p>
            </div>

            {/* Clerk Sign In Component */}
            <SignIn 
                appearance={{
                    elements: {
                        rootBox: "w-full shadow-2xl rounded-3xl overflow-hidden",
                        card: "bg-white/80 backdrop-blur-xl border border-white/20 shadow-none p-8 rounded-3xl",
                        headerTitle: "hidden", // Hide default title since we have a custom one
                        headerSubtitle: "hidden",
                        socialButtonsBlockButton: "rounded-xl border border-[#1F1F1F]/10 hover:bg-[#1F1F1F]/5 transition-all h-12",
                        socialButtonsBlockButtonText: "font-bold text-[#1F1F1F]",
                        dividerLine: "bg-[#1F1F1F]/10",
                        dividerText: "text-[#1F1F1F]/40 font-bold",
                        formFieldInput: "rounded-xl border-[#1F1F1F]/10 bg-white/50 focus:ring-[#1F1F1F]/20 h-12",
                        formButtonPrimary: "bg-[#1F1F1F] hover:bg-black text-white h-12 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all",
                        footerActionLink: "text-[#1F1F1F] font-bold hover:underline",
                        identityPreviewText: "text-[#1F1F1F] font-bold",
                        formFieldLabel: "text-[#1F1F1F]/60 font-medium"
                    },
                    layout: {
                        socialButtonsPlacement: "top",
                        shimmer: true
                    }
                }}
            />
        </div>
    </div>
  );
}
