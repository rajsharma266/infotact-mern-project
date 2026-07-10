import { useState } from 'react';
import type { Channel, User } from '../../types';
import ChannelList from './ChannelList';
import { Mic, MicOff, Headphones, LogOut, ChevronDown, Search, UserPlus, Copy, Check } from 'lucide-react';

interface ChannelPanelProps {
  workspaceId: string;
  workspaceName: string;
  channels: Channel[];
  activeChannelId: string;
  onSelectChannel: (id: string) => void;
  onCreateChannel: (name: string, desc: string, isPrivate: boolean) => void | Promise<void>;
  onCreateDM: (recipientId: string) => void;
  users: User[];
  currentUser: User;
  onGoToDashboard: () => void;
  unreadCounts?: Record<string, number>;
  onJoinChannel?: (id: string) => void;
  onLeaveWorkspace?: (workspaceId: string) => void;
}

function ChannelPanel({
  workspaceId,
  workspaceName,
  channels,
  activeChannelId,
  onSelectChannel,
  onCreateChannel,
  onCreateDM,
  users,
  currentUser,
  onGoToDashboard,
  unreadCounts,
  onJoinChannel,
  onLeaveWorkspace,
}: ChannelPanelProps) {
  const [micActive, setMicActive] = useState<boolean>(true);
  const [soundActive, setSoundActive] = useState<boolean>(true);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [showLeaveWsModal, setShowLeaveWsModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredChannels = channels.filter(channel => {
    if (channel.type === 'channel') {
      return channel.name.toLowerCase().includes(searchQuery.toLowerCase());
    } else if (channel.type === 'dm') {
      const recipient = users.find(u => u.id === channel.recipientId);
      return recipient ? recipient.name.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    }
    return false;
  });

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col h-full select-none">
      
      {/* Workspace Header Dropdown */}
      <div 
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-4 border-b border-slate-800 flex items-center justify-between hover:bg-slate-800/20 cursor-pointer group transition duration-200 relative"
      >
        <div className="text-left min-w-0">
          <h2 className="text-sm font-bold text-slate-100 truncate group-hover:text-indigo-400 transition-colors">
            {workspaceName}
          </h2>
          <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            Active Session
          </div>
        </div>
        <ChevronDown size={16} className={`text-slate-400 group-hover:text-slate-200 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute top-16 left-4 right-4 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50 animate-[fadeIn_0.15s_ease-out] text-left">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowInviteModal(true);
                setShowDropdown(false);
              }}
              className="w-full px-3 py-2 text-xs font-semibold text-indigo-400 hover:bg-slate-800/60 flex items-center gap-2 transition cursor-pointer"
            >
              <UserPlus size={14} />
              Invite People
            </button>
            <div className="h-[1px] bg-slate-800/80 my-1" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onGoToDashboard();
              }}
              className="w-full px-3 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800/60 flex items-center gap-2 transition cursor-pointer"
            >
              <LogOut size={14} />
              Exit Workspace
            </button>
            <div className="h-[1px] bg-slate-800/80 my-1" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowLeaveWsModal(true);
                setShowDropdown(false);
              }}
              className="w-full px-3 py-2 text-xs font-semibold text-red-400 hover:bg-slate-800/60 flex items-center gap-2 transition cursor-pointer"
            >
              <LogOut size={14} />
              Leave Workspace
            </button>
          </div>
        )}
      </div>

      {/* Workspace Search (simulated) */}
      <div className="p-3">
        <div className="relative flex items-center justify-between bg-slate-950/80 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-500">
          <div className="flex items-center flex-1 min-w-0">
            <Search size={12} className="mr-1.5 shrink-0" />
            <input 
              type="text" 
              placeholder="Jump to..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:outline-none w-full text-slate-300"
            />
          </div>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')} 
              className="text-slate-500 hover:text-slate-300 cursor-pointer pl-1 shrink-0"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main lists (Channels and DMs) */}
      <div className="flex-1 overflow-y-auto">
        <ChannelList
          channels={filteredChannels}
          activeChannelId={activeChannelId}
          onSelectChannel={onSelectChannel}
          onCreateChannel={onCreateChannel}
          onCreateDM={onCreateDM}
          users={users}
          currentUser={currentUser}
          unreadCounts={unreadCounts}
          onJoinChannel={onJoinChannel}
        />
      </div>

      {/* Current User Profile Action Bar */}
      <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
        
        {/* User Card */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/25 border border-indigo-500/40 text-indigo-200 font-bold text-xs flex items-center justify-center">
              {currentUser.avatar}
            </div>
            {/* status indicator dot */}
            <span className="absolute bottom-[-2px] right-[-2px] w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
          </div>
          <div className="text-left min-w-0">
            <div className="text-xs font-bold text-slate-200 truncate leading-tight">{currentUser.name}</div>
            <div className="text-[9px] text-slate-500 font-semibold tracking-wide uppercase">Active</div>
          </div>
        </div>

        {/* Audio/Access Controls */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <button 
            onClick={() => setMicActive(!micActive)}
            className={`p-1.5 rounded-md cursor-pointer transition ${
              micActive ? 'hover:bg-slate-800 hover:text-slate-200' : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
            title={micActive ? 'Mute' : 'Unmute'}
          >
            {micActive ? <Mic size={14} /> : <MicOff size={14} />}
          </button>
          
          <button 
            onClick={() => setSoundActive(!soundActive)}
            className={`p-1.5 rounded-md cursor-pointer transition ${
              soundActive ? 'hover:bg-slate-800 hover:text-slate-200' : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
            title={soundActive ? 'Deafen' : 'Undeafen'}
          >
            {soundActive ? <Headphones size={14} /> : <Headphones size={14} className="opacity-40" />}
          </button>

          <button 
            onClick={onGoToDashboard}
            className="p-1.5 rounded-md hover:bg-slate-800 hover:text-slate-200 cursor-pointer transition"
            title="Return to Dashboard Launcher"
          >
            <LogOut size={14} />
          </button>
        </div>

      </div>

      {/* INVITE TO WORKSPACE MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative text-left">
            <h3 className="text-base font-bold text-white mb-1.5">Invite to {workspaceName}</h3>
            <p className="text-xs text-slate-400 mb-4">
              Share this link with others to invite them to this workspace.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Invitation Link</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    readOnly
                    value={`${window.location.origin}/workspace/${workspaceId}`}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition select-all"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/workspace/${workspaceId}`);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition flex items-center justify-center shrink-0 cursor-pointer"
                    title="Copy Link"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
                {copied && (
                  <p className="text-[10px] text-emerald-400 mt-1 font-semibold">
                    Link copied to clipboard!
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800/60">
                <button 
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-slate-850 hover:bg-slate-800 text-slate-200 rounded-xl transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LEAVE WORKSPACE CONFIRMATION MODAL */}
      {showLeaveWsModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative text-left">
            <h3 className="text-base font-bold text-white mb-1.5">Leave {workspaceName}</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Are you sure you want to leave this workspace? You will lose access to all its channels and direct messages. You will need a new invitation link to join back.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800/60">
              <button 
                type="button"
                onClick={() => setShowLeaveWsModal(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={() => {
                  if (onLeaveWorkspace) {
                    onLeaveWorkspace(workspaceId);
                  }
                  setShowLeaveWsModal(false);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-500 text-white rounded-xl transition cursor-pointer"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ChannelPanel;
