"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, Save, FileLock2, Plus, ShieldCheck } from 'lucide-react';
import { useSignMessage, useAccount } from 'wagmi';
import { useSystemAccount } from '@/hooks/useSystemAccount';
import { WhaleAlertLoader } from '@/components/ui/WhaleAlertLoader';

const DRAFT_KEY = 'forum_draft_new_topic';

export default function NewTopicPage() {
  return (
    <React.Suspense fallback={<WhaleAlertLoader bg="transparent" color="#050505" />}>
      <NewTopicContent />
    </React.Suspense>
  );
}

function NewTopicContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCategory = searchParams.get('category');

  const [categories, setCategories] = useState<any[]>([]);
  const [title, setTitle]           = useState('');
  const [content, setContent]       = useState('');
  const [categoryId, setCategoryId] = useState(preselectedCategory || '');
  const [tags, setTags]             = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const [draftSaved, setDraftSaved] = useState(false);
  const [documents, setDocuments]   = useState<{ title: string, url: string }[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const { address, isConnected, isSystemHandshake } = useSystemAccount();
  const { signMessageAsync } = useSignMessage();

  //  Restore draft on mount 
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.title)      setTitle(draft.title);
        if (draft.content)    setContent(draft.content);
        if (draft.categoryId) setCategoryId(draft.categoryId);
        if (draft.tags)       setTags(draft.tags);
      }
    } catch {}
  }, []);

  //  Auto-save draft on every change 
  useEffect(() => {
    if (!title && !content && !tags) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, content, categoryId, tags }));
      setDraftSaved(true);
      const t = setTimeout(() => setDraftSaved(false), 1800);
      return () => clearTimeout(t);
    } catch {}
  }, [title, content, categoryId, tags]);

  useEffect(() => {
    fetch('/api/forum/categories')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
          if (!categoryId && data.length > 0) setCategoryId(data[0].id);
        }
      })
      .catch(console.error);
  }, []);

  const submit = async () => {
    setError('');
    if (!title.trim() || !content.trim() || !categoryId) {
      setError('Title, category, and content are required.');
      return;
    }
    if (!isConnected) {
      setError('Please connect your wallet to post.');
      return;
    }
    setSubmitting(true);
    try {
      let finalContent = content;
      let finalSignature = '';
      
      // Inject Secure Documents into payload
      documents.forEach(doc => {
        if (doc.title.trim() && doc.url.trim()) {
            finalContent += `\n\n[SECURE_DOC:${doc.title.trim()}|${doc.url.trim()}]`;
        }
      });

      try {
        finalSignature = await signMessageAsync({ message: finalContent });
      } catch (err) {
        setError('You must sign the message to post.');
        setSubmitting(false);
        return;
      }
      
      finalContent = `${finalContent}\n\n[SIGNATURE:${finalSignature}]`;

      let csrfToken = '';
      try {
          const csrfRes = await fetch('/api/auth/csrf', {
              headers: { 'x-web3-address': address || '' }
          });
          if (!csrfRes.ok) throw new Error('CSRF fetch failed');
          const contentType = csrfRes.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
              const csrfData = await csrfRes.json();
              csrfToken = csrfData.token;
          } else {
              throw new Error("Invalid CSRF response");
          }
      } catch (e) {
          setError('Your session expired. Please reconnect your wallet.');
          setSubmitting(false);
          return;
      }

      const res = await fetch('/api/forum/topics', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken,
            'x-web3-address': address || ''
        },
        body: JSON.stringify({
          title,
          content: finalContent,
          categoryId,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          cryptoSignature: finalSignature,
        }),
      });
      if (res.ok) {
        // Clear draft on successful post
        try { localStorage.removeItem(DRAFT_KEY); } catch {}
        const topic = await res.json();
        router.push(`/forum/t/${topic.id}`);
      } else {
        const err = await res.json();
        setError(err.error || 'Submission failed. Are you authenticated?');
      }
    } catch {
      setError('Network error. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  const clearDraft = () => {
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
    setTitle(''); setContent(''); setTags(''); setDocuments([]);
    if (categories.length > 0) setCategoryId(categories[0].id);
  };

  const addDocument = () => setDocuments([...documents, { title: '', url: '' }]);
  const updateDocument = (index: number, key: 'title' | 'url', value: string) => {
      const newDocs = [...documents];
      newDocs[index][key] = value;
      setDocuments(newDocs);
  };
  const removeDocument = (index: number) => {
      setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingFile(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch('/api/forum/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (res.ok && data.url) {
        const newDocs = [...documents];
        // Automatically fill title with the original file name if empty
        if (!newDocs[index].title) {
          newDocs[index].title = data.fileName || file.name;
        }
        newDocs[index].url = data.url;
        setDocuments(newDocs);
      } else {
        setError(data.error || 'Upload failed. Please try again.');
      }
    } catch (err) {
      setError('Upload failed due to a network error.');
    } finally {
      setUploadingFile(false);
      // Reset input
      e.target.value = '';
    }
  };

  return (
    <div className="w-full min-h-screen bg-white text-slate-900 py-10 font-sans">
      <div className="w-full max-w-[1110px] mx-auto px-6 lg:px-12">
        <div className="max-w-[820px] mx-auto bg-white border border-slate-200 rounded-xl shadow-sm p-8 md:p-12 relative">

      {/*  Header  */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
        <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
              <ShieldCheck className="text-[#0088cc]" size={24} />
              Start a New Discussion
            </h1>
            <p className="text-sm text-slate-500">
                Your post will be linked to your connected wallet address.
            </p>
        </div>
        <div className="flex items-center gap-3">
          {draftSaved && (
            <span className="flex items-center gap-1.5 text-[10px] font-sans font-bold uppercase tracking-widest text-emerald-500">
              <Save size={10} /> Draft saved
            </span>
          )}
          {(title || content) && (
            <button
              onClick={clearDraft}
              className="text-[10px] font-black uppercase tracking-widest hover:text-black dark:hover:text-white transition-colors text-black/60 dark:text-[#888888] px-4 py-2 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10"
            >
              Clear draft
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-8">

        {/*  Title  */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-[#888888] uppercase tracking-[0.2em] px-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="What do you want to discuss?"
            className="w-full px-5 py-4 text-[18px] font-sans font-medium rounded-xl outline-none transition-all bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-[#555555] focus:border-[#00C076] focus:bg-white dark:focus:bg-[#1A1A1A] focus:shadow-[0_0_20px_rgba(0,192,118,0.1)]"
          />
        </div>

        {/*  Category + Tags  */}
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1 relative flex flex-col gap-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
              <div className="relative">
                <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 pr-10 text-[14px] font-sans rounded-lg outline-none transition-all cursor-pointer appearance-none bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 text-black dark:text-white focus:border-[#00C076] focus:bg-white dark:focus:bg-[#1A1A1A]"
                >
              <option value="" disabled className="text-black/40 dark:text-[#555555]">Select a category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id} className="bg-white dark:bg-[#111111] text-black dark:text-white">{cat.name}</option>
              ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" size={16} />
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <label className="text-[10px] font-black text-[#888888] uppercase tracking-[0.2em] px-1">Tags</label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="e.g. Solidity, Audit, DeFi (comma separated)"
              className="w-full px-5 py-4 text-[14px] font-sans font-medium rounded-xl outline-none transition-all bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-[#555555] focus:border-[#00C076] focus:bg-white dark:focus:bg-[#1A1A1A]"
            />
          </div>
        </div>

        {/*  Document Vault  */}
        <div className="flex flex-col gap-3 bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 p-6 rounded-2xl relative overflow-hidden transition-colors">
            <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-l from-[#00C076]/30 to-transparent" />
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-[#00C076]">
                    <FileLock2 size={18} />
                    <span className="text-[12px] font-black uppercase tracking-[0.2em] text-black dark:text-white transition-colors">Attachments</span>
                </div>
                <button onClick={addDocument} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00C076]/10 text-[#00C076] hover:bg-[#00C076]/20 transition-colors rounded-lg text-[10px] font-black uppercase tracking-widest border border-[#00C076]/20">
                    <Plus size={12} /> Add Document
                </button>
            </div>
            <p className="text-[11px] text-[#888888] mb-2 leading-relaxed">
                Attach files or paste a link. Uploaded files are stored securely and embedded in your post.
            </p>
            {documents.map((doc, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-4 items-stretch md:items-center bg-black/5 dark:bg-[#000000] p-3 rounded-xl border border-black/5 dark:border-white/5 relative group transition-colors">
                    <input type="text" placeholder="Document Title (e.g. Audit Report 2026)" value={doc.title} onChange={e => updateDocument(idx, 'title', e.target.value)} className="w-full md:flex-1 px-4 py-2.5 text-[12px] rounded-lg bg-white dark:bg-[#050505] border border-black/10 dark:border-white/10 text-black dark:text-white focus:border-[#00C076] outline-none transition-colors" />
                    
                    <div className="w-full md:flex-1 relative flex items-center">
                        <input type="text" placeholder="Secure URL / IPFS CID" value={doc.url} onChange={e => updateDocument(idx, 'url', e.target.value)} className="w-full px-4 py-2.5 pr-[100px] text-[12px] font-mono rounded-lg bg-white dark:bg-[#050505] border border-black/10 dark:border-white/10 text-[#00C076] focus:border-[#00C076] outline-none transition-colors" />
                        
                        {/* Native File Upload Integration */}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <label className="cursor-pointer bg-black/10 dark:bg-[#111] hover:bg-black/20 dark:hover:bg-[#222] border border-black/10 dark:border-white/10 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md text-black dark:text-white transition-colors">
                                {uploadingFile ? 'Uploading...' : 'Upload File'}
                                <input type="file" className="hidden" disabled={uploadingFile} onChange={(e) => handleFileUpload(e, idx)} />
                            </label>
                        </div>
                    </div>

                    <button onClick={() => removeDocument(idx)} className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20 self-end md:self-auto shrink-0 flex items-center justify-center">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            ))}
        </div>

        {/*  Body  */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-[#888888] uppercase tracking-[0.2em] px-1">Your message</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your post here. Markdown is supported."
            className="w-full px-6 py-5 text-[15px] font-serif rounded-xl outline-none resize-none min-h-[360px] leading-relaxed transition-all bg-white dark:bg-[#111111] border border-black/10 dark:border-white/10 text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-[#555555] focus:border-[#00C076] focus:bg-white dark:focus:bg-[#1A1A1A] focus:shadow-[0_0_20px_rgba(0,192,118,0.1)] custom-scrollbar"
          />
        </div>

        {/*  Footer  */}
        <div className="flex items-center gap-6 mt-6 pt-6 border-t border-black/10 dark:border-white/10 flex-wrap">
            <button
              onClick={submit}
              disabled={submitting}
              className="w-full h-[48px] bg-[#0088cc] text-white rounded-lg text-[14px] font-bold hover:bg-[#0077b3] active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <FileLock2 size={16} />
                  Submit Now
                </>
              )}
            </button>
          <Link
            href="/forum"
            className="text-[11px] font-black uppercase tracking-widest transition-opacity hover:opacity-100 text-black/60 dark:text-[#888888] hover:text-black dark:hover:text-white"
          >
            Cancel
          </Link>
          {error && (
            <span className="text-[13px] font-sans font-bold text-red-400 ml-auto">
              {error}
            </span>
          )}
        </div>
      </div>
      </div>
      </div>
    </div>
  );
}
