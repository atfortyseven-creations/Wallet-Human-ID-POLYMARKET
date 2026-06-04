'use client';

import LegalDocLayout, { TocItem } from '@/components/layout/LegalDocLayout';

const TOC: TocItem[] = [
  { id: 'general', label: '1. General Information' },
  { id: 'disclaimer', label: '2. Disclaimer' },
  { id: 'privacy', label: '3. Privacy' },
  { id: 'ip', label: '4. Intellectual Property' },
  { id: 'third-party', label: '5. Third-Party Materials' },
  { id: 'restrictions', label: '6. Use Restrictions' },
  { id: 'indemnity', label: '7. Indemnity' },
  { id: 'liability', label: '8. Limitation of Liability' },
  { id: 'termination', label: '9. Termination' },
  { id: 'force-majeure', label: '10. Force Majeure' },
  { id: 'disputes', label: '11. Disputes & Governing Law' },
  { id: 'no-advice', label: '12. No Investment Advice' },
  { id: 'changes', label: '13. Changes to These Terms' },
  { id: 'contact', label: '14. Contact Information' },
];

export default function TermsOfServicePage() {
  return (
    <LegalDocLayout
      title="Terms of Service"
      subtitle="These Terms of Service set forth the legal terms and conditions governing your use of the Whale Alert Network platform and all associated services."
      lastUpdated="May 25, 2026"
      category="Legal"
      toc={TOC}
      backHref="/"
      backLabel="Back to Home"
    >
      <div className="space-y-10 sm:space-y-14 text-black">

        {/* 1 */}
        <section id="general">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            1. General Information
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              Whale Alert Network ("our," "us," "we," or the "Company") is a decentralised analytics platform dedicated to providing institutional-grade on-chain intelligence, portfolio management, and real-time blockchain monitoring. We build open-source, privacy-first software applications with a focus on zero-knowledge cryptography and decentralised identity.
            </p>
            <p>
              Whale Alert Network is currently developing various products that utilise advanced cryptography and decentralised infrastructure to provide consumers, developers, and institutions with novel functionality on public blockchains.
            </p>
            <p>
              Whale Alert Network currently provides analytics access and informational services through the website located at{' '}
              <a href="https://whalecosystem.io" className="text-black underline underline-offset-2 hover:text-black/60 transition-colors">
                https://whalecosystem.io
              </a>{' '}
              ("Website"), including information on on-chain monitoring, portfolio analytics, and community tools (collectively, the "Services").
            </p>
            <p>
              These Website Terms and Conditions ("Terms") set forth the legal terms and conditions governing your use of the Website. These Terms, along with our{' '}
              <a href="/legal/privacy" className="text-black underline underline-offset-2 hover:text-black/60 transition-colors">
                Privacy Policy
              </a>{' '}
              and any other policies referenced herein, comprise the entire understanding between you and Whale Alert Network regarding the Services and supersede all prior agreements.
            </p>
            <p>
              By accessing the Website and/or using our Services, you confirm that you accept these Terms and agree to be bound by them. If you do not agree to these Terms in their entirety, you may not use this Website or any Services.
            </p>
            <p>
              You must be 18 years of age or older to access the Website and use the Services. By using the Services, you confirm and warrant that you meet this requirement.
            </p>
          </div>
        </section>

        {/* 2 */}
        <section id="disclaimer">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            2. Disclaimer
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              You expressly acknowledge that your use of the Website and Services is provided on an "as is" and "as available" basis without any warranty. To the extent allowed by applicable law, all express or implied conditions, representations and warranties, including without limitation any implied warranties of merchantability, fitness for a particular purpose, or non-infringement, are disclaimed.
            </p>
            <p>
              Whale Alert Network does not speak on behalf of, and lacks the authority to legally bind, any third-party blockchain network, protocol, or community. Whale Alert Network is a distinct, independent entity. While we contribute to the open-source ecosystem, we cannot contractually bind any external community or protocol in any manner.
            </p>
            <p>
              In instances where we discuss future developments or potential features, we are expressing our vision and aspirations. This should not be interpreted as a binding commitment or guarantee that these concepts will be implemented or will prove effective.
            </p>
            <p>
              You must obtain professional or specialist advice before taking, or refraining from, any action based on the content on our Website or Services.
            </p>
          </div>
        </section>

        {/* 3 */}
        <section id="privacy">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            3. Privacy
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              Whale Alert Network is committed to protecting your privacy. In order to provide you with Services under these Terms and in accordance with our Privacy Policy, we may process certain personal data. For additional information about the type of personal data we process and how we collect, use and share it, please review our{' '}
              <a href="/legal/privacy" className="text-black underline underline-offset-2 hover:text-black/60 transition-colors">
                Privacy Policy
              </a>{' '}
              carefully.
            </p>
          </div>
        </section>

        {/* 4 */}
        <section id="ip">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            4. Intellectual Property Rights
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              The Website and its entire contents, features, and functionality (including but not limited to all text, software, displays, graphics, and design) are owned by Whale Alert Network and its licensors and are protected by copyright, trademark, patent, trade secret, and other intellectual property laws. All copyright and intellectual property rights in our Website content are reserved.
            </p>
            <p>
              Neither these Terms nor your access to the Website transfers to you any rights, title, or interest to such intellectual property. You agree not to take any action inconsistent with such ownership interests. We and our licensors reserve all rights, including the exclusive right to create derivative works.
            </p>
          </div>
        </section>

        {/* 5 */}
        <section id="third-party">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            5. Third-Party Materials
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              Our Website may contain links to third-party resources including Web3 wallets, bridges, decentralised applications, websites, and other materials, products, or services which we do not own or control (collectively, "third-party products"). A link to a third-party product is not an endorsement or affiliation. When we reference any third-party products, it is solely for informational purposes.
            </p>
            <p>
              Third-party products are owned and controlled by third parties. We strongly advise you to read the terms and conditions and privacy policies of any third-party products you visit and/or use. When you use or rely on any third-party products, you do so at your own risk. We assume no obligations or liability and make no representations or warranties regarding such products.
            </p>
          </div>
        </section>

        {/* 6 */}
        <section id="restrictions">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            6. Restrictions on the Use of Services
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              You may only use the Website and Services for lawful purposes and in compliance with these Terms. You agree not to use the Website and Services to:
            </p>
            <ul className="space-y-3 pl-5">
              {[
                'Violate any applicable law or regulation, including applicable sanctions laws, export control laws, securities laws, anti-money laundering laws, or privacy laws.',
                'Use any device, software, or routine that interferes with or compromises the integrity, security, or proper functioning of the Website and/or Services.',
                'Damage or disrupt any parts of the Website, the servers on which the Website is stored, or any server, computer, or database connected to the Website.',
                'Further or promote any criminal activity or enterprise, or provide instructional information about illegal activities.',
                'Encourage or enable any other individual to do any of the foregoing.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/40 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 7 */}
        <section id="indemnity">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            7. Indemnity
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              You acknowledge and agree to, at your own expense, defend, indemnify and hold harmless Whale Alert Network and its affiliates and their respective equity holders, directors, officers, employees, managers, partners, service providers, licensors, and successors ("Indemnified Parties") from any claim, actions, liabilities, losses, damages, suits and expenses, including attorneys' and expert fees, that we incur in connection with or arising out of:
            </p>
            <ul className="space-y-3 pl-5">
              {[
                'Any breach or violation of these Terms by you.',
                'Material entered into or transmitted through the Services by you or a third party acting at your request.',
                'Your use of any third-party products.',
                'A claim that any use of the Services by you infringes any intellectual property right of any third party, or any right of privacy or publicity.',
                'Any deletions, additions, insertions, or alterations to, or any unauthorised use of, the Services by you.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-black/40 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p>
              You agree to promptly notify us of any third-party claims and cooperate with the Indemnified Parties in defending such claims.
            </p>
          </div>
        </section>

        {/* 8 */}
        <section id="liability">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            8. Limitations of Liability
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              TO THE FULLEST EXTENT ALLOWED BY APPLICABLE LAW, UNDER NO CIRCUMSTANCES AND UNDER NO LEGAL THEORY (INCLUDING, WITHOUT LIMITATION, TORT, CONTRACT, STRICT LIABILITY, OR OTHERWISE) SHALL THE INDEMNIFIED PARTIES BE LIABLE TO YOU OR ANY OTHER PERSON FOR: (A) ANY INDIRECT, SPECIAL, INCIDENTAL, PUNITIVE OR CONSEQUENTIAL DAMAGES OF ANY KIND, INCLUDING DAMAGES FOR LOST PROFITS, BUSINESS INTERRUPTION, LOSS OF DATA, GOODWILL OR REPUTATION; (B) ANY SUBSTITUTE GOODS, SERVICES OR TECHNOLOGY; OR (C) ANY MATTER BEYOND THE REASONABLE CONTROL OF THE INDEMNIFIED PARTIES.
            </p>
            <p>
              Some jurisdictions do not allow the exclusion or limitation of incidental or consequential damages, so the above limitations may not apply to you.
            </p>
            <p>
              Nothing in these Terms is intended to exclude or limit our liability for death or personal injury caused by our negligence, or for fraud or fraudulent misrepresentation, or to affect your statutory rights.
            </p>
          </div>
        </section>

        {/* 9 */}
        <section id="termination">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            9. Termination
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              We may terminate or suspend your access to our Services at any time for any reason, subject to notifying you (for example, by email) at least 15 days in advance, except where immediate termination is required to protect the integrity of the platform or comply with legal obligations.
            </p>
          </div>
        </section>

        {/* 10 */}
        <section id="force-majeure">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            10. Force Majeure
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              You acknowledge and agree that we will not be liable for failures or delays in providing Services or other non-performance caused by events including but not limited to strikes, insurrection, riot, civil unrest, war, fires, utility failures, equipment failures, changes in law, cyberattacks, denial-of-service attacks, non-performance of vendors or suppliers, acts of god, pandemic or epidemic events, or other causes over which we have no reasonable control. We will make reasonable efforts to limit the effect of any such events and resume Services as soon as practicable.
            </p>
          </div>
        </section>

        {/* 11 */}
        <section id="disputes">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            11. Complaints, Disputes, and Governing Law
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              Any dispute, claim or request for relief arising out of or in connection with these Terms and/or the Services shall first be submitted to our support team at{' '}
              <a href="mailto:legal@whalecosystem.io" className="text-black underline underline-offset-2 hover:text-black/60 transition-colors">
                legal@whalecosystem.io
              </a>{' '}
              for informal resolution. If the dispute cannot be resolved informally within 30 days, it shall be referred to and finally resolved by arbitration under the applicable international arbitration rules.
            </p>
            <p>
              These Terms and any issue, claim or dispute between you and us will be governed by applicable law. Any additional, mandatory consumer rights and protections that you are entitled to under the laws of the country in which you reside will also apply.
            </p>
          </div>
        </section>

        {/* 12 */}
        <section id="no-advice">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            12. No Investment Advice or Brokerage
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              For the avoidance of doubt, we do not provide investment, tax, or legal advice. You are solely responsible for determining whether any investment, investment strategy, or related transaction is appropriate for you based on your personal objectives, financial circumstances, and risk tolerance. The information provided on the Website does not constitute investment, financial, or trading advice.
            </p>
            <p>
              We do not recommend that any digital asset should be bought, sold, held, or utilised in any particular way. We will not be held responsible for decisions you make to buy, sell, or hold crypto assets based on information provided through our Services.
            </p>
          </div>
        </section>

        {/* 13 */}
        <section id="changes">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            13. Changes to These Terms
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              We reserve the right, in our sole discretion, to modify, suspend or discontinue these Terms and/or Services from time to time to reflect changes to our Services, our users' needs, our business priorities, or changes in applicable laws, without liability to you. We will give you reasonable notice when we make material changes to these Terms. Your continued use of the Website following the posting of revised Terms means that you accept and agree to the changes.
            </p>
          </div>
        </section>

        {/* 14 */}
        <section id="contact">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            14. Contact Information
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              If you have any questions about the Website or these Terms, please contact us:
            </p>
            <div className="border border-black/10 rounded-xl p-5 sm:p-6 space-y-4 mt-4">
              <div>
                <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-black/40 mb-1">Email</p>
                <a href="mailto:humanityledger@gmail.com" className="text-black text-[15px] hover:text-black/60 transition-colors underline underline-offset-2 break-all">humanityledger@gmail.com</a>
              </div>
              <div>
                <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-black/40 mb-1">Telegram</p>
                <a href="https://t.me/humanityledger" target="_blank" rel="noopener noreferrer" className="text-black text-[15px] hover:text-black/60 transition-colors underline underline-offset-2">@humanityledger</a>
              </div>
              <div>
                <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-black/40 mb-1">LinkedIn — Founder</p>
                <a href="https://www.linkedin.com/in/stefan-antonio-cirisanu-40116140b/" target="_blank" rel="noopener noreferrer" className="text-black text-[14px] hover:text-black/60 transition-colors underline underline-offset-2 break-all">Stefan Antonio Cirisanu</a>
              </div>
            </div>
          </div>
        </section>

      </div>
    </LegalDocLayout>
  );
}
