import { X, Pin, MessageSquare } from 'lucide-react';
import type { Message } from '../../types';

interface PinnedPanelProps {
  channelName: string;
  pinnedMessages: Message[];
  onClose: () => void;
}

function PinnedPanel({ channelName, pinnedMessages, onClose }: PinnedPanelProps) {
  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800/80 text-left select-none overflow-hidden select-text animate-[slideInRight_0.2s_ease-out]">
      
      {/* Header */}
      <div className="h-16 border-b border-slate-850 px-4 flex items-center justify-between bg-slate-950/30 select-none">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
          <Pin size={14} className="text-indigo-400 rotate-45" />
          Pinned Messages
        </h3>
        
        <button 
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-200 cursor-pointer transition"
          title="Close details"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        <div className="text-xs font-bold text-slate-400 mb-4 px-1 select-none">
          Showing pins from <span className="text-indigo-400">#{channelName}</span>
        </div>

        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
          {pinnedMessages.map((msg) => (
            <div 
              key={msg.id}
              className="p-3.5 bg-slate-950/60 border border-slate-850 rounded-xl relative group hover:border-slate-800 transition"
            >
              <Pin size={12} className="absolute right-3.5 top-3.5 text-indigo-400/60 rotate-45 select-none" />
              
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-indigo-300 text-xs font-extrabold flex items-center justify-center shrink-0 select-none">
                  {msg.senderAvatar}
                </div>

                {/* Content Area */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-extrabold text-slate-200 truncate">{msg.senderName}</span>
                    <span className="text-[9px] text-slate-500 font-semibold shrink-0">{msg.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1 whitespace-pre-wrap break-words select-text">
                    {msg.content}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {pinnedMessages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-500 select-none">
              <Pin size={32} className="mb-2 text-slate-700 opacity-60 rotate-45" />
              <p className="text-xs font-bold text-slate-400">No pinned messages</p>
              <p className="text-[10px] text-slate-500 mt-0.5 text-center max-w-[200px] leading-relaxed">
                Pin important messages to keep them easily accessible for everyone in this channel.
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default PinnedPanel;
