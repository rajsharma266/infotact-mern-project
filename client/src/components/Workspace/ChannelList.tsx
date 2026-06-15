import { useState } from 'react';
import type { Channel, User } from '../../types';
import { Plus, Hash, Lock, ChevronDown, ChevronRight } from 'lucide-react';

interface ChannelListProps {
  channels: Channel[];
  activeChannelId: string;
  onSelectChannel: (id: string) => void;
  onCreateChannel: (name: string, desc: string, isPrivate: boolean) => void;
  onCreateDM: (recipientId: string) => void;
  users: User[];
  currentUser: User;
}

function ChannelList({
  channels,
  activeChannelId,
  onSelectChannel,
  onCreateChannel,
  onCreateDM,
  users,
  currentUser,
}: ChannelListProps) {
  const [channelsCollapsed, setChannelsCollapsed] = useState(false);
  const [dmsCollapsed, setDmsCollapsed] = useState(false);
  
  // Modal states
  const [showChanModal, setShowChanModal] = useState(false);
  const [showDMModal, setShowDMModal] = useState(false);

  // Form states
  const [chanName, setChanName] = useState('');
  const [chanDesc, setChanDesc] = useState('');
  const [chanPrivate, setChanPrivate] = useState(false);

  // Filter channels & DMs
  const textChannels = channels.filter(c => c.type === 'channel');
  const dmChannels = channels.filter(c => c.type === 'dm');

  const handleCreateChannelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chanName.trim()) return;
    onCreateChannel(chanName, chanDesc, chanPrivate);
    setChanName('');
    setChanDesc('');
    setChanPrivate(false);
    setShowChanModal(false);
  };

  const handleSelectDMUser = (userId: string) => {
    onCreateDM(userId);
    setShowDMModal(false);
  };

  return (
    <div className="flex flex-col gap-4 text-left px-2 select-none">
      
      {/* 1. CHANNELS HEADER */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between text-slate-400 hover:text-slate-200 px-2 py-1.5 rounded-lg group">
          <button 
            onClick={() => setChannelsCollapsed(!channelsCollapsed)}
            className="flex items-center gap-1 cursor-pointer font-bold text-xs uppercase tracking-wider text-left flex-1"
          >
            {channelsCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
            <span>Channels</span>
          </button>
          
          <button 
            onClick={() => setShowChanModal(true)}
            className="opacity-0 group-hover:opacity-100 hover:bg-slate-800 p-0.5 rounded cursor-pointer transition"
            title="Create Channel"
          >
            <Plus size={14} className="text-slate-400" />
          </button>
        </div>

        {/* Channels List */}
        {!channelsCollapsed && (
          <div className="flex flex-col mt-0.5 space-y-0.5">
            {textChannels.map(channel => {
              const isActive = channel.id === activeChannelId;
              return (
                <div
                  key={channel.id}
                  onClick={() => onSelectChannel(channel.id)}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-150 ${
                    isActive 
                      ? 'bg-indigo-600 text-white font-semibold' 
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate min-w-0">
                    {channel.isPrivate ? (
                      <Lock size={13} className={isActive ? 'text-white' : 'text-slate-500'} />
                    ) : (
                      <Hash size={13} className={isActive ? 'text-white' : 'text-slate-500'} />
                    )}
                    <span className="text-sm truncate">{channel.name}</span>
                  </div>
                </div>
              );
            })}
            
            {textChannels.length === 0 && (
              <span className="text-[11px] text-slate-500 pl-7 py-2">No channels configured</span>
            )}
          </div>
        )}
      </div>

      {/* 2. DIRECT MESSAGES HEADER */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between text-slate-400 hover:text-slate-200 px-2 py-1.5 rounded-lg group">
          <button 
            onClick={() => setDmsCollapsed(!dmsCollapsed)}
            className="flex items-center gap-1 cursor-pointer font-bold text-xs uppercase tracking-wider text-left flex-1"
          >
            {dmsCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
            <span>Direct Messages</span>
          </button>
          
          <button 
            onClick={() => setShowDMModal(true)}
            className="opacity-0 group-hover:opacity-100 hover:bg-slate-800 p-0.5 rounded cursor-pointer transition"
            title="New Direct Message"
          >
            <Plus size={14} className="text-slate-400" />
          </button>
        </div>

        {/* DMs List */}
        {!dmsCollapsed && (
          <div className="flex flex-col mt-0.5 space-y-0.5">
            {dmChannels.map(dm => {
              const isActive = dm.id === activeChannelId;
              const recipient = users.find(u => u.id === dm.recipientId);
              if (!recipient) return null;
              
              // Status color helper
              const statusColors = {
                online: 'bg-emerald-500',
                away: 'bg-amber-500',
                offline: 'bg-slate-500',
              };

              return (
                <div
                  key={dm.id}
                  onClick={() => onSelectChannel(dm.id)}
                  className={`flex items-center px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-150 ${
                    isActive 
                      ? 'bg-indigo-600 text-white font-semibold' 
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate min-w-0 w-full">
                    {/* DM Avatar with status badge */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-5 h-5 rounded-md text-[9px] font-bold flex items-center justify-center border ${
                        isActive 
                          ? 'bg-indigo-500 border-indigo-400 text-white' 
                          : 'bg-slate-800 border-slate-700 text-indigo-300'
                      }`}>
                        {recipient.avatar}
                      </div>
                      <span className={`absolute bottom-[-2px] right-[-2px] w-2 h-2 rounded-full border border-slate-900 ${
                        statusColors[recipient.status]
                      }`} />
                    </div>

                    <span className="text-sm truncate">{recipient.name}</span>
                  </div>
                </div>
              );
            })}

            {dmChannels.length === 0 && (
              <span className="text-[11px] text-slate-500 pl-7 py-2">No active direct messages</span>
            )}
          </div>
        )}
      </div>

      {/* CREATE CHANNEL MODAL */}
      {showChanModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative text-left">
            <h3 className="text-base font-bold text-white mb-1.5">Create Channel</h3>
            <p className="text-xs text-slate-400 mb-4">
              Channels are topics team members converse in.
            </p>

            <form onSubmit={handleCreateChannelSubmit} className="space-y-4.5">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Name</label>
                <input 
                  type="text"
                  placeholder="e.g. backend-redis-sync"
                  value={chanName}
                  onChange={(e) => setChanName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Description (Optional)</label>
                <input 
                  type="text"
                  placeholder="e.g. scale sync configs"
                  value={chanDesc}
                  onChange={(e) => setChanDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <div>
                  <div className="text-xs font-bold text-slate-200">Make Private</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Only invited members can view</div>
                </div>
                
                <button 
                  type="button"
                  onClick={() => setChanPrivate(!chanPrivate)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer relative ${
                    chanPrivate ? 'bg-indigo-600' : 'bg-slate-800'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow ${
                    chanPrivate ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800/60">
                <button 
                  type="button"
                  onClick={() => setShowChanModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW DIRECT MESSAGE SELECTOR MODAL */}
      {showDMModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 w-full max-w-sm shadow-2xl relative text-left">
            <h3 className="text-base font-bold text-white mb-1">Direct Messages</h3>
            <p className="text-xs text-slate-400 mb-4">
              Select a member of the workspace to start messaging.
            </p>

            <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
              {users
                .filter(u => u.id !== currentUser.id)
                .map(u => (
                  <div 
                    key={u.id}
                    onClick={() => handleSelectDMUser(u.id)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/60 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 text-indigo-300 text-xs font-extrabold flex items-center justify-center">
                        {u.avatar}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">
                          {u.name}
                        </div>
                        <div className="text-[9px] text-slate-500 uppercase font-semibold">{u.status}</div>
                      </div>
                    </div>
                    
                    <ChevronRight size={14} className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition" />
                  </div>
                ))}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-800/60 mt-4">
              <button 
                type="button"
                onClick={() => setShowDMModal(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ChannelList;