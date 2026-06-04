"use client";

import React, { useEffect, useState } from 'react';
import { ShieldCheck, User, Bell, Tag, Settings, Plus, Trash2, Save, Loader2, Check, AlertTriangle } from 'lucide-react';
import { SIWEPanel } from '@/components/auth/SIWEAuthGate';
import { useAccount } from 'wagmi';

//  Types 
interface Category {
  id: string; name: string; slug: string; description: string;
  color: string; orderIndex: number; _count?: { topics: number };
}
interface UserProfile {
  displayName: string | null; bio: string | null; avatarUrl: string | null;
  notifyOnReply: boolean; notifyOnMention: boolean;
  tier: string; isPro: boolean; isAdmin: boolean;
}
interface GlobalSettings {
  siteName: string; welcomeMessage: string; moderationMode: string;
  allowGuestRead: boolean; requireApproval: boolean;
  maxTopicsPerDay: number; maxPostsPerDay: number;
}

//  API helpers 
async function apiForum(action: string, payload: object, address?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (address) headers['x-web3-address'] = address;
  const res = await fetch('/api/forum/settings', {
    method: 'POST',
    headers,
    body: JSON.stringify({ action, ...payload }),
  });
  return res.json();
}

//  Tiny status banner 
function Banner({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold ${ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
      {ok ? <Check size={14} /> : <AlertTriangle size={14} />}
      {msg}
    </div>
  );
}

//  Section wrapper 
function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center gap-3 pb-3 border-b border-black/10 dark:border-white/10">
        <span className="text-black/50 dark:text-[#888888]">{icon}</span>
        <h2 className="text-[16px] font-black uppercase tracking-widest text-black dark:text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

//  Label + input helper 
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold uppercase tracking-widest text-black/50 dark:text-[#888888]">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 rounded-lg text-[14px] font-mono outline-none transition-all focus:ring-1 bg-[#FFFFFF] dark:bg-[#111111] border border-black/10 dark:border-white/10 text-[#050505] dark:text-[#FFFFFF]";

// 
export default function ForumSettingsPage() {
  const { address } = useAccount();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [banner, setBanner] = useState<{ msg: string; ok: boolean } | null>(null);

  // profile
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);

  // categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCat, setNewCat] = useState({ name: '', slug: '', description: '', color: '#6366f1', orderIndex: 99 });
  const [addingCat, setAddingCat] = useState(false);

  // global settings
  const [global, setGlobal] = useState<GlobalSettings | null>(null);

  //  Load data 
  useEffect(() => {
    fetch('/api/forum/settings', { headers: address ? { 'x-web3-address': address } : undefined })
      .then(r => r.json())
      .then(d => {
        if (d.error) { setLoading(false); return; }
        setProfile(d.user);
        setCategories(d.categories || []);
        setGlobal(d.globalSettings);
        setIsAdmin(d.user?.isAdmin ?? false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [address]);

  const flash = (msg: string, ok = true) => {
    setBanner({ msg, ok });
    setTimeout(() => setBanner(null), 3500);
  };

  //  Profile save 
  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    const r = await apiForum('update_profile', {
      displayName: profile.displayName || null,
      bio: profile.bio || null,
      avatarUrl: profile.avatarUrl?.trim() || null, // null if empty  field is optional
      notifyOnReply: profile.notifyOnReply,
      notifyOnMention: profile.notifyOnMention,
    }, address);
    setSaving(false);
    r.ok ? flash('Profile saved.') : flash(r.error || 'Error saving profile.', false);
  };

  //  Category helpers 
  const saveCategory = async (cat: Category) => {
    const r = await apiForum('update_category', { id: cat.id, name: cat.name, description: cat.description, color: cat.color, orderIndex: cat.orderIndex }, address);
    r.ok ? flash('Category updated.') : flash(r.error || 'Error.', false);
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete this category? All its topics will be uncategorized.')) return;
    const r = await apiForum('delete_category', { id }, address);
    r.ok ? (flash('Category deleted.'), setCategories(p => p.filter(c => c.id !== id))) : flash(r.error || 'Error.', false);
  };

  const createCategory = async () => {
    if (!newCat.name.trim() || !newCat.slug.trim()) { flash('Name and slug are required.', false); return; }
    setAddingCat(true);
    const r = await apiForum('create_category', newCat, address);
    setAddingCat(false);
    if (r.ok) {
      setCategories(p => [...p, r.category]);
      setNewCat({ name: '', slug: '', description: '', color: '#6366f1', orderIndex: 99 });
      flash('Category created.');
    } else flash(r.error || 'Error.', false);
  };

  //  Global save 
  const saveGlobal = async () => {
    if (!global) return;
    const r = await apiForum('update_global', global, address);
    r.ok ? flash('Forum settings saved.') : flash(r.error || 'Error.', false);
  };

  //  Render 
  if (loading) return (
    <div className="flex items-center justify-center h-[60vh] gap-3 text-black/50 dark:text-[#888888]">
      <Loader2 size={24} className="animate-spin" />
      <span className="text-[14px] font-mono">Loading forum settings</span>
    </div>
  );

  if (!profile) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4 w-full">
      <SIWEPanel inline onAuthenticated={() => window.location.reload()} />
    </div>
  );

  return (
    <div className="w-full max-w-[860px] mx-auto py-10 px-4 flex flex-col gap-12">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-black tracking-tight text-black dark:text-white">
            Forum Settings
          </h1>
          <p className="text-[13px] mt-1 text-black/50 dark:text-[#888888]">
            Configure your forum identity, notifications, and {isAdmin ? 'community parameters.' : 'personal preferences.'}
          </p>
        </div>
        {isAdmin && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-purple-100 text-purple-700 border border-purple-200">
            <ShieldCheck size={12} /> Administrator
          </span>
        )}
      </div>

      {banner && <Banner msg={banner.msg} ok={banner.ok} />}

      {/*  SECTION 1: IDENTITY  */}
      <Section icon={<User size={18} />} title="Identity">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Display Name">
            <input
              className={inputCls}
              value={profile.displayName ?? ''}
              placeholder="e.g. NetworkParticipant"
              onChange={e => setProfile(p => p && ({ ...p, displayName: e.target.value }))}
            />
          </Field>
          <Field label="Avatar URL">
            <input
              className={inputCls}
              value={profile.avatarUrl ?? ''}
              placeholder="https:///avatar.png"
              onChange={e => setProfile(p => p && ({ ...p, avatarUrl: e.target.value }))}
            />
          </Field>
        </div>
        <Field label="Bio">
          <textarea
            className={inputCls}
            style={{ resize: 'vertical', minHeight: 90 }}
            value={profile.bio ?? ''}
            placeholder="Short bio visible on your forum profile"
            onChange={e => setProfile(p => p && ({ ...p, bio: e.target.value }))}
          />
        </Field>
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-mono px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black/50 dark:text-[#888888]">
            Tier: <strong className="text-black dark:text-white">{profile.tier ?? 'STANDARD'}</strong>
          </span>
          {profile.isPro && (
            <span className="text-[12px] font-black px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200"> PRO</span>
          )}
        </div>
        <div className="flex justify-end">
          <button
            onClick={saveProfile}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-black uppercase tracking-widest transition-all disabled:opacity-50 bg-[#050505] dark:bg-[#FFFFFF] text-[#FFFFFF] dark:text-[#050505] hover:bg-[#00C076] dark:hover:bg-[#00C076] hover:text-white"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Identity
          </button>
        </div>
      </Section>

      {/*  SECTION 2: NOTIFICATIONS  */}
      <Section icon={<Bell size={18} />} title="Notifications">
        <div className="flex flex-col gap-4">
          {[
            { key: 'notifyOnReply', label: 'Notify me when someone replies to my topics', desc: 'Receive an in-platform notification for every new reply.' },
            { key: 'notifyOnMention', label: 'Notify me when I am @mentioned', desc: 'Triggered when another user mentions your wallet or display name.' },
          ].map(({ key, label, desc }) => (
            <label key={key} className="flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5 border border-black/10 dark:border-white/10">
              <input
                type="checkbox"
                className="mt-0.5 w-4 h-4 rounded accent-purple-600 shrink-0"
                checked={!!(profile as any)[key]}
                onChange={e => setProfile(p => p && ({ ...p, [key]: e.target.checked }))}
              />
              <div>
                <p className="text-[14px] font-bold text-black dark:text-white">{label}</p>
                <p className="text-[12px] mt-0.5 text-black/50 dark:text-[#888888]">{desc}</p>
              </div>
            </label>
          ))}
        </div>
        <div className="flex justify-end">
          <button
            onClick={saveProfile}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-black uppercase tracking-widest transition-all disabled:opacity-50 bg-[#050505] dark:bg-[#FFFFFF] text-[#FFFFFF] dark:text-[#050505] hover:bg-[#00C076] dark:hover:bg-[#00C076] hover:text-white"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Notifications
          </button>
        </div>
      </Section>

      {/*  ADMIN SECTIONS  */}
      {isAdmin && (
        <>
          {/* SECTION 3: CATEGORIES */}
          <Section icon={<Tag size={18} />} title="Categories">
            <div className="flex flex-col gap-3">
              {categories.map(cat => (
                <div key={cat.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-black/5 dark:bg-[#111111] border border-black/10 dark:border-white/10">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input
                      type="color"
                      value={cat.color}
                      className="w-8 h-8 rounded-lg cursor-pointer shrink-0 border-0 p-0"
                      onChange={e => setCategories(p => p.map(c => c.id === cat.id ? { ...c, color: e.target.value } : c))}
                    />
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <input
                        className={inputCls + " text-[13px]"}
                        value={cat.name}
                        placeholder="Category name"
                        onChange={e => setCategories(p => p.map(c => c.id === cat.id ? { ...c, name: e.target.value } : c))}
                      />
                      <input
                        className={inputCls + " text-[12px] opacity-75"}
                        value={cat.description}
                        placeholder="Short description"
                        onChange={e => setCategories(p => p.map(c => c.id === cat.id ? { ...c, description: e.target.value } : c))}
                      />
                    </div>
                    <input
                      type="number"
                      className={inputCls + " text-[13px] w-16"}
                      value={cat.orderIndex}
                      title="Order index"
                      onChange={e => setCategories(p => p.map(c => c.id === cat.id ? { ...c, orderIndex: Number(e.target.value) } : c))}
                    />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-black/50 dark:text-[#888888]">{cat._count?.topics ?? 0} topics</span>
                    <button onClick={() => saveCategory(cat)} className="p-1.5 rounded-lg text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 transition-all" title="Save">
                      <Save size={13} />
                    </button>
                    <button onClick={() => deleteCategory(cat.id)} className="p-1.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all" title="Delete">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* New category form */}
            <div className="flex flex-col gap-3 p-4 rounded-xl border-2 border-dashed border-black/10 dark:border-white/10">
              <p className="text-[11px] font-bold uppercase tracking-widest text-black/50 dark:text-[#888888]">New Category</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Name">
                  <input className={inputCls} value={newCat.name} placeholder="Governance" onChange={e => setNewCat(p => ({ ...p, name: e.target.value }))} />
                </Field>
                <Field label="Slug (URL)">
                  <input className={inputCls} value={newCat.slug} placeholder="governance" onChange={e => setNewCat(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} />
                </Field>
              </div>
              <Field label="Description">
                <input className={inputCls} value={newCat.description} placeholder="Brief description" onChange={e => setNewCat(p => ({ ...p, description: e.target.value }))} />
              </Field>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-black/50 dark:text-[#888888]">Color</label>
                  <input type="color" value={newCat.color} className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0" onChange={e => setNewCat(p => ({ ...p, color: e.target.value }))} />
                </div>
                <Field label="Order">
                  <input type="number" className={inputCls + " w-20"} value={newCat.orderIndex} onChange={e => setNewCat(p => ({ ...p, orderIndex: Number(e.target.value) }))} />
                </Field>
                <button
                  onClick={createCategory}
                  disabled={addingCat}
                  className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-black uppercase tracking-widest transition-all disabled:opacity-50 bg-[#050505] dark:bg-[#FFFFFF] text-[#FFFFFF] dark:text-[#050505] hover:bg-[#00C076] dark:hover:bg-[#00C076] hover:text-white"
                >
                  {addingCat ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Add Category
                </button>
              </div>
            </div>
          </Section>

          {/* SECTION 4: MODERATION & GLOBAL */}
          {global && (
            <Section icon={<Settings size={18} />} title="Moderation & Global">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Site Name">
                  <input className={inputCls} value={global.siteName} onChange={e => setGlobal(p => p && ({ ...p, siteName: e.target.value }))} />
                </Field>
                <Field label="Moderation Mode">
                  <select
                    className={`${inputCls} appearance-none`}
                    value={global.moderationMode}
                    onChange={e => setGlobal(p => p && ({ ...p, moderationMode: e.target.value }))}
                  >
                    <option value="OPEN">OPEN  Posts publish instantly</option>
                    <option value="STRICT">STRICT  All posts require approval</option>
                    <option value="LOCKED">LOCKED  No new posts allowed</option>
                  </select>
                </Field>
              </div>
              <Field label="Welcome Message">
                <textarea
                  className={`${inputCls} resize-y min-h-[80px]`}
                  value={global.welcomeMessage}
                  onChange={e => setGlobal(p => p && ({ ...p, welcomeMessage: e.target.value }))}
                />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Max Topics / Day">
                  <input type="number" className={inputCls} value={global.maxTopicsPerDay} onChange={e => setGlobal(p => p && ({ ...p, maxTopicsPerDay: Number(e.target.value) }))} />
                </Field>
                <Field label="Max Posts / Day">
                  <input type="number" className={inputCls} value={global.maxPostsPerDay} onChange={e => setGlobal(p => p && ({ ...p, maxPostsPerDay: Number(e.target.value) }))} />
                </Field>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { key: 'allowGuestRead', label: 'Allow guests to read topics without connecting wallet' },
                  { key: 'requireApproval', label: 'Require admin approval before new topics are published' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded accent-purple-600"
                      checked={!!(global as any)[key]}
                      onChange={e => setGlobal(p => p && ({ ...p, [key]: e.target.checked }))}
                    />
                    <span className="text-[14px] text-black dark:text-white">{label}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={saveGlobal}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-black uppercase tracking-widest transition-all bg-[#050505] dark:bg-[#FFFFFF] text-[#FFFFFF] dark:text-[#050505] hover:bg-[#00C076] dark:hover:bg-[#00C076] hover:text-white"
                >
                  <Save size={14} /> Save Forum Config
                </button>
              </div>
            </Section>
          )}
        </>
      )}
    </div>
  );
}
