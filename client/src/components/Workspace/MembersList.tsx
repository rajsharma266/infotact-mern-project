import { useState } from 'react';
import type { User } from '../../types';
import { X, Hash, Lock, Search, ShieldCheck, UserPlus } from 'lucide-react';

interface MembersListProps {
  channelId: string;
  channelName: string;
  channelDescription: string;
  isPrivate: boolean;
  type: 'channel' | 'dm';
  users: User[];
  allWorkspaceUsers: User[];
  onClose: () => void;
  onInviteToChannel?: (channelId: string, userId: string) => void;
}

function MembersList({
  channelId,
  channelName,
  channelDescription,
  isPrivate,
  type,
  users,
  allWorkspaceUsers,
  onClose,
  onInviteToChannel,
}: MembersListProps) {
  const [search, setSearch] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteSearch, setInviteSearch] = useState('');
  const isDM = type === 'dm';

  // Filter members based on search
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800/80 text-left select-none overflow-hidden select-text">
      
      {/* 1. HEADER */}
      <div className="h-16 border-b border-slate-850 px-4 flex items-center justify-between bg-slate-950/30 select-none">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
          Details Panel
        </h3>
        
        <button 
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-200 cursor-pointer transition"
          title="Close details"
        >
          <X size={16} />
        </button>
      </div>

      {/* 2. BODY CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* About Card */}
        <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500">About</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {type}
            </span>
          </div>

          <div>
            <div className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              {isDM ? (
                'Direct Conversation'
              ) : isPrivate ? (
                <>
                  <Lock size={13} className="text-amber-500" />
                  <span>#{channelName}</span>
                </>
              ) : (
                <>
                  <Hash size={13} className="text-slate-400" />
                  <span>#{channelName}</span>
                </>
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mt-1.5">
              {channelDescription || 'No description provided.'}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-850 text-[10px] text-slate-500 font-semibold space-y-1">
            <div>Created: June 13, 2026</div>
            <div>Creator: system-admin</div>
          </div>
        </div>

        {/* Members List section */}
        <div className="space-y-3 flex flex-col">
          <div className="flex items-center justify-between text-xs uppercase font-extrabold tracking-wider text-slate-500 px-1 select-none">
            <span>{isDM ? 'Participants' : `Members (${users.length})`}</span>
            {!isDM && (
              <button 
                type="button"
                onClick={() => setShowInviteModal(true)}
                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition cursor-pointer flex items-center gap-1 normal-case"
              >
                <UserPlus size={12} />
                Add People
              </button>
            )}
          </div>

          {/* Search box */}
          <div className="relative flex items-center bg-slate-950/80 border border-slate-850 rounded-xl px-3.5 py-2 text-xs select-none">
            <Search size={13} className="mr-2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search members..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none focus:outline-none w-full text-slate-300 placeholder-slate-500"
            />
          </div>

          {/* Members Scroll list */}
          <div className="space-y-1 overflow-y-auto max-h-[35vh] pr-1">
            {filteredUsers.map(user => {
              const statusColors = {
                online: 'bg-emerald-500',
                away: 'bg-amber-500',
                offline: 'bg-slate-500',
              };

              return (
                <div key={user.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-950/30 transition">
                  <div className="flex items-center gap-3 min-w-0">
                    
                    {/* User avatar status */}
                    <div className="relative flex-shrink-0 select-none">
                      <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-850 text-indigo-300 font-bold text-xs flex items-center justify-center">
                        {user.avatar}
                      </div>
                      <span className={`absolute bottom-[-1.5px] right-[-1.5px] w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                        statusColors[user.status]
                      }`} />
                    </div>

                    <div className="text-left min-w-0">
                      <div className="text-xs font-bold text-slate-200 truncate">{user.name}</div>
                      <div className="text-[9px] text-slate-500 capitalize">{user.status}</div>
                    </div>

                  </div>

                  {/* Shield badge for roles */}
                  <div className="select-none flex-shrink-0">
                    {user.role === 'Admin' ? (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-2 py-0.5 rounded-full">
                        <ShieldCheck size={10} />
                        Admin
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-slate-500 bg-slate-950/60 border border-slate-850 px-2 py-0.5 rounded-full">
                        Member
                      </span>
                    )}
                  </div>

                </div>
              );
            })}

            {filteredUsers.length === 0 && (
              <span className="text-xs text-slate-500 block py-4 text-center">No members found</span>
            )}
          </div>
        </div>

      </div>

      {/* INVITE TO CHANNEL MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative text-left animate-[scaleIn_0.2s_ease-out]">
            <h3 className="text-base font-bold text-white mb-1.5">Add People</h3>
            <p className="text-xs text-slate-400 mb-4">
              Add members of this workspace to <span className="text-indigo-400 font-bold">#{channelName}</span>.
            </p>

            <div className="mb-4">
              <input 
                type="text" 
                placeholder="Search workspace members..." 
                value={inviteSearch}
                onChange={(e) => setInviteSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
              {allWorkspaceUsers
                .filter(u => !users.some(member => member.id === u.id)) // Non-members only
                .filter(u => u.name.toLowerCase().includes(inviteSearch.toLowerCase()))
                .map(u => (
                  <div 
                    key={u.id}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/40 transition group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-850 text-indigo-300 text-xs font-extrabold flex items-center justify-center">
                        {u.avatar}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 transition-colors truncate">
                          {u.name}
                        </div>
                        <div className="text-[9px] text-slate-500 uppercase font-semibold">{u.status}</div>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        if (onInviteToChannel) {
                          onInviteToChannel(channelId, u.id);
                        }
                      }}
                      className="px-3 py-1.5 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                ))}

              {allWorkspaceUsers
                .filter(u => !users.some(member => member.id === u.id))
                .filter(u => u.name.toLowerCase().includes(inviteSearch.toLowerCase())).length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500 font-semibold">
                  All workspace members are in this channel.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-800/60 mt-4">
              <button 
                type="button"
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteSearch('');
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default MembersList;
