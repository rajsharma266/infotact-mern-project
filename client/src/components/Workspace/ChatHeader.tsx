import { Hash, Lock, Search, Bell, Menu, Info, X, Sun, Moon } from 'lucide-react';

interface ChatHeaderProps {
  channelName: string | undefined;
  channelDescription: string | undefined;
  isPrivate: boolean | undefined;
  type: 'channel' | 'dm' | undefined;
  toggleMembersList: () => void;
  showMembersList: boolean;
  toggleMobileSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

function ChatHeader({
  channelName,
  channelDescription,
  isPrivate,
  type,
  toggleMembersList,
  showMembersList,
  toggleMobileSidebar,
  searchQuery,
  setSearchQuery,
  theme,
  onToggleTheme,
}: ChatHeaderProps) {
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

        {/* Alert Mute Notification bell (disabled mockup) */}
        <button 
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition cursor-not-allowed hidden sm:block"
          title="Mute Notifications"
          disabled
        >
          <Bell size={16} />
        </button>

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
          className={`p-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
            showMembersList 
              ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' 
              : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
          title="Details & Members"
        >
          <Info size={16} />
          <span className="hidden sm:inline text-xs font-semibold">Details</span>
        </button>
      </div>

    </div>
  );
}

export default ChatHeader;