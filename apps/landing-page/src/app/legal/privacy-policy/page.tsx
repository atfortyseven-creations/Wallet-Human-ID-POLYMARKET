import React from 'react';

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-parchment pt-32 pb-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-serif font-bold text-ink mb-8">Privacy Policy</h1>
        <div className="prose prose-lg text-ink/80">
          <p className="mb-4">Last updated: July 2026</p>
          
          <h2 className="text-2xl font-bold text-ink mt-8 mb-4">1. Introduction</h2>
          <p className="mb-4">
            Studio Provenance (by Whale Network) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our Digital Product Passport (DPP) services.
          </p>

          <h2 className="text-2xl font-bold text-ink mt-8 mb-4">2. Zero-Knowledge Proofs & Supply Chain Data</h2>
          <p className="mb-4">
            Our core architecture is designed around "Privacy-by-Design". When you issue a Digital Product Passport using our platform, sensitive supply chain data is verified using Zero-Knowledge (ZK) proofs on the Aztec Network. This means we do not store or process your proprietary supply chain data in plain text.
          </p>

          <h2 className="text-2xl font-bold text-ink mt-8 mb-4">3. Data We Collect</h2>
          <p className="mb-4">
            For B2B account management and billing, we collect:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Contact Information (Name, Email, Company Name)</li>
            <li>Billing Information (processed securely via Stripe)</li>
            <li>Usage Data and Analytics (anonymized)</li>
          </ul>

          <h2 className="text-2xl font-bold text-ink mt-8 mb-4">4. GDPR Compliance</h2>
          <p className="mb-4">
            If you are a resident of the European Economic Area (EEA), you have certain data protection rights under the General Data Protection Regulation (GDPR). We aim to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data.
          </p>

          <h2 className="text-2xl font-bold text-ink mt-8 mb-4">5. Contact Us</h2>
          <p className="mb-4">
            If you have questions or comments about this Privacy Policy, please contact our Data Protection Officer at: privacy@studio-provenance.com
          </p>
        </div>
      </div>
    </main>
  );
}
