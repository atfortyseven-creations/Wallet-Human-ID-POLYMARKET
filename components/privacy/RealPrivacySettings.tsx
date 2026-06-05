"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSystemAccount } from "@/hooks/useSystemAccount";
import { Shield, Lock, Eye, Download, Key } from "lucide-react";

export function RealPrivacySettings() {
  const { connector, isConnected } = useSystemAccount();
  const userId = connector?.id || "guest-session";

  const [profile, setProfile] = useState<any>({
    logLevel: "MEDIUM",
    dataSharing: true,
    sessionAutoLogout: "1h",
    ipWhitelist: [],
    twoFAEnabled: false,
    systemVisibility: "Public",
    exportEncryption: false,
  });
  
  const [ipInput, setIpInput] = useState("");

  useEffect(() => {
    if (!userId || userId === 'guest-session') return;
    fetch(`/api/privacy/settings?userId=${encodeURIComponent(userId)}`)
      .then(r => r.ok ? r.json() : null)
      .then(res => { if (res?.success && res.profile) setProfile(res.profile); })
      .catch(() => {});
  }, [userId]);

  const handleUpdate = async (field: string, value: any) => {
    // Optimistic update
    setProfile((prev: any) => ({ ...prev, [field]: value }));

    const promise = fetch('/api/privacy/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, field, value }),
    }).then(async r => {
      if (!r.ok) throw new Error(await r.text());
    });

    toast.promise(promise, {
      loading: 'Saving system protocol...',
      success: 'Privacy setting enforced across nodes.',
      error:   'Failed to synchronize setting.',
    });
  };

  const addIp = () => {
    if (!ipInput) return;
    const newList = [...profile.ipWhitelist, ipInput];
    handleUpdate("ipWhitelist", newList);
    setIpInput("");
  };

  const removeIp = (ip: string) => {
    const newList = profile.ipWhitelist.filter((i: string) => i !== ip);
    handleUpdate("ipWhitelist", newList);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      
      <div className="p-4 bg-[#00f5ff]/5 border border-[#00f5ff]/20 rounded-xl flex items-start gap-4">
         <Shield className="text-[#00f5ff] shrink-0 mt-1" />
         <div>
            <h4 className="text-[#00f5ff] font-bold text-sm uppercase tracking-widest">System Privacy Active</h4>
            <p className="text-xs text-[#00f5ff]/60 mt-1">Changes made here are permanently recorded on the Event Ledger and reflect immediately across all active sessions.</p>
         </div>
      </div>

      <div className="space-y-4">
        {/* Log Session Level */}
        <div className="p-4 rounded-xl hover:bg-white/5 border border-white/5 transition-colors group">
          <div className="flex justify-between items-center mb-3">
             <div>
                <h4 className="text-white text-sm font-medium">Log Session Level</h4>
                <p className="text-xs text-gray-500">Determine verbosity of recorded sessions.</p>
             </div>
          </div>
          <select 
             value={profile.logLevel} 
             onChange={e => handleUpdate("logLevel", e.target.value)}
             className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-[#00f5ff] outline-none text-xs"
          >
             <option value="LOW">Low (Logins & Transfers only)</option>
             <option value="MEDIUM">Medium (Default - Page views)</option>
             <option value="FULL">Full (Strict tracking & full payload)</option>
          </select>
        </div>

        {/* Data Sharing Toggle */}
        <ToggleItem 
          title="Data Sharing with On-Chain Analytics" 
          description="Allow usage patterns to train System Global Analytics." 
          active={profile.dataSharing} 
          onClick={() => handleUpdate("dataSharing", !profile.dataSharing)} 
        />

        {/* Session Auto-Logout */}
        <div className="p-4 rounded-xl hover:bg-white/5 border border-white/5 transition-colors group">
          <div className="flex justify-between items-center mb-3">
             <div>
                <h4 className="text-white text-sm font-medium">Session Auto-Logout</h4>
                <p className="text-xs text-gray-500">Eject session after inactivity.</p>
             </div>
          </div>
          <select 
             value={profile.sessionAutoLogout} 
             onChange={e => handleUpdate("sessionAutoLogout", e.target.value)}
             className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-[#00f5ff] outline-none text-xs"
          >
             <option value="15min">15 Minutes (Maximum Security)</option>
             <option value="1h">1 Hour</option>
             <option value="4h">4 Hours</option>
             <option value="never">Never (Not Recommended)</option>
          </select>
        </div>

        {/* IP Whitelisting */}
        <div className="p-4 rounded-xl hover:bg-white/5 border border-white/5 transition-colors group">
          <div className="flex justify-between items-center mb-3">
             <div>
                <h4 className="text-white text-sm font-medium">IP Whitelisting</h4>
                <p className="text-xs text-gray-500">Lock KYC to these IPs only.</p>
             </div>
          </div>
          <div className="flex gap-2">
             <input 
               value={ipInput} 
               onChange={e => setIpInput(e.target.value)} 
               placeholder="192.168.1.1" 
               className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 text-white outline-none font-mono text-xs" 
             />
             <button onClick={addIp} className="px-4 bg-[#00f5ff]/10 text-[#00f5ff] border border-[#00f5ff]/30 rounded-lg text-xs font-bold hover:bg-[#00f5ff]/20 transition-colors">Add</button>
          </div>
          {profile.ipWhitelist.length > 0 && (
             <div className="flex flex-wrap gap-2 mt-3">
               {profile.ipWhitelist.map((ip: string) => (
                  <span key={ip} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-white flex items-center gap-2">
                    {ip}
                    <button onClick={() => removeIp(ip)} className="text-red-400 hover:text-red-300">×</button>
                  </span>
               ))}
             </div>
          )}
        </div>

        {/* 2FA Enforcement */}
        <ToggleItem 
          title="2FA Enforcement" 
          description="Require hardware key or authenticator for all mutations." 
          active={profile.twoFAEnabled} 
          onClick={() => handleUpdate("twoFAEnabled", !profile.twoFAEnabled)} 
        />

        {/* Visibility */}
        <div className="p-4 rounded-xl hover:bg-white/5 border border-white/5 transition-colors group">
          <div className="flex justify-between items-center mb-3">
             <div>
                <h4 className="text-white text-sm font-medium">KYC Visibility</h4>
                <p className="text-xs text-gray-500">How your wallets appear in peer discovery.</p>
             </div>
          </div>
          <select 
             value={profile.systemVisibility} 
             onChange={e => handleUpdate("systemVisibility", e.target.value)}
             className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-[#00f5ff] outline-none text-xs"
          >
             <option value="Public">Public (Visible in Whale Network)</option>
             <option value="Trusted Only">Trusted Only (Contacts)</option>
             <option value="Private">Private (Cloaked)</option>
          </select>
        </div>

        {/* Export Encryption */}
        <ToggleItem 
          title="Export Logs AES-256 Encryption" 
          description="Encrypt local CSV exports of session logs with keys." 
          active={profile.exportEncryption} 
          onClick={() => handleUpdate("exportEncryption", !profile.exportEncryption)} 
        />

      </div>
    </div>
  );
}

// Utility Toggle Item reused here
function ToggleItem({ title, description, active, onClick }: { title: string, description: string, active: boolean, onClick: () => void }) {
    return (
        <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/5 transition-colors cursor-pointer group" onClick={onClick}>
            <div>
                <h4 className="text-white text-sm font-medium mb-1 group-hover:text-[#00f5ff] transition-colors flex items-center gap-2">
                   {title}
                </h4>
                <p className="text-xs text-gray-500 max-w-[80%]">{description}</p>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 border ${active ? 'bg-[#00f5ff]/20 border-[#00f5ff]' : 'bg-black/50 border-white/10'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full shadow-md transition-all duration-300 ${active ? 'left-7 bg-[#00f5ff]' : 'left-1 bg-white/40'}`} />
            </div>
        </div>
    );
}
