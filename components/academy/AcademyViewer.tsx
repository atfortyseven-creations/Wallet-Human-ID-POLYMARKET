"use client";

import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { Clock as ClockIcon, Search, Hash, Target, ChevronRight } from 'lucide-react';
import { ACADEMY_MODULES } from '@/lib/data/academy-data';
import { safeHTML } from '@/hooks/useSanitizer';

//  CORPORATE MINI LOGO 
function AcademyLogo() {
    return (
        <img src="/logo-landingpage.png" alt="Whale" className="w-8 h-8 object-contain opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-sm" />
    );
}

//  MEMOIZED ARTICLE 
const ArticleBlock = memo(function ArticleBlock({
    article,
    index,
}: {
    article: { id: string; title: string; description: string; content: string; readTime: number };
    index: number;
}) {
    return (
        <article
            key={article.id}
            id={article.id}
            className="group relative border-b border-[#E5E5E5] pb-24 mb-24 last:border-0 scroll-mt-32"
            style={{ contentVisibility: 'auto', containIntrinsicSize: '800px' }}
        >
            <div className="absolute -left-16 top-0 hidden 2xl:flex flex-col items-center">
                <span className="text-[10px] font-black text-[#888888]/30 uppercase tracking-[0.5em] rotate-180" style={{ writingMode: 'vertical-rl' }}>
                    MODULE_{index.toString().padStart(3, '0')}
                </span>
            </div>

            <div className="mb-12 space-y-6">
                <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] font-mono">
                    <span className="flex items-center gap-2 bg-[#111111] text-[#FFFFFF] px-4 py-1.5 rounded-full shadow-sm">
                        <ClockIcon size={12} /> {article.readTime} MIN READ
                    </span>

                </div>

                <h3 className="font-sans text-4xl md:text-5xl lg:text-6xl font-black text-[#111111] tracking-tighter leading-[1.05]">
                    {article.title}
                </h3>

                <p className="font-sans text-xl md:text-2xl text-[#333333] leading-relaxed max-w-3xl">
                    {article.description}
                </p>
            </div>

            <div
                className="prose-aztec-v3 prose max-w-none 
                prose-headings:font-sans prose-headings:tracking-tighter prose-headings:text-[#111111]
                prose-h2:text-4xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:font-black
                prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-6 prose-h3:font-bold
                prose-p:font-sans prose-p:text-[#444444] prose-p:leading-[1.8] prose-p:text-lg md:prose-p:text-xl prose-p:mb-8
                prose-strong:text-[#111111] prose-strong:font-black
                prose-ul:text-[#444444] prose-li:marker:text-[#888888] prose-ul:mb-8
                prose-a:text-[#06b6d4] prose-a:font-bold hover:prose-a:text-[#00FFAA]
                prose-blockquote:border-l-4 prose-blockquote:border-[#111111] prose-blockquote:bg-[#111111]/[0.02] prose-blockquote:p-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-[#333333] prose-blockquote:font-medium
                prose-code:bg-[#111111]/5 prose-code:text-[#111111] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none"
                dangerouslySetInnerHTML={safeHTML(article.content)}
            />
        </article>
    );
});

export function AcademyViewer() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSection, setActiveSection] = useState<string>('');
    const [scrollProgress, setScrollProgress] = useState(0);

    // Standard Window Scroll Tracking
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            setScrollProgress(progress);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const filteredModules = React.useMemo(() => {
        if (!searchQuery.trim()) return ACADEMY_MODULES;
        const query = searchQuery.toLowerCase();
        return ACADEMY_MODULES.map(module => ({
            ...module,
            articles: module.articles.filter(a =>
                a.title.toLowerCase().includes(query) ||
                a.description.toLowerCase().includes(query)
            ),
        })).filter(module => module.articles.length > 0);
    }, [searchQuery]);

    // Active Section Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                let mostVisible = entries[0];
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio > mostVisible.intersectionRatio) {
                        mostVisible = entry;
                    }
                });
                if (mostVisible && mostVisible.isIntersecting) {
                    setActiveSection(mostVisible.target.id);
                }
            },
            { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.2, 0.5, 0.8, 1] }
        );
        const sections = document.querySelectorAll('article[id]');
        sections.forEach((s) => observer.observe(s));
        return () => sections.forEach((s) => observer.unobserve(s));
    }, [filteredModules]);

    const scrollToSection = useCallback((id: string) => {
        const el = document.getElementById(id);
        if (el) {
            // Offset for the sticky header
            const y = el.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    }, []);

    return (
        <div className="flex w-full bg-[#FFFFFF] relative z-20 text-[#111111] font-sans antialiased">
            
            {/* PROGRESS BAR */}
            <div className="fixed top-0 left-0 right-0 h-[3px] bg-[#E5E5E5] z-[100]" style={{ top: '80px' /* adjust if InstitutionalShell header height varies */ }}>
                <motion.div 
                    className="h-full bg-[#00FFAA]"
                    style={{ width: `${scrollProgress}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            </div>

            {/* SIDEBAR: KNOWLEDGE INDEX */}
            <aside className="hidden lg:flex w-[380px] flex-shrink-0 border-r border-[#E5E5E5] bg-white flex-col relative sticky top-[80px] self-start h-[calc(100vh-80px)] overflow-y-auto">
                <div className="p-8 border-b border-[#E5E5E5] bg-white z-10 sticky top-0">
                    <div className="flex items-center gap-4 mb-2 group cursor-default">
                        <div className="p-2 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl">
                            <AcademyLogo />
                        </div>
                        <div>

                        </div>
                    </div>
                    
                    <div className="mt-8 relative">
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888] pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search archives..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl text-sm font-medium text-[#111111] placeholder:text-[#888888] focus:outline-none focus:border-[#111111] transition-all focus:bg-white shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex-1 p-6 space-y-10">
                    {filteredModules.map((module) => (
                        <div key={module.id} className="relative pl-5">
                            <div className="absolute left-0 top-1.5 bottom-0 w-px bg-[#E5E5E5]" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#888888] mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#111111] shadow-[0_0_0_4px_#FFFFFF] z-10 -ml-[23px]" />
                                {module.title}
                            </h3>
                            <div className="flex flex-col gap-1.5">
                                {module.articles.map(article => {
                                    const isActive = activeSection === article.id;
                                    return (
                                        <button
                                            key={article.id}
                                            onClick={() => scrollToSection(article.id)}
                                            className={`text-left px-4 py-3 text-sm transition-all rounded-xl flex items-center justify-between group
                                                ${isActive
                                                    ? 'text-[#111111] font-black bg-[#FFFFFF] shadow-sm border border-[#E5E5E5]'
                                                    : 'text-[#888888] hover:text-[#111111] hover:bg-[#FFFFFF] font-bold border border-transparent'
                                                }`}
                                        >
                                            <span className="truncate max-w-[240px] leading-tight">
                                                {article.title}
                                            </span>
                                            {isActive && (
                                                <ChevronRight size={14} className="text-[#00FFAA]" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 border-t border-[#E5E5E5] bg-[#FFFFFF] mt-auto">
                    <div className="flex items-center justify-between text-[9px] font-mono text-[#111111] uppercase tracking-widest font-black">
                        <span>Status: Online</span>
                        <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-[#E5E5E5]">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00FFAA] animate-pulse" /> Read Verified
                        </span>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT: CLASS-LEVEL EDUCATION */}
            <main className="flex-1 bg-transparent relative w-full lg:max-w-[calc(100%-380px)]">
                
                <div className="max-w-[900px] mx-auto px-6 lg:px-16 py-16 lg:py-24 relative z-10">
                    <header className="mb-32 border-l-[6px] border-[#111111] pl-10">
                        <h1 className="font-sans text-5xl md:text-7xl lg:text-8xl font-black text-[#111111] tracking-tighter mb-6 uppercase leading-[0.9]">
                            Strategic <br />
                            <span className="text-[#888888]">Analytics</span>
                        </h1>
                        <p className="font-sans text-xl lg:text-2xl text-[#444444] max-w-2xl leading-relaxed font-medium">
                            The system framework. Core principles and deep-dive technical archives for maximum on-chain validation.
                        </p>
                    </header>

                    {filteredModules.map((module) => (
                        <section key={module.id} className="mb-48">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-8 mb-20 sticky top-[80px] z-20 pt-8 bg-[#FFFFFF]/95 backdrop-blur-md -mx-8 px-8 pb-6 border-b border-[#E5E5E5]">
                                <div className="flex flex-col flex-1">
                                    <h2 className="font-sans text-4xl md:text-5xl font-black text-[#111111] tracking-tighter">
                                        {module.title}
                                    </h2>
                                    <p className="text-[11px] font-mono text-[#888888] uppercase tracking-[0.4em] mt-2 font-bold">
                                        {module.description}
                                    </p>
                                </div>
                                <div className="hidden sm:flex items-center gap-2 bg-white px-5 py-2.5 rounded-xl border border-[#E5E5E5] shadow-sm">
                                    <Target size={14} className="text-[#111111]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#111111]">{module.articles.length} FILES</span>
                                </div>
                            </div>

                            <div className="space-y-32">
                                {module.articles.map((article, index) => (
                                    <ArticleBlock key={article.id} article={article} index={index} />
                                ))}
                            </div>
                        </section>
                    ))}

                    {filteredModules.length === 0 && (
                        <div className="text-center py-32 border-2 border-dashed border-[#E5E5E5] rounded-[2rem] bg-white">
                            <Hash size={48} className="mx-auto text-[#888888] mb-6" />
                            <p className="text-xl font-black text-[#111111] uppercase tracking-widest">
                                No classified files match query.
                            </p>
                            <p className="text-sm font-bold text-[#888888] mt-2">Adjust your search parameters.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
