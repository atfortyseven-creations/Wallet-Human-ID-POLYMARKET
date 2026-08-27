import re

with open('components/landing/ImmersiveManifestoLanding.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

faq_pattern = r'function FAQSection\(\) \{.*?\n\}\n(?=// ─── Final CTA)'
faq_replacement = """function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  const FAQS = [
    { q: "¿Que es Ledger Chat?", a: "Ledger Chat es una aplicacion de comunicacion encriptada de conocimiento cero asegurada por la red Aztec." },
    { q: "¿Cuales son las ventajas sobre otras apps?", a: "A diferencia de WhatsApp o Telegram, Ledger Chat no requiere tu numero de telefono, no almacena metadatos y no utiliza servidores centrales vulnerables." },
    { q: "¿Estan mis mensajes guardados en servidores?", a: "No. Los mensajes estan encriptados de extremo a extremo usando claves X25519 intercambiadas directamente entre billeteras y transmitidas de igual a igual via WebRTC. Los nodos solo sirven para descubrimiento." },
    { q: "¿Necesito una billetera de criptomonedas?", a: "El acceso con Passkey y Face ID esta disponible para cuentas rapidas, pero una billetera en custodia propia garantiza acceso absoluto a todo el ecosistema de privacidad." },
  ];
  return (
    <section className="w-full py-24 md:py-36 px-6 bg-white border-t border-black/[0.05]">
      <div className="w-full max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="mb-14 text-center">
          <h2 className="text-[32px] md:text-[48px] font-black tracking-tight text-black" style={{ fontFamily: "var(--font-aztec-serif), Georgia, serif" }}>Preguntas Frecuentes</h2>
        </motion.div>
        <div className="flex flex-col divide-y divide-black/[0.06]">
          {FAQS.map((f, i) => (
            <div key={i} className="py-5">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-4 text-left">
                <span className="text-[17px] font-bold text-black leading-snug">{f.q}</span>
                <span className={`shrink-0 w-7 h-7 rounded-full border-2 border-black/10 flex items-center justify-center transition-transform ${open === i ? "rotate-45" : ""}`}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.p initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: "auto", marginTop: 12 }} exit={{ opacity: 0, height: 0, marginTop: 0 }} className="text-[15px] text-black/60 leading-relaxed overflow-hidden">
                    {f.a}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
"""
content = re.sub(faq_pattern, faq_replacement, content, flags=re.DOTALL)

cta_pattern = r'function FinalCTASection\(\) \{.*?\n\}\n(?=// ─── Root export)'
cta_replacement = """function FinalCTASection() {
  return (
    <section className="w-full py-28 md:py-40 px-6 bg-white text-black text-center border-t border-black/[0.05]">
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: EASE }} className="max-w-2xl mx-auto">
        <span className="block text-[11px] font-mono uppercase tracking-[0.3em] text-black/40 mb-5">El futuro es AHORA</span>
        <h2 className="text-[36px] md:text-[60px] font-black leading-tight tracking-tight mb-6 text-black" style={{ fontFamily: "var(--font-aztec-serif), Georgia, serif" }}>¿Listo para entrar?</h2>
        <p className="text-[17px] text-black/50 leading-relaxed mb-12 max-w-lg mx-auto">Conectate ahora mediante Face ID, Passkeys o tu billetera descentralizada y reclama tu identidad absoluta.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/connect" className="w-full sm:w-auto px-10 py-4 bg-black text-white rounded-full text-[15px] font-black hover:bg-black/80 active:scale-95 transition-all hover:-translate-y-0.5 shadow-[0_6px_30px_rgba(0,0,0,0.15)]">Conectar Ahora →</Link>
          <Link href="/chat" className="w-full sm:w-auto px-10 py-4 border-2 border-black/12 text-black rounded-full text-[15px] font-bold hover:bg-zinc-50 active:scale-95 transition-all">Iniciar Ledger Chat</Link>
        </div>
      </motion.div>
    </section>
  );
}
"""
content = re.sub(cta_pattern, cta_replacement, content, flags=re.DOTALL)

with open('components/landing/ImmersiveManifestoLanding.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("FAQ and CTA rewritten.")
