import Link from 'next/link';

const BLOG_POSTS = [
  {
    slug: 'end-of-surveillance-capitalism',
    title: 'The End of Surveillance Capitalism: Why We Built Humanity Ledger',
    date: 'January 15, 2027',
    excerpt: 'For decades, our digital lives have been harvested and sold. Today, we are taking back control through cryptography.',
    category: 'Privacy'
  },
  {
    slug: 'cryptographic-sovereignty',
    title: 'Cryptographic Sovereignty: How Your Wallet Secures Your Messages',
    date: 'February 2, 2027',
    excerpt: 'An in-depth look at how ECDSA signatures and the Double Ratchet algorithm provide perfect forward secrecy.',
    category: 'Engineering'
  },
  {
    slug: 'decentralized-routing-2027',
    title: 'Engineering for Privacy: Decentralized Routing in 2027',
    date: 'March 10, 2027',
    excerpt: 'How we replaced centralized servers with peer-to-peer TURN routing to prevent IP metadata collection.',
    category: 'Architecture'
  }
];

export default function BlogIndex() {
  return (
    <div className="min-h-screen bg-white">
      <header className="py-20 border-b border-black/10 text-center px-6">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-black mb-4 uppercase">Signal to Noise</h1>
        <p className="text-black/60 max-w-2xl mx-auto font-mono text-[13px] uppercase tracking-widest leading-relaxed">
          Thoughts on cryptography, privacy, and the future of sovereign digital identity.
        </p>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="flex flex-col gap-12">
          {BLOG_POSTS.map(post => (
            <article key={post.slug} className="group cursor-pointer">
              <Link href={`/blog/${post.slug}`}>
                <div className="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-12">
                  <div className="shrink-0 w-48 text-[11px] font-mono text-black/40 uppercase tracking-widest font-bold">
                    {post.date}
                    <div className="mt-1 text-black/80">{post.category}</div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold tracking-tight text-black group-hover:text-black/60 transition-colors mb-3">
                      {post.title}
                    </h2>
                    <p className="text-[15px] text-black/70 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="mt-4 text-[10px] font-mono uppercase tracking-[0.2em] font-black flex items-center gap-2 group-hover:gap-4 transition-all text-black">
                      Read Article <span>→</span>
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
