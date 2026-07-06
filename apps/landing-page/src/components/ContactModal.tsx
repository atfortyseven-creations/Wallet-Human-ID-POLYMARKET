'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function ContactModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus('success');
        setTimeout(() => {
          onClose();
          setStatus('idle');
        }, 3000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-parchment w-full max-w-lg border-2 border-ink shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden"
            >
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-ink hover:text-parchment transition-colors border-2 border-transparent hover:border-ink"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="p-8">
                <h2 className="text-3xl font-serif font-bold text-ink mb-2">Book a Demo</h2>
                <p className="text-ink/70 mb-8">
                  Learn how Studio Provenance can help you meet the 2027 EU Digital Product Passport deadlines.
                </p>

                {status === 'success' ? (
                  <div className="bg-chartreuse border-2 border-ink p-6 text-center">
                    <h3 className="font-bold text-xl mb-2">Request Received</h3>
                    <p>Our compliance team will contact you within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold uppercase tracking-wider mb-2">Name</label>
                      <input required name="name" type="text" className="w-full p-3 bg-white border-2 border-ink focus:outline-none focus:ring-2 focus:ring-chartreuse" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold uppercase tracking-wider mb-2">Company Email</label>
                      <input required name="email" type="email" className="w-full p-3 bg-white border-2 border-ink focus:outline-none focus:ring-2 focus:ring-chartreuse" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold uppercase tracking-wider mb-2">Company Name</label>
                      <input required name="company" type="text" className="w-full p-3 bg-white border-2 border-ink focus:outline-none focus:ring-2 focus:ring-chartreuse" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold uppercase tracking-wider mb-2">Primary Interest</label>
                      <select name="interest" className="w-full p-3 bg-white border-2 border-ink focus:outline-none focus:ring-2 focus:ring-chartreuse">
                        <option value="battery">Battery Passport (2027)</option>
                        <option value="textile">Textile / Apparel DPP</option>
                        <option value="electronics">Electronics</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <button 
                      type="submit" 
                      disabled={status === 'loading'}
                      className="w-full bg-orchid text-parchment py-4 font-bold uppercase tracking-widest border-2 border-ink hover:bg-ink hover:text-parchment transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] disabled:opacity-50 mt-4"
                    >
                      {status === 'loading' ? 'Submitting...' : 'Request Demo'}
                    </button>
                    {status === 'error' && (
                      <p className="text-red-500 text-sm mt-2 font-bold">An error occurred. Please try again.</p>
                    )}
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
