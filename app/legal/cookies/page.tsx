import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | Humanity Ledger',
  description: 'Cookie Policy for Humanity Ledger — how we use cookies and similar technologies.',
};

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <div className="mb-12">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-black/40 mb-3">Legal</p>
          <h1 className="text-[40px] font-black tracking-tight leading-tight mb-4">Cookie Policy</h1>
          <p className="text-[14px] text-black/50">Last updated: August 2026</p>
        </div>
        <div className="space-y-10 text-[15px] text-black/70 leading-relaxed">
          <section>
            <h2 className="text-[20px] font-black text-black mb-3">1. What Are Cookies?</h2>
            <p>
              Cookies are small text files placed on your device by websites you visit.
              They are widely used to make websites work, improve user experience, and
              provide analytics information to site owners.
            </p>
          </section>
          <section>
            <h2 className="text-[20px] font-black text-black mb-3">2. Cookies We Use</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] border-collapse">
                <thead>
                  <tr className="border-b border-black/10">
                    <th className="text-left py-3 pr-4 font-black text-black">Cookie</th>
                    <th className="text-left py-3 pr-4 font-black text-black">Purpose</th>
                    <th className="text-left py-3 font-black text-black">Expiry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.06]">
                  <tr>
                    <td className="py-3 pr-4 font-mono text-[12px]">system_handshake</td>
                    <td className="py-3 pr-4">Authentication session identifier (non-custodial)</td>
                    <td className="py-3">Session</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono text-[12px]">human.session-token</td>
                    <td className="py-3 pr-4">NextAuth HttpOnly session token (email login)</td>
                    <td className="py-3">30 days</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-mono text-[12px]">__enclave_clearance_v2__</td>
                    <td className="py-3 pr-4">Enclave PIN clearance (sessionStorage, not a cookie)</td>
                    <td className="py-3">8 hours</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
          <section>
            <h2 className="text-[20px] font-black text-black mb-3">3. No Third-Party Tracking</h2>
            <p>
              Humanity Ledger does <strong>not</strong> use advertising cookies, third-party
              analytics services (Google Analytics, Facebook Pixel, etc.), or any tracking
              technologies that share your data with third parties. Our privacy-first
              architecture means we collect the minimum data necessary to operate the service.
            </p>
          </section>
          <section>
            <h2 className="text-[20px] font-black text-black mb-3">4. Managing Cookies</h2>
            <p>
              You can control and delete cookies through your browser settings. Note that
              disabling the session cookies listed above will prevent you from logging in.
              Clearing sessionStorage will require re-authentication for the Enclave.
            </p>
          </section>
          <section>
            <h2 className="text-[20px] font-black text-black mb-3">5. Contact</h2>
            <p>
              Questions about our cookie use:{' '}
              <a href="mailto:privacy@humanidfi.com" className="underline underline-offset-2 hover:text-black transition-colors">
                privacy@humanidfi.com
              </a>
            </p>
          </section>
        </div>
        <div className="mt-16 pt-8 border-t border-black/10 text-[12px] text-black/40">
          <p>© 2026 Humanity Ledger S.L. (In process of incorporation) · All rights reserved</p>
        </div>
      </div>
    </main>
  );
}
