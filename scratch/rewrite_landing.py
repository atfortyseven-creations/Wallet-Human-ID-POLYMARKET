import re

with open('components/landing/ImmersiveManifestoLanding.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace HeroSection
hero_pattern = r'function HeroSection\(\) \{.*?\}\n\n'
hero_replacement = """function HeroSection() {
  return (
    <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center bg-white px-6 overflow-hidden pt-20">
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_70%,transparent_100%)]" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE }} className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center">
        <div className="flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-zinc-50 border border-black/10">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-[12px] font-bold uppercase tracking-[0.18em] text-black/55">El futuro de la comunicacion</span>
        </div>
        <h1 className="text-[50px] sm:text-[70px] md:text-[90px] lg:text-[110px] leading-[0.92] tracking-tight font-black text-black mb-8" style={{ fontFamily: "var(--font-aztec-serif), Georgia, serif" }}>
          Privacidad<br /><span className="text-black/35">absoluta.</span>
        </h1>
        <p className="text-[18px] md:text-[21px] text-black/60 leading-relaxed font-medium max-w-[660px] mb-12">
          Humanity Ledger presenta una nueva era donde la libertad de comunicacion es un derecho inquebrantable. Descubre Ledger Chat, un ecosistema donde ninguna corporacion puede rastrear o almacenar tu informacion personal. Todo esta encriptado nativamente desde tu dispositivo.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link href="/chat" className="w-full sm:w-auto px-9 py-4 bg-black text-white rounded-full text-[15px] font-bold hover:bg-black/80 active:scale-95 transition-all shadow-[0_6px_30px_rgba(0,0,0,0.15)] hover:-translate-y-0.5">Acceder a Ledger Chat</Link>
        </div>
      </motion.div>
    </section>
  );
}

"""

# Replace WhatIsSection
what_pattern = r'function WhatIsSection\(\) \{.*?\}\n\n'
what_replacement = """function WhatIsSection() {
  return (
    <section className="w-full bg-zinc-50 text-black py-24 md:py-36 px-6 border-t border-black/[0.05]">
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, ease: EASE }}>
          <span className="block text-[11px] font-mono uppercase tracking-[0.3em] text-black/40 mb-5">El Estandar Definitivo</span>
          <h2 className="text-[32px] md:text-[48px] font-black leading-tight tracking-tight text-black mb-6" style={{ fontFamily: "var(--font-aztec-serif), Georgia, serif" }}>
            Superando a<br /><span className="text-black/35">la competencia.</span>
          </h2>
          <p className="text-[17px] text-black/60 leading-relaxed">
            Aplicaciones tradicionales como Telegram o WhatsApp requieren tu numero de telefono, comprometiendo tu identidad desde el primer segundo, almacenando metadatos y contactos en servidores centralizados expuestos a vulnerabilidades y censura global.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8, ease: EASE, delay: 0.1 }} className="flex flex-col gap-5">
          {[
            { n: "01", t: "Sin numeros telefonicos", d: "Tu identidad se protege utilizando identificadores nativos descentralizados que no dejan huellas en la red." },
            { n: "02", t: "Encriptacion de extremo a extremo real", d: "Cada mensaje audio y archivo multimedia es encriptado en el dispositivo antes de transitar por la red, garantizando inmunidad total." },
            { n: "03", t: "Soberania de datos", d: "No existen servidores centrales que acumulen tu informacion. Tu eres el unico custodio de tus conversaciones privadas." },
          ].map((item) => (
            <div key={item.n} className="flex gap-4 items-start p-5 bg-white rounded-2xl border border-black/[0.06]">
              <span className="font-mono text-[10px] text-black/30 tracking-widest mt-1 shrink-0">{item.n}</span>
              <div>
                <p className="font-bold text-[15px] text-black mb-1">{item.t}</p>
                <p className="text-[13px] text-black/50 leading-relaxed">{item.d}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

"""

# Replace LedgerChatSection
chat_pattern = r'function LedgerChatSection\(\) \{.*?(?=\n// ─── Aztec Strip)/s'
# Actually wait, re.sub with re.DOTALL is safer.

import re
content = re.sub(r'function HeroSection\(\) \{.*?\n\}\n', hero_replacement, content, flags=re.DOTALL)
content = re.sub(r'function WhatIsSection\(\) \{.*?\n\}\n', what_replacement, content, flags=re.DOTALL)

chat_replacement = """function LedgerChatSection() {
  return (
    <section className="w-full py-24 md:py-36 px-6 bg-white border-t border-black/[0.05]">
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-14">
          <div className="w-10 h-10 rounded-2xl bg-[#1C7AFF] flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-black/40">Aplicacion Principal</p>
            <h2 className="text-[17px] font-black text-black tracking-tight">Ledger Chat Integrado</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: EASE }}>
            <h3 className="text-[40px] md:text-[56px] font-black leading-[0.95] tracking-tight text-black mb-6" style={{ fontFamily: "var(--font-aztec-serif), Georgia, serif" }}>
              Siente la<br /><span className="text-black/35">verdadera libertad.</span>
            </h3>
            <p className="text-[17px] text-black/60 leading-relaxed mb-8">
              Experimenta un nivel de conexion y seguridad inigualable. Ledger Chat incluye funcionalidades avanzadas de manera totalmente anonima y privada, integrando biometria nativa para un acceso veloz y blindado.
            </p>
            <div className="flex flex-col gap-3 mb-10">
              {[
                "Llamadas de voz y video en alta resolucion sin intermediarios",
                "Mensajes de audio cristalinos y stickers exclusivos",
                "Acceso nativo integrado con Face ID y biometria",
                "Ausencia absoluta de servidores espia",
              ].map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <svg className="shrink-0 text-emerald-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  <span className="text-[14px] text-black/70 font-medium">{f}</span>
                </div>
              ))}
            </div>
            <Link href="/chat" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-black text-white rounded-full text-[14px] font-bold hover:bg-black/80 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:-translate-y-0.5">Comenzar AHORA →</Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95, rotateY: 10 }} whileInView={{ opacity: 1, scale: 1, rotateY: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: EASE }} className="relative perspective-1000">
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 blur-2xl rounded-[40px] -z-10" />
            <div className="w-full bg-white border border-black/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col h-[500px]">
              <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between bg-zinc-50/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-[14px]">HL</div>
                  <div>
                    <p className="text-[14px] font-bold text-black leading-tight">Humanity Ledger</p>
                    <p className="text-[11px] text-emerald-600 font-medium">Conexion Asegurada</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 bg-[#FAFAFA] p-5 flex flex-col gap-4 overflow-y-auto">
                <div className="self-center px-3 py-1 bg-black/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-black/40">Hoy</div>
                <div className="self-start max-w-[85%] bg-white border border-black/10 rounded-2xl rounded-tl-sm p-4 shadow-sm">
                  <p className="text-[14px] text-black/80 leading-relaxed">Bienvenido a la red mas segura jamas creada. ¿Listo para experimentar la verdadera libertad de expresion?</p>
                </div>
                <div className="self-end max-w-[85%] bg-[#1C7AFF] text-white rounded-2xl rounded-tr-sm p-4 shadow-sm">
                  <p className="text-[14px] leading-relaxed">Totalmente. El futuro es nuestro.</p>
                </div>
              </div>
              <div className="p-4 bg-white border-t border-black/5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full border border-black/10 flex items-center justify-center shrink-0 text-black/40">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                </div>
                <div className="flex-1 h-10 bg-zinc-100 rounded-full flex items-center px-4 border border-black/5">
                  <span className="text-[13px] text-black/30">Escribe un mensaje...</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-[#1C7AFF] flex items-center justify-center shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
"""

content = re.sub(r'function LedgerChatSection\(\) \{.*?\n\}\n(?=// ─── Aztec Strip)', chat_replacement, content, flags=re.DOTALL)

with open('components/landing/ImmersiveManifestoLanding.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Landing page rewritten successfully.")
