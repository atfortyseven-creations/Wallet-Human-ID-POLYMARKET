"use client";

import React, { useEffect, useState } from 'react';
import { ShieldCheck, User, Bell, Tag, Settings, Plus, Trash2, Save, Loader2, Check, AlertTriangle, ChevronLeft } from 'lucide-react';
import { SIWEPanel } from '@/components/auth/SIWEAuthGate';
import { useAccount } from 'wagmi';
import Link from 'next/link';

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
    <div className={`flex items-center gap-2 px-4 py-3 text-[11px] font-black uppercase tracking-widest border-2 ${ok ? 'bg-green-50 text-green-700 border-green-500' : 'bg-red-50 text-red-700 border-red-500'}`}>
      {ok ? <Check size={14} /> : <AlertTriangle size={14} />}
      {msg}
    </div>
  );
}

//  Section wrapper 
function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-6 bg-white border-2 border-black p-6 md:p-8">
      <div className="flex items-center gap-3 pb-4 border-b-2 border-black">
        <div className="w-8 h-8 flex items-center justify-center text-black">
          {icon}
        </div>
        <h2 className="text-[14px] font-black uppercase tracking-[0.2em] text-black">{title}</h2>
      </div>
      {children}
    </section>
  );
}

//  Label + input helper 
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 pl-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-3 text-[14px] font-mono outline-none transition-all focus:ring-0 bg-white border border-gray-300 text-black focus:border-black placeholder:text-gray-400";

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
  const [newCat, setNewCat] = useState({ name: '', slug: '', description: '', color: '#000000', orderIndex: 99 });
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
      avatarUrl: profile.avatarUrl?.trim() || null,
      notifyOnReply: profile.notifyOnReply,
      notifyOnMention: profile.notifyOnMention,
    }, address);
    setSaving(false);
    r.ok ? flash('Config Synced.') : flash(r.error || 'Sync Failed.', false);
  };

  //  Category helpers 
  const saveCategory = async (cat: Category) => {
    const r = await apiForum('update_category', { id: cat.id, name: cat.name, description: cat.description, color: cat.color, orderIndex: cat.orderIndex }, address);
    r.ok ? flash('Sector updated.') : flash(r.error || 'Error.', false);
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Decommission this sector? All transmissions will be unclassified.')) return;
    const r = await apiForum('delete_category', { id }, address);
    r.ok ? (flash('Sector decommissioned.'), setCategories(p => p.filter(c => c.id !== id))) : flash(r.error || 'Error.', false);
  };

  const createCategory = async () => {
    if (!newCat.name.trim() || !newCat.slug.trim()) { flash('Identifier required.', false); return; }
    setAddingCat(true);
    const r = await apiForum('create_category', newCat, address);
    setAddingCat(false);
    if (r.ok) {
      setCategories(p => [...p, r.category]);
      setNewCat({ name: '', slug: '', description: '', color: '#000000', orderIndex: 99 });
      flash('Sector initialized.');
    } else flash(r.error || 'Error.', false);
  };

  //  Global save 
  const saveGlobal = async () => {
    if (!global) return;
    const r = await apiForum('update_global', global, address);
    r.ok ? flash('Global params secured.') : flash(r.error || 'Error.', false);
  };

  //  Render 
  if (loading) return (
    <div className="py-32 text-center text-[12px] font-mono uppercase tracking-widest animate-pulse min-h-[100dvh] bg-white text-gray-500 flex items-center justify-center flex-col gap-4">
      <div className="w-8 h-8 border-2 border-t-black border-r-black border-b-transparent border-l-transparent rounded-full animate-spin" />
      Decrypting System Config...
    </div>
  );

  if (!profile) return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-white w-full">
      <SIWEPanel inline onAuthenticated={() => window.location.reload()} />
    </div>
  );

  return (
    <div className="w-full bg-white text-black py-10 font-sans relative selection:bg-black selection:text-white">
      
      <div className="w-full max-w-[860px] mx-auto px-6 lg:px-12 flex flex-col gap-10">

        <div className="w-full">
          <Link href="/forum" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-black transition-colors mb-6">
            <ChevronLeft size={14} /> Back to Nexus
          </Link>
        </div>

        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b-2 border-black">
          <div>
            <h1 className="text-[32px] md:text-[40px] font-black tracking-tighter text-black mb-2 leading-none">
              System Config
            </h1>
            <p className="text-[13px] text-gray-500 font-mono uppercase tracking-widest">
              Configure your operative identity and local node parameters.
            </p>
          </div>
          {isAdmin && (
            <span className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] bg-black text-white">
              <ShieldCheck size={14} /> Admin Privileges
            </span>
          )}
        </div>

        <div className="sticky top-4 z-50">
          {banner && <Banner msg={banner.msg} ok={banner.ok} />}
        </div>

        {/*  SECTION 1: IDENTITY  */}
        <Section icon={<User size={16} />} title="Operative Dossier">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Designation">
              <input
                className={inputCls}
                value={profile.displayName ?? ''}
                placeholder="e.g. Node-7A"
                onChange={e => setProfile(p => p && ({ ...p, displayName: e.target.value }))}
              />
            </Field>
            <Field label="Avatar Protocol URL">
              <input
                className={inputCls}
                value={profile.avatarUrl ?? ''}
                placeholder="https://..."
                onChange={e => setProfile(p => p && ({ ...p, avatarUrl: e.target.value }))}
              />
            </Field>
          </div>
          <Field label="Signal Broadcast (Bio)">
            <textarea
              className={inputCls}
              style={{ resize: 'vertical', minHeight: 90 }}
              value={profile.bio ?? ''}
              placeholder="Public transmission visible on your dossier..."
              onChange={e => setProfile(p => p && ({ ...p, bio: e.target.value }))}
            />
          </Field>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 border border-black text-black">
              Clearance: <strong className="ml-1">{profile.tier ?? 'STANDARD'}</strong>
            </span>
            {profile.isPro && (
              <span className="text-[10px] font-black px-3 py-1.5 bg-black text-white uppercase tracking-[0.2em]">
                Verified
              </span>
            )}
          </div>
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={saveProfile}
              disabled={saving}
              className="flex items-center justify-center gap-2 px-6 py-3 text-[11px] font-black uppercase tracking-[0.15em] transition-all disabled:opacity-50 bg-black text-white hover:bg-gray-800"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Sync Dossier
            </button>
          </div>
        </Section>

        {/*  SECTION 2: NOTIFICATIONS  */}
        <Section icon={<Bell size={16} />} title="Alert Triggers">
          <div className="flex flex-col gap-3">
            {[
              { key: 'notifyOnReply', label: 'Transmission Intercepts', desc: 'Alert when a node replies to your broadcast.' },
              { key: 'notifyOnMention', label: 'Network Pings', desc: 'Alert when your designation is explicitly tagged.' },
            ].map(({ key, label, desc }) => (
              <label key={key} className="flex items-start gap-4 p-5 cursor-pointer transition-colors bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-black group">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 rounded-none border-gray-300 text-black focus:ring-black"
                  checked={!!(profile as any)[key]}
                  onChange={e => setProfile(p => p && ({ ...p, [key]: e.target.checked }))}
                />
                <div>
                  <p className="text-[14px] font-bold text-black transition-colors">{label}</p>
                  <p className="text-[12px] mt-1 text-gray-500 font-mono">{desc}</p>
                </div>
              </label>
            ))}
          </div>
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={saveProfile}
              disabled={saving}
              className="flex items-center justify-center gap-2 px-6 py-3 text-[11px] font-black uppercase tracking-[0.15em] transition-all disabled:opacity-50 bg-black text-white hover:bg-gray-800"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Update Triggers
            </button>
          </div>
        </Section>

        {/*  ADMIN SECTIONS  */}
        {isAdmin && (
          <>
            {/* SECTION 3: CATEGORIES */}
            <Section icon={<Tag size={16} />} title="Sector Management">
              <div className="flex flex-col gap-4">
                {categories.map(cat => (
                  <div key={cat.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-white border border-gray-200 hover:border-black transition-colors">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex flex-col gap-2 flex-1 min-w-0">
                        <input
                          className={inputCls + " text-[14px] font-bold py-2 px-3"}
                          value={cat.name}
                          placeholder="Sector designation"
                          onChange={e => setCategories(p => p.map(c => c.id === cat.id ? { ...c, name: e.target.value } : c))}
                        />
                        <input
                          className={inputCls + " text-[12px] py-2 px-3 opacity-80"}
                          value={cat.description}
                          placeholder="Parameters..."
                          onChange={e => setCategories(p => p.map(c => c.id === cat.id ? { ...c, description: e.target.value } : c))}
                        />
                      </div>
                      <div className="flex flex-col gap-1 w-16">
                         <span className="text-[9px] uppercase font-black text-gray-500 tracking-widest text-center">Index</span>
                        <input
                          type="number"
                          className={inputCls + " text-[12px] text-center p-2"}
                          value={cat.orderIndex}
                          onChange={e => setCategories(p => p.map(c => c.id === cat.id ? { ...c, orderIndex: Number(e.target.value) } : c))}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0 border-t border-gray-200 sm:border-0 mt-2 sm:mt-0">
                      <span className="text-[10px] font-mono text-gray-500 px-2 py-1 bg-gray-50 border border-gray-200">{cat._count?.topics ?? 0} Vol</span>
                      <button onClick={() => saveCategory(cat)} className="p-2.5 text-black border border-gray-300 hover:border-black hover:bg-gray-50 transition-all" title="Save Sector">
                        <Save size={16} />
                      </button>
                      <button onClick={() => deleteCategory(cat.id)} className="p-2.5 text-red-500 border border-red-200 hover:border-red-500 hover:bg-red-50 transition-all" title="Purge">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* New category form */}
              <div className="flex flex-col gap-4 p-5 border border-dashed border-gray-300 bg-gray-50 mt-4">
                <div className="flex items-center gap-2">
                   <Plus size={14} className="text-black" />
                   <p className="text-[11px] font-black uppercase tracking-[0.2em] text-black">Initialize New Sector</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Designation">
                    <input className={inputCls} value={newCat.name} placeholder="e.g. Protocol Upgrades" onChange={e => setNewCat(p => ({ ...p, name: e.target.value }))} />
                  </Field>
                  <Field label="Hash Slug">
                    <input className={inputCls} value={newCat.slug} placeholder="protocol-upgrades" onChange={e => setNewCat(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} />
                  </Field>
                </div>
                <Field label="Parameters">
                  <input className={inputCls} value={newCat.description} placeholder="Define sector scope..." onChange={e => setNewCat(p => ({ ...p, description: e.target.value }))} />
                </Field>
                <div className="flex items-center gap-6 mt-2">
                  <div className="flex items-center gap-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Priority</label>
                    <input type="number" className={inputCls + " w-20"} value={newCat.orderIndex} onChange={e => setNewCat(p => ({ ...p, orderIndex: Number(e.target.value) }))} />
                  </div>
                  <button
                    onClick={createCategory}
                    disabled={addingCat}
                    className="ml-auto flex items-center justify-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] transition-all disabled:opacity-50 bg-black text-white hover:bg-gray-800"
                  >
                    {addingCat ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    Execute
                  </button>
                </div>
              </div>
            </Section>

            {/* SECTION 4: MODERATION & GLOBAL */}
            {global && (
              <Section icon={<Settings size={16} />} title="Global Parameters">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field label="Nexus Identifier">
                    <input className={inputCls} value={global.siteName} onChange={e => setGlobal(p => p && ({ ...p, siteName: e.target.value }))} />
                  </Field>
                  <Field label="Security Protocol">
                    <div className="relative">
                      <select
                        className={`${inputCls} appearance-none pr-10 cursor-pointer`}
                        value={global.moderationMode}
                        onChange={e => setGlobal(p => p && ({ ...p, moderationMode: e.target.value }))}
                      >
                        <option value="OPEN">OPEN - Unrestricted Flow</option>
                        <option value="STRICT">STRICT - Review Required</option>
                        <option value="LOCKED">LOCKED - Broadcasts Halted</option>
                      </select>
                    </div>
                  </Field>
                </div>
                <Field label="MOTD (Message of the Day)">
                  <textarea
                    className={`${inputCls} resize-y min-h-[100px] font-mono`}
                    value={global.welcomeMessage}
                    onChange={e => setGlobal(p => p && ({ ...p, welcomeMessage: e.target.value }))}
                  />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field label="Bandwidth: Threads/Day">
                    <input type="number" className={inputCls} value={global.maxTopicsPerDay} onChange={e => setGlobal(p => p && ({ ...p, maxTopicsPerDay: Number(e.target.value) }))} />
                  </Field>
                  <Field label="Bandwidth: Replies/Day">
                    <input type="number" className={inputCls} value={global.maxPostsPerDay} onChange={e => setGlobal(p => p && ({ ...p, maxPostsPerDay: Number(e.target.value) }))} />
                  </Field>
                </div>
                <div className="flex flex-col gap-4 mt-2 p-5 bg-gray-50 border border-gray-200">
                  {[
                    { key: 'allowGuestRead', label: 'Enable read-only intercepts for unauthenticated nodes' },
                    { key: 'requireApproval', label: 'Require admin clearance for all new threads' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-4 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded-none border-gray-300 text-black focus:ring-black"
                        checked={!!(global as any)[key]}
                        onChange={e => setGlobal(p => p && ({ ...p, [key]: e.target.checked }))}
                      />
                      <span className="text-[13px] font-mono text-gray-600 group-hover:text-black transition-colors">{label}</span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button
                    onClick={saveGlobal}
                    className="flex items-center justify-center gap-2 px-6 py-3 text-[11px] font-black uppercase tracking-[0.15em] transition-all bg-black text-white hover:bg-gray-800"
                  >
                    <Save size={16} /> Deploy Global Rules
                  </button>
                </div>
              </Section>
            )}
          </>
        )}
      </div>
      
      <div className="lg:hidden w-full" style={{ height: 'calc(64px + env(safe-area-inset-bottom, 0px))' }} />
    </div>
  );
}
