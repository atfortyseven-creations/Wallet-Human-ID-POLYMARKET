import React from 'react';
import { SystemHeader } from '@/components/landing/SystemHeader';
import { SystemFooter } from '@/components/landing/SystemFooter';

export const metadata = {
  title: 'Contact Us - Humanity Ledger',
  description: 'Get in touch with the Humanity Ledger enterprise team.',
};

const BG = "url('/rectangle_large_type_2_a9c6cc1e1738c43864683c13c43314d9.jpg')";

export default function ContactPage() {
  return (
    <div
      className="min-h-screen flex flex-col text-black"
      style={{
        backgroundColor: '#ffffff',
        backgroundImage: BG,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center top',
        backgroundSize: 'contain',
      }}
    >
      <SystemHeader />

      <main className="flex-1 w-full pt-28 pb-24 px-6 md:px-12 flex flex-col items-center">
        <div className="max-w-3xl w-full">

          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-black/10 bg-black/5 mb-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-black/60">Enterprise</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-tight mb-6 text-black">
            Get in Touch.
          </h1>

          <p className="text-black/60 font-sans text-base leading-relaxed mb-12 max-w-xl">
            Want to integrate Humanity Ledger into your platform? Fill out the form below and a member of our team will get back to you within 24 hours.
          </p>

          <form className="flex flex-col gap-6 bg-white/80 border border-black/10 rounded-2xl p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-black/50">First Name</label>
                <input
                  type="text"
                  className="bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black placeholder:text-black/25 focus:outline-none focus:border-black/30 transition-colors"
                  placeholder="Jane"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-black/50">Last Name</label>
                <input
                  type="text"
                  className="bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black placeholder:text-black/25 focus:outline-none focus:border-black/30 transition-colors"
                  placeholder="Smith"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-black/50">Email Address</label>
              <input
                type="email"
                className="bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black placeholder:text-black/25 focus:outline-none focus:border-black/30 transition-colors"
                placeholder="jane@company.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-black/50">Company</label>
              <input
                type="text"
                className="bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black placeholder:text-black/25 focus:outline-none focus:border-black/30 transition-colors"
                placeholder="Acme Corp"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-black/50">How can we help?</label>
              <textarea
                rows={5}
                className="bg-black/[0.03] border border-black/10 rounded-xl px-4 py-3 text-sm text-black placeholder:text-black/25 focus:outline-none focus:border-black/30 transition-colors resize-none"
                placeholder="Tell us about your project..."
              />
            </div>

            <button
              type="button"
              className="mt-2 px-8 py-4 bg-black text-white font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-black/80 transition-all text-center active:scale-95"
            >
              Send Message
            </button>
          </form>

        </div>
      </main>

      <SystemFooter />
    </div>
  );
}
