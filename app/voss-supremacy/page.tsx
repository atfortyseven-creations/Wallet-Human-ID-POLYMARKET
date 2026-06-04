import { VOSS_MASTER_MATRIX } from '@/lib/vossAnalyticsEngine';

export const metadata = {
  title: 'VOSS 2026 Strategic Roadmap | Whale Alert Network',
  description: 'The 500 Vectors of Institutional Deployment.',
};

export default function VossSupremacyPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] font-sans selection:bg-[#EAE5D9] p-8 md:p-16">
      <div className="max-w-[2560px] mx-auto space-y-12 text-left">
        <header className="border-b-[1px] border-[#EAE5D9] pb-8 mb-16">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#8C8C8C] mb-4">
            CONFIDENTIAL // SYSTEM ARCHITECTURE V4.2.0 EXTENSION
          </p>
          <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-6">
            VOSS 2026: The 500 Vectors of Strategic Deployment
          </h1>
          <p className="text-lg md:text-xl text-[#666666] max-w-3xl leading-relaxed">
            Institutional-grade analytics deployment. Constructed on the principles of Zero-Trust Architecture, Cryptographic Permanence, and Enterprise Standards. Every signal sourced directly from live blockchain state. 100% Non-Custodial. 100% Trustless.
          </p>
        </header>

        <div className="grid gap-8">
          {Array.from({ length: 10 }).map((_, catIndex) => {
            const categoryItems = VOSS_MASTER_MATRIX.filter(item => item.category === catIndex + 1);
            if (!categoryItems.length) return null;
            
            return (
              <section key={catIndex} className="mb-16">
                <h2 className="text-2xl font-medium tracking-tight mb-8 sticky top-0 bg-[#FDFBF7]/90 backdrop-blur-sm py-4 z-10 border-b border-[#EAE5D9]">
                  Categoría {catIndex + 1}: {categoryItems[0].categoryName}
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {categoryItems.map((item) => (
                    <article 
                      key={item.id} 
                      className="bg-white border border-[#EAE5D9] p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-mono text-[#8C8C8C]">#{item.id}</span>
                        <span className={`text-xs font-mono px-2 py-1 uppercase tracking-wider ${
                          item.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                          item.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          Prio: {item.priority}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                      
                      <div className="space-y-3 text-sm text-[#404040]">
                        <p><strong className="text-[#1A1A1A]">Descripción:</strong> {item.description}</p>
                        <p><strong className="text-[#1A1A1A]">Superioridad:</strong> {item.competitiveEdge}</p>
                        <p><strong className="text-[#1A1A1A]">Implementación:</strong> {item.implementation}</p>
                        
                        <div className="pt-4 mt-4 border-t border-[#F2F0EA] grid grid-cols-2 gap-4">
                          <div>
                            <span className="block text-xs uppercase tracking-wider text-[#8C8C8C]">Esfuerzo</span>
                            <span className="font-mono">{item.effort}</span>
                          </div>
                          <div>
                            <span className="block text-xs uppercase tracking-wider text-[#8C8C8C]">Riesgos</span>
                            <span className="truncate block" title={item.risks}>{item.risks}</span>
                          </div>
                        </div>
                        <div className="bg-[#F9F8F6] p-3 mt-4 border border-[#EAE5D9]">
                          <span className="block text-xs uppercase tracking-wider text-[#8C8C8C] mb-1">Impacto Esperado</span>
                          <span className="font-medium">{item.impact}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <footer className="mt-24 border-t-[1px] border-[#1A1A1A] pt-12 pb-24">
          <h2 className="text-3xl font-light mb-8">MASTER EXECUTION PLAN (2026-2027)</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#1A1A1A] text-white p-8">
               <h3 className="font-mono text-sm tracking-widest text-[#8C8C8C] mb-4">PHASE 1 // DAYS 1-30</h3>
               <p className="text-lg font-medium mb-2">Architectural Privatety</p>
               <p className="text-sm text-gray-400">Implementation 1-125. Transition to Rust Bindings and ZK-Rollup Integration. Initial liquidity provisioning protocols established.</p>
            </div>
            <div className="bg-[#1A1A1A] text-white p-8">
               <h3 className="font-mono text-sm tracking-widest text-[#8C8C8C] mb-4">PHASE 2 // DAYS 31-90</h3>
               <p className="text-lg font-medium mb-2">Institutional Distribution</p>
               <p className="text-sm text-gray-400">Deployment 126-250. Activation of Secure Enclaves and P2P WebRTC Data Ingestion. Global latency optimization {`<`} 2ms.</p>
            </div>
            <div className="bg-[#1A1A1A] text-white p-8">
               <h3 className="font-mono text-sm tracking-widest text-[#8C8C8C] mb-4">PHASE 3 // DAYS 91-180</h3>
               <p className="text-lg font-medium mb-2">Sustained Growth Engine</p>
               <p className="text-sm text-gray-400">Elements 251-500. Protocol state validation via EigenLayer. Formal establishment as the institutional industry standard for on-chain intelligence.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
