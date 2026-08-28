import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const POSTS: Record<string, { title: string; date: string; content: string }> = {
  'end-of-surveillance-capitalism': {
    title: 'The End of Surveillance Capitalism: Why We Built Humanity Ledger',
    date: 'January 15, 2027',
    content: `
For decades, our digital lives have been harvested and sold. Social networks map our relationships, messaging apps scan our intimate thoughts, and analytics companies build psychological profiles to sell our attention.

Today, we are taking back control.

Humanity Ledger is not a company in the traditional sense; it is a cryptographic protocol. We do not have servers that read your messages, nor do we have databases that store your profile. 

When you use Ledger Chat, your messages are encrypted on your device using the Double Ratchet algorithm. The keys to decrypt them exist only on the devices of the people involved in the conversation. Not even our engineers can see what you send.

This is the end of surveillance capitalism, enforced by mathematics.
`
  },
  'cryptographic-sovereignty': {
    title: 'Cryptographic Sovereignty: How Your Wallet Secures Your Messages',
    date: 'February 2, 2027',
    content: `
In a decentralized system, identity is the hardest problem to solve without a central authority. How do you prove you are who you say you are, without handing over a passport to a corporation?

The answer is Cryptographic Sovereignty.

When you connect to Humanity Ledger, you sign a deterministic message using your Ethereum wallet. This signature generates an ephemeral session key. This key is used to establish your identity on the XMTP network.

### The Double Ratchet
Every message you send generates a new encryption key. Even if an attacker somehow compromised one of your keys, they could only read a single message. Past and future messages remain completely secure. This property is known as Perfect Forward Secrecy.

You do not need a phone number to use Ledger Chat. Your cryptographic keypair is your absolute identity.
`
  },
  'decentralized-routing-2027': {
    title: 'Engineering for Privacy: Decentralized Routing in 2027',
    date: 'March 10, 2027',
    content: `
End-to-End Encryption protects the *content* of your messages, but what about the *metadata*? Who you are talking to, when, and from where can reveal just as much about your life.

### The Metadata Problem
When you make a standard VoIP call, your IP address is exposed to the server facilitating the call. If it's a direct P2P connection, your IP is exposed to the person you are calling. 

### Our Solution
Humanity Ledger implements a decentralized routing protocol for WebRTC signaling. When you initiate a call, the request bounces through multiple independent relay nodes before reaching the recipient. 

The first node knows who you are, but not what the payload is. The final node knows what the payload is, but not who sent it. This effectively blinds the network to your metadata, protecting your physical location from both the recipient and our infrastructure.
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
