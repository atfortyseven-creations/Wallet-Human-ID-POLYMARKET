import React from 'react';

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-parchment pt-32 pb-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-serif font-bold text-ink mb-8">Terms of Service</h1>
        <div className="prose prose-lg text-ink/80">
          <p className="mb-4">Last updated: July 2026</p>
          
          <h2 className="text-2xl font-bold text-ink mt-8 mb-4">1. Agreement to Terms</h2>
          <p className="mb-4">
            By accessing or using Studio Provenance, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you do not have permission to access the Service.
          </p>

          <h2 className="text-2xl font-bold text-ink mt-8 mb-4">2. B2B Services & Digital Product Passports</h2>
          <p className="mb-4">
            Studio Provenance provides B2B SaaS infrastructure for generating Digital Product Passports (DPP) using Zero-Knowledge proofs. We guarantee the cryptographic integrity of the proofs, but the accuracy of the underlying supply chain data remains the sole responsibility of the customer.
          </p>

          <h2 className="text-2xl font-bold text-ink mt-8 mb-4">3. Subscriptions & Payments</h2>
          <p className="mb-4">
            Services are billed on a subscription basis according to the plan selected. Payments are processed securely via Stripe. Failure to pay may result in suspension of API access and DPP generation capabilities.
          </p>

          <h2 className="text-2xl font-bold text-ink mt-8 mb-4">4. Limitation of Liability</h2>
          <p className="mb-4">
            In no event shall Ledger Network, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of the Service or any regulatory non-compliance on your part.
          </p>

          <h2 className="text-2xl font-bold text-ink mt-8 mb-4">5. Governing Law</h2>
          <p className="mb-4">
            These Terms shall be governed and construed in accordance with the laws of Spain, without regard to its conflict of law provisions.
          </p>
        </div>
      </div>
    </main>
  );
}
