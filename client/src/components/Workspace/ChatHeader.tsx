import { useState } from 'react';
import type { User } from '../../types';
import { Hash, Lock, Search, Menu, Info, X, Sun, Moon, Pin, MoreVertical, LogOut } from 'lucide-react';

interface ChatHeaderProps {
  channelId: string | undefined;
  channelName: string | undefined;
  channelDescription: string | undefined;
  isPrivate: boolean | undefined;
  type: 'channel' | 'dm' | undefined;
  toggleMembersList: () => void;
  showMembersList: boolean;
  toggleProfilePanel: () => void;
  showProfilePanel: boolean;
  togglePinnedPanel: () => void;
  showPinnedPanel: boolean;
  toggleMobileSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  currentUser?: User;
  onLeaveChannel?: (channelId: string) => void;
}

function ChatHeader({
  channelId,
  channelName,
  channelDescription,
  isPrivate,
  type,
  toggleMembersList,
  showMembersList,
  toggleProfilePanel,
  showProfilePanel,
  togglePinnedPanel,
  showPinnedPanel,
  toggleMobileSidebar,
  searchQuery,
  setSearchQuery,
  theme,
  onToggleTheme,
  currentUser,
  onLeaveChannel,
}: ChatHeaderProps) {
  const [showSettingsDropdown, setShowSettingsDropdown] = useState<boolean>(false);
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);

  if (!channelName) {
    return (
      <div className="h-16 border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between bg-slate-900/40 select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobileSidebar}
            className="md:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-bold text-slate-400">Collaboration Workspace</span>
        </div>
      </div>
    );
  }

  const isDM = type === 'dm';

  return (
    <div className="h-16 border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between bg-slate-900/40 select-none z-10 shrink-0">

      {/* Left side: Channel details */}
      <div className="flex items-center gap-3 min-w-0">

        {/* Mobile Hamburger toggle */}
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer transition flex-shrink-0"
          title="Open Side Menu"
        >
          <Menu size={20} />
        </button>

        {/* Icon based on channel privacy type */}
        <div className="text-slate-400 flex-shrink-0">
          {isDM ? (
            <div className="w-5 h-5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[9px] font-black flex items-center justify-center">
              DM
            </div>
          ) : isPrivate ? (
            <Lock size={16} className="text-amber-500/80" />
          ) : (
            <Hash size={18} className="text-slate-500" />
          )}
        </div>

        {/* Name and Topic/Description */}
        <div className="text-left min-w-0">
          <h2 className="text-sm md:text-base font-bold text-slate-100 truncate leading-tight">
            {channelName}
          </h2>
          <p className="text-[10px] md:text-xs text-slate-400 truncate mt-0.5 max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-lg">
            {channelDescription || 'Add a channel topic...'}
          </p>
        </div>

      </div>

      {/* Right side: Actions & Details Drawer Toggle */}
      <div className="flex items-center gap-3">
        {/* Search bar simulation */}
        <div className="relative hidden lg:flex items-center">
          <input
            type="text"
            placeholder="Search channel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-44 bg-slate-950/70 border border-slate-800/80 rounded-lg pl-8 pr-8 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/60 focus:w-56 transition-all duration-300"
          />
          <Search size={12} className="absolute left-2.5 text-slate-500" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 p-0.5 rounded hover:bg-slate-850 text-slate-400 hover:text-slate-200 cursor-pointer transition"
              title="Clear search"
            >
              <X size={10} />
            </button>
          )}
        </div>



        {/* Pinned Messages Panel Toggle */}
        {!isDM && (
          <button
            onClick={togglePinnedPanel}
            className={`p-1.5 rounded-lg transition cursor-pointer flex items-center justify-center border ${showPinnedPanel
              ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20'
              : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-transparent'
              }`}
            title="Pinned Messages"
          >
            <Pin size={16} className="rotate-45" />
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} className="text-indigo-400" />}
        </button>

        {/* Info panel toggle */}
        <button
          onClick={toggleMembersList}
          className={`p-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 border ${showMembersList
            ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20'
            : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          title="Details & Members"
        >
          <Info size={16} />
          <span className="hidden sm:inline text-xs font-semibold">Details</span>
        </button>

        {/* Settings/More Dropdown Menu (Leave Channel) */}
        {!isDM && (
          <div className="relative">
            <button
              onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
              className={`p-1.5 rounded-lg transition cursor-pointer flex items-center justify-center ${showSettingsDropdown
                ? 'bg-slate-800 text-slate-200'
                : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              title="More Actions"
            >
              <MoreVertical size={16} />
            </button>

            {showSettingsDropdown && (
              <div className="absolute right-0 top-9 w-40 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50 animate-[fadeIn_0.15s_ease-out] text-left">
                <button
                  onClick={() => {
                    setShowLeaveModal(true);
                    setShowSettingsDropdown(false);
                  }}
                  className="w-full px-3 py-2 text-xs font-semibold text-red-400 hover:bg-slate-800/60 flex items-center gap-2 transition cursor-pointer"
                >
                  <LogOut size={14} />
                  Leave Channel
                </button>
              </div>
            )}
          </div>
        )}

        {/* User profile avatar toggle button */}
        {currentUser && (
          <button
            onClick={toggleProfilePanel}
            className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center border transition cursor-pointer shrink-0 ${showProfilePanel
              ? 'bg-indigo-500 border-indigo-400 text-white ring-2 ring-indigo-500/30'
              : 'bg-slate-850 border-slate-700 text-indigo-300 hover:border-indigo-400 hover:text-indigo-200'
              }`}
            title="My Profile"
          >
            {currentUser.avatar}
          </button>
        )}
      </div>

      {/* LEAVE CHANNEL CONFIRMATION MODAL */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative text-left">
            <h3 className="text-base font-bold text-white mb-1.5">Leave #{channelName}</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Are you sure you want to leave this channel? You won't see it in your sidebar unless you join again from the Browse Channels modal.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800/60">
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (channelId && onLeaveChannel) {
                    onLeaveChannel(channelId);
                  }
                  setShowLeaveModal(false);
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

export default ChatHeader;