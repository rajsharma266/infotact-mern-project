import { X, LogOut } from 'lucide-react';
import type { User } from '../../types';

interface ProfileDrawerProps {
  user: User;
  onClose: () => void;
  onLogout: () => void;
}

function ProfileDrawer({ user, onClose, onLogout }: ProfileDrawerProps) {
  // Color codes for status indicator
  const statusColors = {
    online: 'bg-emerald-500',
    away: 'bg-amber-500',
    offline: 'bg-slate-500',
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800/80 text-left select-none overflow-hidden select-text">
      
      {/* Header */}
      <div className="h-16 border-b border-slate-850 px-4 flex items-center justify-between bg-slate-950/30 select-none">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
          Profile Details
        </h3>
        
        <button 
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-200 cursor-pointer transition"
          title="Close details"
        >
          <X size={16} />
        </button>
      </div>

      {/* Profile Details Content */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-between">
        <div className="space-y-6 flex flex-col items-center">
          
          {/* Avatar Area */}
          <div className="relative mt-4 group">
            <div className="w-24 h-24 rounded-2xl bg-indigo-600/20 border-2 border-indigo-500/40 text-indigo-300 font-black text-2xl flex items-center justify-center shadow-2xl transition duration-300">
              {user.avatar}
            </div>
            <span className={`absolute bottom-[-4px] right-[-4px] w-5 h-5 rounded-full border-4 border-slate-900 ${
              statusColors[user.status]
            }`} />
          </div>

          {/* Core Info */}
          <div className="text-center space-y-1.5 w-full">
            <h2 className="text-base font-bold text-slate-100">{user.name}</h2>
            <p className="text-xs text-slate-400 font-semibold">{user.email || 'No email provided'}</p>
            <div className="pt-2 flex justify-center">
              <span className="text-[10px] font-bold tracking-wider uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 px-2.5 py-0.5 rounded-full">
                {user.role}
              </span>
            </div>
          </div>

          <div className="w-full h-[1px] bg-slate-800/80 my-2" />

          {/* Details Metadata */}
          <div className="w-full space-y-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</span>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-950/40 border border-slate-850 rounded-xl">
                <span className={`w-2 h-2 rounded-full ${statusColors[user.status]}`} />
                <span className="capitalize text-slate-300 font-bold">{user.status}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">User ID</span>
              <div className="px-3 py-2 bg-slate-950/40 border border-slate-850 rounded-xl text-slate-400 font-mono text-[10px]">
                {user.id}
              </div>
            </div>
          </div>

        </div>

        {/* Footer Area */}
        <div className="pt-6 border-t border-slate-800/80">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-600/15 hover:bg-red-600 hover:text-white text-red-400 border border-red-500/20 rounded-xl font-bold text-xs transition-all cursor-pointer"
          >
            <LogOut size={14} />
            Log Out
          </button>
        </div>

      </div>

    </div>
  );
}

export default ProfileDrawer;
