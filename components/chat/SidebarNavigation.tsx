'use client';
import { useState } from 'react';
import { Folder, FolderLock, Inbox, Search, Settings } from 'lucide-react';

interface SidebarNavigationProps {
  onSelectFolder: (folder: string) => void;
  onOpenSettings: () => void;
  activeFolder: string;
}

export default function SidebarNavigation({ onSelectFolder, onOpenSettings, activeFolder }: SidebarNavigationProps) {
  const folders = [
    { id: 'all',    name: 'All Chats',  icon: Inbox },
    { id: 'secret', name: 'Secret ZK',  icon: FolderLock },
  ];

  return (
    <div className="w-[240px] transition-all duration-300 border-r border-black/6 bg-white flex flex-col items-start py-6 relative z-50 overflow-hidden shrink-0">
      <div className="px-4 w-full flex items-center justify-start mb-8 transition-all">
        <div className="w-10 h-10 rounded-2xl bg-black/[0.04] flex items-center justify-center border border-black/8 shrink-0">
          <Folder className="text-black/50" size={18} />
        </div>
        <span className="ml-4 font-mono text-[11px] font-bold tracking-widest text-black/40 whitespace-nowrap transition-opacity uppercase">
          Folders
        </span>
      </div>

      <div className="w-full px-3 mb-6 transition-opacity">
        <div className="bg-black/[0.03] rounded-xl flex items-center px-3 py-2 border border-black/8">
          <Search size={13} className="text-black/25 mr-2" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent border-none outline-none text-xs font-mono text-black placeholder:text-black/25 w-full"
          />
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col gap-1 px-3">
        {folders.map(folder => {
          const Icon = folder.icon;
          const isActive = activeFolder === folder.id;
          return (
            <button
              key={folder.id}
              onClick={() => onSelectFolder(folder.id)}
              className={`w-full flex items-center justify-start p-3 rounded-xl transition-all ${
                isActive ? 'bg-black text-white border border-black' : 'hover:bg-black/5 border border-transparent text-black/40 hover:text-black'
              }`}
            >
              <Icon size={18} />
              <span className={`ml-3 font-mono text-[11px] whitespace-nowrap transition-opacity font-bold uppercase tracking-wide ${isActive ? 'text-white' : ''}`}>
                {folder.name}
              </span>
            </button>
          );
        })}
      </div>


    </div>
  );
}
