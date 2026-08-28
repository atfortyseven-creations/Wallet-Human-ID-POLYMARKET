import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const POSTS: Record<string, { title: string; date: string; content: string }> = {
  'end-of-surveillance-capitalism': {
    title: 'Prioritizing Data Privacy: Why We Built Humanity Ledger',
    date: 'January 15, 2027',
    content: `
For many years, our digital information has been collected and analyzed by third parties. Social networks map our relationships, messaging apps process our communications, and analytics companies build profiles based on our online behavior.

Today, we are offering an alternative.

Humanity Ledger is designed as a secure cryptographic protocol. We do not operate centralized servers that process your messages, nor do we maintain databases that store your profile information. 

When you use Ledger Chat, your messages are encrypted on your device using established encryption standards. The keys to decrypt them exist only on the devices of the people involved in the conversation. Our team cannot access your communications.

This approach ensures strong data privacy, enforced by mathematics.
`
  },
  'cryptographic-sovereignty': {
    title: 'Digital Identity: How Your Wallet Secures Your Messages',
    date: 'February 2, 2027',
    content: `
In a decentralized system, establishing identity securely without a central authority is a complex challenge. How do you verify your identity without relying on a centralized service provider?

The answer lies in cryptographic signatures.

When you connect to Humanity Ledger, you sign a secure message using your digital wallet. This signature generates a temporary session key. This key is used to establish your identity on our network.

### Forward Secrecy
Every message you send generates a new encryption key. Even if an attacker somehow compromised one of your keys, they could only read a single message. Past and future messages remain completely secure. This property is known as Perfect Forward Secrecy.

You do not need a traditional account to use Ledger Chat. Your cryptographic keypair securely serves as your digital identity.
`
  },
  'decentralized-routing-2027': {
    title: 'Engineering for Privacy: Secure Routing in 2027',
    date: 'March 10, 2027',
    content: `
End-to-End Encryption protects the content of your messages, but it is equally important to protect the metadata. Information about who you are communicating with, when, and from where can also be sensitive.

### The Metadata Challenge
When you make a standard internet call, your IP address may be exposed to the server facilitating the call or to the person you are calling in a direct peer-to-peer connection. 

### Our Solution
Humanity Ledger implements a secure routing protocol for network signaling. When you initiate a call, the request is routed through multiple independent relay nodes before reaching the recipient. 

This process helps protect your metadata, shielding your physical location from both the recipient and our infrastructure.
`
  }
};

export function generateStaticParams() {
  return Object.keys(POSTS).map((slug) => ({ slug }));
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = POSTS[slug];

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-black/10 py-6 px-6 flex items-center justify-between">
        <Link href="/blog" className="text-[11px] font-black uppercase tracking-widest text-black hover:bg-black hover:text-white px-3 py-2 border border-transparent hover:border-black transition-colors">
          ← Back to Blog
        </Link>
        <span className="text-[13px] font-bold tracking-tight">Humanity Ledger</span>
      </header>
      
      <main className="max-w-3xl mx-auto px-6 py-20">
        <div className="mb-16">
          <div className="text-[11px] font-mono text-black/50 uppercase tracking-widest font-bold mb-4">{post.date}</div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1] text-black">
            {post.title}
          </h1>
        </div>
        
        <div className="prose prose-zinc prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-indigo-600">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>
      </main>
    </div>
  );
}
