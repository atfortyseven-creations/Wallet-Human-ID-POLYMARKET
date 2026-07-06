import React from 'react';

export default function DPA() {
  return (
    <main className="min-h-screen bg-parchment pt-32 pb-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-serif font-bold text-ink mb-8">Data Processing Agreement (DPA)</h1>
        <div className="prose prose-lg text-ink/80">
          <p className="mb-4">Last updated: July 2026</p>
          
          <h2 className="text-2xl font-bold text-ink mt-8 mb-4">1. Scope and Applicability</h2>
          <p className="mb-4">
            This Data Processing Agreement ("DPA") applies to the processing of personal data by Studio Provenance ("Data Processor") on behalf of our B2B customers ("Data Controller") under the GDPR.
          </p>

          <h2 className="text-2xl font-bold text-ink mt-8 mb-4">2. Zero-Knowledge Processing Architecture</h2>
          <p className="mb-4">
            Studio Provenance's architecture fundamentally minimizes data processing. Supply chain and compliance data is processed locally on the Controller's infrastructure to generate cryptographic proofs (zk-SNARKs). The Processor only receives and anchors these proofs to the Aztec Network/Ethereum L1. As such, the Processor does not have access to the underlying plaintext supply chain data.
          </p>

          <h2 className="text-2xl font-bold text-ink mt-8 mb-4">3. Sub-processors</h2>
          <p className="mb-4">
            The Controller authorizes the Processor to engage sub-processors (e.g., Stripe for billing, infrastructure providers for hosting the API). The Processor remains fully liable for the acts of its sub-processors.
          </p>

          <h2 className="text-2xl font-bold text-ink mt-8 mb-4">4. Security Measures</h2>
          <p className="mb-4">
            The Processor shall implement and maintain appropriate technical and organizational security measures to protect Personal Data against unauthorized access, alteration, or destruction, in accordance with Article 32 of the GDPR.
          </p>

          <h2 className="text-2xl font-bold text-ink mt-8 mb-4">5. Audit and Compliance</h2>
          <p className="mb-4">
            The Processor shall make available to the Controller all information necessary to demonstrate compliance with the obligations laid down in this DPA and allow for and contribute to audits conducted by the Controller or an auditor mandated by the Controller.
          </p>
        </div>
      </div>
    </main>
  );
}
