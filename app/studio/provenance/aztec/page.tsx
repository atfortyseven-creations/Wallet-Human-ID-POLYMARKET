import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  ArrowRight,
  Package,
  Fingerprint,
  Eye,
  EyeOff,
  Globe,
  ArrowUpRight,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Aztec Network Integration · Studio Provenance',
  description:
    'Studio Provenance uses Aztec Network to give organisations a way to record product authenticity publicly while keeping commercially sensitive data private.',
  openGraph: {
    title: 'Aztec Network Integration · Studio Provenance',
    description:
      'Public verification. Private data. Built on Aztec Network — the privacy layer for Ethereum.',
  },
};

/* ─────────────────────────────────────────────
   STATIC SECTION COMPONENTS
───────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/35 mb-3">
      {children}
    </p>
  );
}

function Divider() {
  return <hr className="border-black/8 my-10" />;
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function AztecIntegrationPage() {
  return (
    <div className="min-h-[100dvh] bg-[#FFFFFF] text-[#050505]">
      {/* ── Hero ── */}
      <div className="border-b border-black/8">
        <div className="max-w-3xl mx-auto px-5 py-14 sm:py-20">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-black/10 bg-black/[0.02]">
            <div className="w-2 h-2 rounded-full bg-[#050505]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-black/50">
              Built on Aztec Network
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[#050505] leading-[1.05] mb-5">
            Prove what is real.{' '}
            <span className="text-black/25">Protect what is private.</span>
          </h1>

          <p className="text-base text-black/60 leading-relaxed max-w-xl mb-8">
            Studio Provenance lets organisations register product records that anyone can verify — 
            without revealing supplier contracts, batch volumes, or internal logistics. The
            underlying technology is Aztec Network, a privacy layer built on Ethereum.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/studio/provenance"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#050505] text-white text-[11px] font-black uppercase tracking-widest hover:opacity-80 transition-opacity"
            >
              Open Studio
              <ArrowRight size={13} />
            </Link>
            <Link
              href="/studio/provenance/registry"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-black/15 text-[11px] font-black uppercase tracking-widest hover:border-black/30 transition-colors"
            >
              Browse All Records
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-3xl mx-auto px-5 py-12">

        {/* The core problem */}
        <section>
          <SectionLabel>The problem</SectionLabel>
          <h2 className="text-2xl font-black tracking-tight text-[#050505] mb-4">
            Standard blockchains publish everything
          </h2>
          <p className="text-sm text-black/60 leading-relaxed mb-4">
            Most blockchain systems used for supply chain tracking store every piece of data in
            public. That means competitors can see exactly who supplies your products, how large
            your batches are, and when shipments move. For public agencies and regulated companies,
            this creates a compliance paradox: you need to record information for auditors, but
            doing so publicly exposes information protected by commercial confidentiality laws.
          </p>
          <p className="text-sm text-black/60 leading-relaxed">
            Studio Provenance solves this by splitting every record into two layers — one public,
            one private — and using Aztec Network to keep the boundary between them mathematically
            enforced.
          </p>
        </section>

        <Divider />

        {/* Two layers explained */}
        <section>
          <SectionLabel>How the two layers work</SectionLabel>
          <h2 className="text-2xl font-black tracking-tight text-[#050505] mb-6">
            What the public sees. What stays private.
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Public layer */}
            <div className="rounded-2xl border border-black/10 bg-white p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#050505] flex items-center justify-center shrink-0">
                  <Eye size={15} className="text-white" />
                </div>
                <p className="text-sm font-bold text-[#050505]">Public layer</p>
              </div>
              <p className="text-xs text-black/55 leading-relaxed mb-4">
                Stored openly on the blockchain. Readable by anyone, including regulators, customs
                officers, and consumers.
              </p>
              <ul className="space-y-2">
                {[
                  'Product name',
                  'Authenticity status (genuine / revoked)',
                  'Registration date',
                  'Issuing organisation address',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-black/60">
                    <CheckCircle2 size={12} className="mt-0.5 text-[#050505] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Private layer */}
            <div className="rounded-2xl border border-black/10 bg-white p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-black/8 flex items-center justify-center shrink-0">
                  <EyeOff size={15} className="text-[#050505]" />
                </div>
                <p className="text-sm font-bold text-[#050505]">Private layer</p>
              </div>
              <p className="text-xs text-black/55 leading-relaxed mb-4">
                Stored in encrypted form. Only readable by the organisation that created the
                record, using their cryptographic key.
              </p>
              <ul className="space-y-2">
                {[
                  'Exact supplier identity',
                  'Batch volume and production data',
                  'Commercial pricing terms',
                  'Internal logistics routes',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-black/60">
                    <Lock size={12} className="mt-0.5 text-black/40 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <Divider />

        {/* How a proof works — no jargon */}
        <section>
          <SectionLabel>How verification works</SectionLabel>
          <h2 className="text-2xl font-black tracking-tight text-[#050505] mb-4">
            Scan. Verify. No data exposed.
          </h2>
          <p className="text-sm text-black/60 leading-relaxed mb-6">
            When a consumer or inspector scans the QR code on a product, they trigger a verification
            check against the public layer of the record. The result is a simple confirmation:{' '}
            <strong className="text-[#050505]">this record exists and has not been modified
            or revoked.</strong> No private data leaves the system. No supplier is named. No volume
            is disclosed.
          </p>

          {/* Flow diagram — pure CSS */}
          <div className="rounded-2xl border border-black/10 bg-white p-6">
            <div className="flex flex-col gap-0">
              {[
                {
                  icon: <Package size={14} />,
                  title: 'Product is manufactured',
                  desc: 'The organisation registers the batch in Studio Provenance.',
                },
                {
                  icon: <Lock size={14} />,
                  title: 'Private data is encrypted',
                  desc: 'Supplier, volume, and internal notes are stored in the private layer.',
                },
                {
                  icon: <Fingerprint size={14} />,
                  title: 'A fingerprint is published',
                  desc: 'A mathematical summary of the record is written to the blockchain. No private data is included.',
                },
                {
                  icon: <Globe size={14} />,
                  title: 'QR code is printed on the label',
                  desc: 'The code links to the public layer of the record.',
                },
                {
                  icon: <ShieldCheck size={14} />,
                  title: 'Anyone can verify authenticity',
                  desc: 'Scanning the code returns: registered, date of registration, and whether the record has been revoked.',
                },
              ].map(({ icon, title, desc }, i, arr) => (
                <div key={title} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full border border-black/15 bg-black/[0.02] flex items-center justify-center shrink-0 text-[#050505]">
                      {icon}
                    </div>
                    {i < arr.length - 1 && (
                      <div className="w-px h-6 bg-black/10 my-1" />
                    )}
                  </div>
                  <div className="pb-5 min-w-0">
                    <p className="text-sm font-bold text-[#050505] mb-0.5">{title}</p>
                    <p className="text-xs text-black/55 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* Use cases — institutional language */}
        <section>
          <SectionLabel>Applications</SectionLabel>
          <h2 className="text-2xl font-black tracking-tight text-[#050505] mb-6">
            Where this is useful
          </h2>

          <div className="space-y-4">
            {[
              {
                sector: 'Health and pharmaceuticals',
                icon: '🏥',
                problem:
                  'Medication counterfeiting is a global health emergency. Current tracking systems either store too little information to be useful or expose the distribution network publicly.',
                solution:
                  'Each batch of medication gets a QR code linked to an on-chain record. Health inspectors scan the code to confirm authenticity. The distribution route and pricing remain private.',
              },
              {
                sector: 'Food and agriculture',
                icon: '🌾',
                problem:
                  'Organic and fair-trade certifications are difficult to verify and easy to falsify. Consumers and importers cannot independently confirm claims.',
                solution:
                  'Certifying bodies issue on-chain records for approved producers. Each shipment carries a QR code referencing the certification. The farmer\'s identity is disclosed only if they choose to share it.',
              },
              {
                sector: 'Public infrastructure',
                icon: '🏗️',
                problem:
                  'Construction materials used in public buildings must meet certified standards. Current paper-based systems are slow and prone to fraud.',
                solution:
                  'Manufacturers register each batch of material. Construction site supervisors scan QR codes to confirm compliance. Audit trails are permanent and tamper-proof.',
              },
              {
                sector: 'Customs and trade',
                icon: '🛃',
                problem:
                  'Customs authorities spend significant time verifying the origin and authenticity of imported goods. Manual checks are slow and inconsistent.',
                solution:
                  'Importers provide a QR code at the border. Officers verify product origin and batch legitimacy in under thirty seconds using the public blockchain record.',
              },
              {
                sector: 'Environmental regulation',
                icon: '♻️',
                problem:
                  'Companies must prove compliance with recycling, emissions, and sourcing regulations, but sharing full production data with regulators raises commercial confidentiality concerns.',
                solution:
                  'Companies generate verified compliance records. Regulators confirm specific conditions are met without receiving access to commercial production volumes or supplier contracts.',
              },
            ].map(({ sector, icon, problem, solution }) => (
              <div
                key={sector}
                className="rounded-2xl border border-black/10 bg-white p-5 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{icon}</span>
                  <p className="text-sm font-bold text-[#050505]">{sector}</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="rounded-xl bg-black/[0.02] p-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-black/35 mb-1.5">
                      Current problem
                    </p>
                    <p className="text-xs text-black/55 leading-relaxed">{problem}</p>
                  </div>
                  <div className="rounded-xl bg-black/[0.02] p-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-black/35 mb-1.5">
                      With Studio Provenance
                    </p>
                    <p className="text-xs text-black/55 leading-relaxed">{solution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* For Aztec developers */}
        <section>
          <SectionLabel>For developers on Aztec Network</SectionLabel>
          <h2 className="text-2xl font-black tracking-tight text-[#050505] mb-4">
            Studio Provenance as infrastructure
          </h2>
          <p className="text-sm text-black/60 leading-relaxed mb-6">
            Studio Provenance is designed to serve as a layer of provenance infrastructure that
            other Aztec applications can build on. Any application that needs to verify the origin or
            authenticity of a physical or digital asset can query the Provenance Registry contract
            without needing to manage product records itself.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {[
              {
                title: 'Query the registry contract',
                desc: 'Call verify_product(slug_hash) from any Aztec contract to check if a product record exists and is not revoked. Returns a boolean. No private data is accessed.',
                code: 'verify_product(slug_hash: Field) → bool',
              },
              {
                title: 'Prove batch ownership',
                desc: 'A distributor or supplier can prove they hold a private batch note for a specific product without revealing the batch contents. Useful for conditional DeFi or trade finance.',
                code: 'prove_batch_ownership(slug_hash, batch_id_hash) → bool',
              },
              {
                title: 'Transfer provenance privately',
                desc: 'When a product moves through the supply chain, the private note transfers to the new custodian. The transfer is invisible on the public ledger.',
                code: 'transfer_batch(batch_id_hash, new_owner) → void',
              },
              {
                title: 'Update certifications',
                desc: 'If a product gains a new certification after registration, the metadata hash in the private note is updated. The public record remains unchanged.',
                code: 'update_batch_metadata(batch_id_hash, new_metadata_hash)',
              },
            ].map(({ title, desc, code }) => (
              <div key={title} className="rounded-xl border border-black/10 bg-white p-4 space-y-2">
                <p className="text-xs font-bold text-[#050505]">{title}</p>
                <p className="text-[11px] text-black/50 leading-relaxed">{desc}</p>
                <code className="block text-[10px] font-mono bg-black/[0.04] rounded-lg px-3 py-2 text-black/60 break-all">
                  {code}
                </code>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mb-2">
              Contract location
            </p>
            <code className="text-xs font-mono text-black/60 break-all">
              noir-projects/contracts/registry-contract/src/main.nr
            </code>
            <p className="text-[11px] text-black/45 mt-3 leading-relaxed">
              The contract is written in Noir, the programming language used by Aztec Network.
              It is compiled into a zero-knowledge circuit that enforces the public/private boundary
              at the protocol level — not through access control, but through cryptography.
            </p>
          </div>
        </section>

        <Divider />

        {/* CTA section */}
        <section className="rounded-2xl border border-black/10 bg-white p-8 text-center">
          <ShieldCheck size={28} className="text-[#050505] mx-auto mb-4" />
          <h2 className="text-xl font-black tracking-tight text-[#050505] mb-2">
            Ready to register your first product?
          </h2>
          <p className="text-sm text-black/55 leading-relaxed mb-6 max-w-sm mx-auto">
            Create a verifiable record, generate a QR label, and confirm it on the blockchain — in
            under two minutes.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/studio/provenance"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#050505] text-white text-[11px] font-black uppercase tracking-widest hover:opacity-80 transition-opacity"
            >
              Open Studio
              <ArrowRight size={13} />
            </Link>
            <a
              href="https://aztec.network"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-black/15 text-[11px] font-black uppercase tracking-widest hover:border-black/30 transition-colors"
            >
              Aztec Network
              <ArrowUpRight size={13} />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
