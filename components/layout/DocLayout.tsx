import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';

interface DocLayoutProps {
    children: React.ReactNode;
    title: string;
    description?: string;
    lastUpdated?: string;
    category: 'Product' | 'Developers' | 'Company' | 'Legal' | 'Technical';
}

export default function DocLayout({ children, title, description, lastUpdated, category }: DocLayoutProps) {
    const categoryColors = {
        'Product': 'bg-white',
        'Developers': 'bg-white',
        'Company': 'bg-white',
        'Legal': 'bg-white',
        'Technical': 'bg-white'
    };

    return (
        <div className="min-h-screen bg-transparent text-[var(--aztec-ink)]">
            {/* Header */}
            <div className={`border-b border-black/5 ${categoryColors[category]} py-20`}>
                <div className="max-w-4xl mx-auto px-6">
                    <Link href="/" className="inline-flex items-center gap-2 text-[var(--aztec-ink)]/60 hover:text-[var(--aztec-ink)] mb-6 transition-colors font-aztec-mono text-[10px] uppercase tracking-widest">
                        <ArrowLeft size={16} />
                        <span>Back to Home</span>
                    </Link>
                    <div className="inline-block px-3 py-1 bg-[var(--aztec-ink)]/5 rounded-full text-[10px] font-aztec-mono font-black uppercase tracking-widest mb-4">
                        {category}
                    </div>
                    <h1 className="text-5xl md:text-7xl font-aztec-serif font-black mb-4 uppercase tracking-tighter">{title}</h1>
                    {description && (
                        <p className="text-xl font-aztec-serif italic text-[var(--aztec-ink)]/60 max-w-2xl">{description}</p>
                    )}
                    {lastUpdated && (
                        <div className="flex items-center gap-2 text-[var(--aztec-ink)]/40 mt-6 font-aztec-mono text-[10px] uppercase tracking-widest">
                            <Calendar size={14} />
                            <span>Last updated: {lastUpdated}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 pt-16 pb-8">
                <div className="prose prose-slate prose-lg max-w-none text-[var(--aztec-ink)]">
                    {children}
                </div>
            </div>

            {/* Footer Info */}
            <div className="border-t border-[var(--aztec-ink)]/5 mt-0 py-8">
                <div className="max-w-4xl mx-auto px-6 text-center text-[10px] font-aztec-mono uppercase tracking-[0.3em] text-[var(--aztec-ink)]/40">
                    <p>For institutional inquiries, contact <a href="mailto:legal@WhaleAlert.pro" className="text-[var(--aztec-ink)] hover:underline">legal@WhaleAlert.pro</a></p>
                </div>
            </div>
        </div>
    );
}

