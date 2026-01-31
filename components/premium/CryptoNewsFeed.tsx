"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, TrendingUp, TrendingDown, Minus, ExternalLink, Filter, RefreshCw } from 'lucide-react';

interface NewsArticle {
  id: string;
  title: string;
  body: string;
  url: string;
  source: string;
  publishedOn: number;
  imageUrl?: string;
  tags: string[];
  categories: string[];
  sentiment?: 'bullish' | 'bearish' | 'neutral';
}

interface CryptoNewsFeedProps {
  isPremium: boolean;
}

export default function CryptoNewsFeed({ isPremium }: CryptoNewsFeedProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'bullish' | 'bearish' | 'neutral'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchNews();
    
    if (autoRefresh) {
      const interval = setInterval(fetchNews, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/news/crypto?limit=30');
      const data = await response.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(article => {
    if (filter === 'all') return true;
    return article.sentiment === filter;
  });

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'bullish': return <TrendingUp size={16} className="text-green-600" />;
      case 'bearish': return <TrendingDown size={16} className="text-red-600" />;
      default: return <Minus size={16} className="text-gray-600" />;
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'bullish': return 'bg-green-100 text-green-800 border-green-200';
      case 'bearish': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#1F1F1F] flex items-center gap-3">
            <Newspaper className="text-purple-500" />
            AI Crypto News
            <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full">PRO</span>
          </h1>
          <p className="text-sm text-[#1F1F1F]/70 mt-1">
            Real-time curated news with AI sentiment analysis
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Auto-refresh toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              autoRefresh 
                ? 'bg-green-500 text-white' 
                : 'bg-white/50 text-[#1F1F1F]/70'
            }`}
          >
            <RefreshCw size={16} className={autoRefresh ? 'animate-spin' : ''} />
            Auto-Refresh
          </button>

          {/* Manual refresh */}
          <button
            onClick={fetchNews}
            disabled={loading}
            className="px-4 py-2 bg-[#1F1F1F] text-white rounded-xl font-bold hover:bg-[#1F1F1F]/90 transition-all disabled:opacity-50"
          >
            Refresh Now
          </button>
        </div>
      </div>

      {/* Sentiment Filter */}
      <div className="flex gap-2">
        {['all', 'bullish', 'neutral', 'bearish'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-xl font-bold transition-all capitalize ${
              filter === f
                ? 'bg-[#1F1F1F] text-white'
                : 'bg-white/50 text-[#1F1F1F]/70 hover:bg-white/80'
            }`}
          >
            {f}
            {f !== 'all' && (
              <span className="ml-2 text-xs">
                ({articles.filter(a => a.sentiment === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* News Grid */}
      {loading && articles.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredArticles.map((article, index) => (
              <NewsCard key={article.id} article={article} index={index} getSentimentIcon={getSentimentIcon} getSentimentColor={getSentimentColor} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {filteredArticles.length === 0 && !loading && (
        <div className="text-center py-12 text-[#1F1F1F]/70">
          <p className="text-lg font-bold">No {filter !== 'all' ? filter : ''} news found</p>
        </div>
      )}
    </div>
  );
}

function NewsCard({ 
  article, 
  index,
  getSentimentIcon,
  getSentimentColor 
}: { 
  article: NewsArticle;
  index: number;
  getSentimentIcon: (sentiment?: string) => JSX.Element;
  getSentimentColor: (sentiment?: string) => string;
}) {
  const timeAgo = getTimeAgo(article.publishedOn);

  return (
    <motion.a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className="group block p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-[#1F1F1F]/10 hover:bg-white/80 hover:border-purple-500/30 transition-all cursor-pointer"
    >
      {/* Image */}
      {article.imageUrl && (
        <div className="relative w-full h-40 mb-3 rounded-xl overflow-hidden bg-gray-100">
          <img 
            src={article.imageUrl} 
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>
      )}

      {/* Sentiment Badge */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`px-2 py-1 rounded-lg text-xs font-bold border flex items-center gap-1 ${getSentimentColor(article.sentiment)}`}>
          {getSentimentIcon(article.sentiment)}
          {article.sentiment?.toUpperCase()}
        </span>
        <span className="text-xs text-[#1F1F1F]/50">{timeAgo}</span>
      </div>

      {/* Title */}
      <h3 className="font-black text-[#1F1F1F] mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
        {article.title}
      </h3>

      {/* Body Preview */}
      <p className="text-sm text-[#1F1F1F]/70 line-clamp-3 mb-3">
        {article.body}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {article.tags.slice(0, 2).map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-[#1F1F1F]/10 rounded-full text-xs font-bold text-[#1F1F1F]/70">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-purple-600 group-hover:gap-2 transition-all">
          Read More
          <ExternalLink size={12} />
        </div>
      </div>

      {/* Source */}
      <div className="mt-2 pt-2 border-t border-[#1F1F1F]/10 text-xs text-[#1F1F1F]/50">
        {article.source}
      </div>
    </motion.a>
  );
}

function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
