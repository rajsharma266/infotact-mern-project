import type { Message, User } from '../../types';
import { MessageSquare, Pin } from 'lucide-react';

interface MessageCardProps {
  message: Message;
  onAddReaction: (messageId: string, emoji: string) => void;
  onTogglePin: (messageId: string) => void;
  currentUser: User;
}

function MessageCard({ message, onAddReaction, onTogglePin, currentUser }: MessageCardProps) {

  // Quick picker reactions
  const quickEmojis = ['👍', '❤️', '🔥', '😂', '🎉', '🚀'];

  // Helper to parse simple code block formatting or normal text
  const renderFormattedContent = (content: string) => {
    // Simple code block detector: ```code```
    const tripleBacktickRegex = /```([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = tripleBacktickRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }
      parts.push(
        <pre key={match.index} className="bg-slate-950/90 border border-slate-800 text-slate-300 font-mono text-xs p-3.5 rounded-xl my-2 overflow-x-auto leading-relaxed max-w-full">
          <code>{match[1].trim()}</code>
        </pre>
      );
      lastIndex = tripleBacktickRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    // Fallback: if no triple backticks, check single backticks: `code`
    if (parts.length === 1 && typeof parts[0] === 'string') {
      const singleBacktickRegex = /`([^`]+)`/g;
      const inlineParts = [];
      let lastInlineIndex = 0;
      let inlineMatch;
      const inlineContent = parts[0];

      while ((inlineMatch = singleBacktickRegex.exec(inlineContent)) !== null) {
        if (inlineMatch.index > lastInlineIndex) {
          inlineParts.push(inlineContent.substring(lastInlineIndex, inlineMatch.index));
        }
        inlineParts.push(
          <code key={inlineMatch.index} className="bg-slate-950 border border-slate-800/80 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-xs">
            {inlineMatch[1]}
          </code>
        );
        lastInlineIndex = singleBacktickRegex.lastIndex;
      }

      if (lastInlineIndex < inlineContent.length) {
        inlineParts.push(inlineContent.substring(lastInlineIndex));
      }
      return <p className="text-sm text-slate-300 leading-relaxed break-words whitespace-pre-wrap">{inlineParts}</p>;
    }

    return (
      <div className="text-sm text-slate-300 leading-relaxed break-words whitespace-pre-wrap">
        {parts.map((p, index) => (
          <span key={index}>{p}</span>
        ))}
      </div>
    );
  };

  return (
    <div className="relative group flex items-start gap-3.5 p-3 rounded-2xl hover:bg-slate-900/30 border border-transparent hover:border-slate-800/40 transition-all duration-200">
      
      {/* 1. SENDER AVATAR */}
      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 text-indigo-200 border border-slate-800 flex items-center justify-center font-bold text-xs shrink-0 select-none">
        {message.senderAvatar}
      </div>

      {/* 2. CARD BODY */}
      <div className="flex-1 flex flex-col text-left min-w-0">
        
        {/* Name and Timestamp Header */}
        <div className="flex items-center gap-2 mb-1 select-none">
          <span className="text-xs font-bold text-slate-200 hover:underline cursor-pointer">
            {message.senderName}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            {message.timestamp}
          </span>
          {message.isPinned && (
            <span className="flex items-center gap-0.5 text-[9px] text-indigo-400 font-semibold bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
              <Pin size={8} className="rotate-45" /> Pinned
            </span>
          )}
        </div>

        {/* Message Content */}
        <div className="pr-8">
          {renderFormattedContent(message.content)}
        </div>

        {/* Reactions List Row */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5 select-none">
            {message.reactions.map((react, index) => {
              const hasReacted = react.users.includes(currentUser.id);
              return (
                <button
                  key={index}
                  onClick={() => onAddReaction(message.id, react.emoji)}
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold cursor-pointer transition ${
                    hasReacted 
                      ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' 
                      : 'bg-slate-950/60 text-slate-400 border-slate-800/80 hover:bg-slate-900/80 hover:text-slate-200'
                  }`}
                >
                  <span>{react.emoji}</span>
                  <span>{react.count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Threads Replies Indicator bar */}
        {message.threadRepliesCount && message.threadRepliesCount > 0 && (
          <button className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold mt-3 p-1 rounded hover:bg-indigo-500/5 cursor-pointer w-fit select-none">
            <MessageSquare size={12} />
            <span>{message.threadRepliesCount} replies</span>
            <span className="text-[10px] text-slate-500 font-normal">• Last reply 1h ago</span>
          </button>
        )}

      </div>

      {/* 3. HOVER ACTIONS QUICK PICKER BAR */}
      <div className="absolute right-4 top-[-14px] opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center bg-slate-900 border border-slate-800/90 rounded-xl px-1.5 py-1 shadow-2xl gap-0.5 select-none z-10 scale-95 group-hover:scale-100">
        
        {/* Render Emojis */}
        {quickEmojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onAddReaction(message.id, emoji)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-800 cursor-pointer text-sm transition active:scale-90"
            title={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}

        <div className="w-[1px] h-4 bg-slate-800 mx-1" />

        {/* Pin/Unpin button */}
        <button 
          onClick={() => onTogglePin(message.id)}
          className={`w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-800 cursor-pointer transition ${message.isPinned ? 'text-indigo-400 bg-slate-800/80 hover:text-indigo-300' : 'text-slate-400 hover:text-indigo-400'}`}
          title={message.isPinned ? "Unpin Message" : "Pin Message"}
        >
          <Pin size={13} className={message.isPinned ? "" : "rotate-45"} />
        </button>

        {/* Thread reply button */}
        <button 
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-800 hover:text-indigo-400 text-slate-400 cursor-pointer transition"
          title="Reply in Thread"
        >
          <MessageSquare size={13} />
        </button>
      </div>

    </div>
  );
}

export default MessageCard;
