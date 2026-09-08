import React, { useEffect, useState } from 'react';
import { Users, Plus, MessageCircle } from 'lucide-react';
import { SyndicateModal } from './SyndicateModal';

interface SyndicateListProps {
  client: any;
  onSelectConversation: (conversation: any) => void;
  activeConversationId?: string;
}

export function SyndicateList({ client, onSelectConversation, activeConversationId }: SyndicateListProps) {
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = async () => {
    if (!client) return;
    setIsLoading(true);
    setError(null);
    try {
      const allGroups = await client.conversations.listGroups();
      setGroups(allGroups);
    } catch (err: any) {
      console.error('Failed to fetch groups:', err);
      setError('Failed to load syndicates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [client]);

  return (
    <div className="flex flex-col h-full bg-white border-r border-black/5">
      <div className="flex items-center justify-between p-4 border-b border-black/5">
        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Syndicates
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="p-2 text-white transition-colors bg-black rounded-full hover:bg-gray-800 shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 text-sm text-center text-red-500 bg-red-50 rounded-2xl m-2">
            {error}
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
            <MessageCircle className="w-12 h-12 mb-3 text-gray-200" />
            <p className="font-medium">No syndicates yet</p>
            <p className="text-sm">Create one to start chatting</p>
          </div>
        ) : (
          groups.map((group) => (
            <button
              key={group.id}
              onClick={() => onSelectConversation(group)}
              className={`w-full flex items-center gap-3 p-3 transition-all rounded-2xl text-left ${
                activeConversationId === group.id
                  ? 'bg-black text-white'
                  : 'hover:bg-gray-50 text-gray-900'
              }`}
            >
              <div className={`flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0 ${
                activeConversationId === group.id ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                <Users className={`w-6 h-6 ${
                  activeConversationId === group.id ? 'text-white' : 'text-gray-500'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold truncate">
                    {group.name || 'Unnamed Syndicate'}
                  </h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    activeConversationId === group.id ? 'bg-white/20' : 'bg-gray-100'
                  }`}>
                    {group.memberCount || 0}
                  </span>
                </div>
                <p className={`text-sm truncate ${
                  activeConversationId === group.id ? 'text-white/70' : 'text-gray-500'
                }`}>
                  {group.description || 'No description'}
                </p>
              </div>
            </button>
          ))
        )}
      </div>

      <SyndicateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        client={client}
        onGroupCreated={(group) => {
          setGroups([group, ...groups]);
        }}
      />
    </div>
  );
}