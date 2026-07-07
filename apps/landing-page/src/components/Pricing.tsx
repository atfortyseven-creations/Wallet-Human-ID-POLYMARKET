'use client';

import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

const plans = [
  {
    name: 'Starter Pilot',
    description: 'Perfect for small suppliers needing immediate compliance.',
    price: '€499',
    period: '/month',
    features: [
      'Up to 1,000 Digital Product Passports',
      'Basic selective disclosure',
      'Standard EU DPP data model',
      'Community support'
    ],
    buttonText: 'Start Pilot',
    buttonClass: 'bg-parchment text-ink border-2 border-ink hover:bg-ink hover:text-parchment',
  },
  {
    name: 'Compliance Pro',
    description: 'For mid-to-large manufacturers with complex supply chains.',
    price: '€1,299',
    period: '/month',
    features: [
      'Up to 10,000 Digital Product Passports',
      'Advanced ZK privacy controls',
      'GS1 Digital Link compatibility',
      'API access & ERP integration',
      'Priority email support'
    ],
    buttonText: 'Go Pro',
    buttonClass: 'bg-chartreuse text-ink border-2 border-ink hover:bg-ink hover:text-parchment shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'Full custom deployment for global brands.',
    price: 'Custom',
    period: '',
    features: [
      'Unlimited Passports',
      'Custom ZK circuits',
      'Dedicated compliance manager',
      'ISBE official anchoring',
      '24/7 phone support'
    ],
    buttonText: 'Contact Sales',
    buttonClass: 'bg-parchment text-ink border-2 border-ink hover:bg-ink hover:text-parchment',
  }
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 px-4 bg-parchment border-b-2 border-ink relative">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-ink mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-ink/80 max-w-2xl mx-auto">
            Choose the right plan to ensure your supply chain meets the 2027 EU Digital Product Passport deadlines with absolute privacy.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -5 }}
              className={`border-2 border-ink p-8 bg-parchment flex flex-col ${plan.popular ? 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ring-2 ring-chartreuse ring-offset-4 ring-offset-parchment' : 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}
            >
              {plan.popular && (
                <span className="bg-chartreuse text-ink text-xs font-bold uppercase tracking-widest py-1 px-3 border-2 border-ink inline-block mb-4 self-start">
                  Most Popular
                </span>
              )}
              <h3 className="text-2xl font-serif font-bold text-ink mb-2">{plan.name}</h3>
              <p className="text-ink/70 mb-6 h-12">{plan.description}</p>
              
              <div className="mb-8">
                <span className="text-4xl font-bold text-ink">{plan.price}</span>
                <span className="text-ink/60 font-medium">{plan.period}</span>
              </div>
              
              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-3">
                    <div className="bg-chartreuse border-2 border-ink rounded-full p-0.5 shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-ink stroke-[3]" />
                    </div>
                    <span className="text-ink/80">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={async () => {
                  if (plan.price === 'Custom') {
                    window.location.href = 'mailto:sales@studio-provenance.com';
                    return;
                  }
                  try {
                    const res = await fetch('/api/stripe/checkout', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ planName: plan.name, priceStr: plan.price })
                    });
                    const data = await res.json();
                    if (data.url) {
                      window.location.href = data.url;
                    }
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className={`w-full py-4 text-lg font-bold uppercase tracking-widest transition-all ${plan.buttonClass}`}
              >
                {plan.buttonText}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
