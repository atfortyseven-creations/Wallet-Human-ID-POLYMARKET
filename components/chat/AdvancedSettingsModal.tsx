'use client';

import { useState } from 'react';

export type Theme = 'light' | 'dark' | 'midnight' | 'forest' | 'rose';
export type PrivacyMode = 'stealth' | 'standard' | 'institutional';
export type AutoDestructPreset = 'off' | '1m' | '1h' | '24h' | '7d';

export interface ChatSettings {
  theme: Theme;
  privacyMode: PrivacyMode;
  autoDestruct: AutoDestructPreset;
  showReadReceipts: boolean;
  textSize: number;
}

export const DEFAULT_SETTINGS: ChatSettings = {
  theme: 'light',
  privacyMode: 'standard',
  autoDestruct: 'off',
  showReadReceipts: true,
  textSize: 4,
};

interface AdvancedSettingsModalProps {
  onClose: () => void;
  settings: ChatSettings;
  onSettingsChange: (s: ChatSettings) => void;
}

export default function AdvancedSettingsModal({
  onClose, settings, onSettingsChange,
}: AdvancedSettingsModalProps) {
  const [tab, setTab] = useState<'general' | 'privacy' | 'appearance'>('general');

  const update = <K extends keyof ChatSettings>(key: K, val: ChatSettings[K]) =>
    onSettingsChange({ ...settings, [key]: val });

  const TABS = [
    { id: 'general', label: 'General' },
    { id: 'privacy', label: 'Privacy & Security' },
    { id: 'appearance', label: 'Appearance' },
  ] as const;

  return (
    <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-[700px] bg-[#f2f2f7] rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-black/10 shrink-0">
          <h2 className="font-sans text-[17px] font-semibold text-black tracking-tight">Settings</h2>
          <button onClick={onClose} className="text-[#007AFF] font-sans text-[17px] hover:opacity-80 transition-opacity">
            Done
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 min-h-0">
          {/* Sidebar */}
          <div className="w-[240px] bg-[#f2f2f7] border-r border-black/10 overflow-y-auto hidden md:block">
            <div className="p-4">
              <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                {TABS.map((t, idx) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`w-full text-left px-4 py-3 font-sans text-[15px] transition-colors relative flex items-center justify-between ${
                      idx !== TABS.length - 1 ? 'border-b border-black/5' : ''
                    } ${tab === t.id ? 'bg-[#007AFF]/10 text-[#007AFF] font-medium' : 'text-black hover:bg-black/5'}`}
                  >
                    {t.label}
                    {tab === t.id && (
                      <span className="text-[12px] opacity-60">&gt;</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Tab Selector (Fallback) */}
          <div className="md:hidden w-full bg-white px-4 py-2 border-b border-black/10 overflow-x-auto whitespace-nowrap hide-scrollbar flex gap-2 shrink-0">
             {TABS.map(t => (
               <button
                 key={t.id}
                 onClick={() => setTab(t.id)}
                 className={`px-3 py-1.5 rounded-full text-[13px] font-sans transition-all duration-200 active:scale-95 ${
                   tab === t.id ? 'bg-[#007AFF] text-white' : 'bg-[#f2f2f7] text-black'
                 }`}
               >
                 {t.label}
               </button>
             ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto bg-[#f2f2f7]">
            <div className="p-4 max-w-[400px] mx-auto space-y-6">

              {tab === 'general' && (
                <Section title="TEXT SIZE">
                  <div className="px-4 py-3">
                    <input 
                      type="range" min="1" max="7" 
                      value={settings.textSize} 
                      onChange={e => update('textSize', parseInt(e.target.value))}
                      className="w-full accent-[#007AFF]" 
                    />
                    <div className="flex justify-between text-[11px] text-[#8e8e93] mt-2 font-sans">
                      <span>Small</span><span>Large</span>
                    </div>
                  </div>
                </Section>
              )}

              {tab === 'privacy' && (
                <>
                  <Section title="PRIVACY MODE">
                    {(['stealth', 'standard', 'institutional'] as PrivacyMode[]).map((m, idx) => (
                      <ActionRow
                        key={m}
                        label={m.charAt(0).toUpperCase() + m.slice(1)}
                        onClick={() => update('privacyMode', m)}
                        rightText={settings.privacyMode === m ? '' : ''}
                        isLast={idx === 2}
                      />
                    ))}
                  </Section>

                  <Section title="MESSAGE CONTROLS">
                    <ToggleRow label="Show Read Receipts" value={settings.showReadReceipts} onChange={v => update('showReadReceipts', v)} isLast />
                  </Section>

                  <Section title="AUTO-DESTRUCT TIMER" footer="Messages will automatically disappear after the selected duration.">
                    <div className="flex gap-2 flex-wrap px-4 py-3">
                      {[
                        { value: 'off', label: 'Off' }, { value: '1m', label: '1 min' },
                        { value: '1h', label: '1 hour' }, { value: '24h', label: '24 hrs' }, { value: '7d', label: '7 days' }
                      ].map(o => (
                        <button
                          key={o.value}
                          onClick={() => update('autoDestruct', o.value as AutoDestructPreset)}
                          className={`px-3 py-1.5 rounded-full text-[13px] font-sans transition-colors ${
                            settings.autoDestruct === o.value
                              ? 'bg-[#007AFF] text-white'
                              : 'bg-black/5 text-black hover:bg-black/10'
                          }`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </Section>
                </>
              )}

              {tab === 'appearance' && (
                <Section title="COLOR THEME">
                  {(['light', 'dark', 'midnight', 'forest', 'rose'] as Theme[]).map((t, idx) => (
                    <ActionRow
                      key={t}
                      label={t.charAt(0).toUpperCase() + t.slice(1)}
                      onClick={() => update('theme', t)}
                      rightText={settings.theme === t ? '' : ''}
                      isLast={idx === 4}
                    />
                  ))}
                </Section>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children, footer }: { title: string; children: React.ReactNode; footer?: string }) {
  return (
    <div className="mb-6">
      <div className="px-4 mb-1.5 font-sans text-[12px] text-[#8e8e93] uppercase tracking-wide">
        {title}
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-black/5">
        {children}
      </div>
      {footer && (
        <div className="px-4 mt-1.5 font-sans text-[12px] text-[#8e8e93] leading-snug">
          {footer}
        </div>
      )}
    </div>
  );
}

function ToggleRow({ label, value, onChange, isLast }: { label: string; value: boolean; onChange: (v: boolean) => void; isLast?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-4 py-3 bg-white ${!isLast ? 'border-b border-black/5' : ''}`}>
      <span className="font-sans text-[15px] text-black">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-[26px] rounded-full transition-colors relative ${value ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'}`}
      >
        <div className={`absolute top-[2px] w-[22px] h-[22px] rounded-full bg-white shadow-sm transition-transform duration-200 ${value ? 'translate-x-[20px]' : 'translate-x-[2px]'}`} />
      </button>
    </div>
  );
}

function ActionRow({ label, onClick, rightText, className, isLast }: { label: string; onClick: () => void; rightText?: string; className?: string; isLast?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 bg-white text-left transition-colors hover:bg-black/[0.02] active:bg-black/5 ${!isLast ? 'border-b border-black/5' : ''} ${className || 'text-black'}`}
    >
      <span className="font-sans text-[15px]">{label}</span>
      {rightText && (
        <span className="font-sans text-[15px] text-[#8e8e93]">{rightText}</span>
      )}
    </button>
  );
}
