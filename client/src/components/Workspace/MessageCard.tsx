import type { Message, User } from "../../types";
import { MessageSquare, Pin } from "lucide-react";

interface MessageCardProps {
  message: Message;
  onAddReaction: (messageId: string, emoji: string) => void;
  onTogglePin: (messageId: string) => void;
  currentUser: User;
}

function MessageCard({
  message,
  onAddReaction,
  onTogglePin,
  currentUser,
}: MessageCardProps) {
  const quickEmojis = ["👍", "❤️", "🔥", "😂", "🎉", "🚀"];

  const renderFormattedContent = (content: string) => {
    const tripleBacktickRegex = /```([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tripleBacktickRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }

      parts.push(
        <pre
          key={match.index}
          className="my-2 max-w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/90 p-3.5 font-mono text-xs leading-relaxed text-slate-300"
        >
          <code>{match[1].trim()}</code>
        </pre>
      );

      lastIndex = tripleBacktickRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    if (parts.length === 1 && typeof parts[0] === "string") {
      const singleBacktickRegex = /`([^`]+)`/g;
      const inlineParts = [];
      let lastInlineIndex = 0;
      let inlineMatch: RegExpExecArray | null;
      const inlineContent = parts[0];

      while ((inlineMatch = singleBacktickRegex.exec(inlineContent)) !== null) {
        if (inlineMatch.index > lastInlineIndex) {
          inlineParts.push(
            inlineContent.substring(lastInlineIndex, inlineMatch.index)
          );
        }

        inlineParts.push(
          <code
            key={inlineMatch.index}
            className="rounded border border-slate-800/80 bg-slate-950 px-1.5 py-0.5 font-mono text-xs text-indigo-300"
          >
            {inlineMatch[1]}
          </code>
        );

        lastInlineIndex = singleBacktickRegex.lastIndex;
      }

      if (lastInlineIndex < inlineContent.length) {
        inlineParts.push(inlineContent.substring(lastInlineIndex));
      }

      return (
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-300">
          {inlineParts}
        </p>
      );
    }

    return (
      <div className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-300">
        {parts.map((part, index) => (
          <span key={index}>{part}</span>
        ))}
      </div>
    );
  };

  return (
    <div className="group relative flex items-start gap-3.5 rounded-2xl border border-transparent p-3 transition-all duration-200 hover:border-slate-800/40 hover:bg-slate-900/30">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-gradient-to-tr from-slate-800 to-slate-700 text-xs font-bold text-indigo-200 select-none">
        {message.senderAvatar}
      </div>

      <div className="flex min-w-0 flex-1 flex-col text-left">
        <div className="mb-1 flex items-center gap-2 select-none">
          <span className="cursor-pointer text-xs font-bold text-slate-200 hover:underline">
            {message.senderName}
          </span>
          <span className="text-[10px] font-medium text-slate-500">
            {message.timestamp}
          </span>
          {message.isPinned && (
            <span className="flex items-center gap-0.5 rounded border border-indigo-500/20 bg-indigo-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-indigo-400">
              <Pin size={8} className="rotate-45" /> Pinned
            </span>
          )}
        </div>

        <div className="pr-8">{renderFormattedContent(message.content)}</div>

        {message.reactions && message.reactions.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5 select-none">
            {message.reactions.map((reaction, index) => {
              const hasReacted = reaction.users.includes(currentUser.id);

              return (
                <button
                  key={index}
                  onClick={() => onAddReaction(message.id, reaction.emoji)}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition ${
                    hasReacted
                      ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-400"
                      : "border-slate-800/80 bg-slate-950/60 text-slate-400 hover:bg-slate-900/80 hover:text-slate-200"
                  }`}
                >
                  <span>{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </button>
              );
            })}
          </div>
        )}

        {message.threadRepliesCount && message.threadRepliesCount > 0 && (
          <button className="mt-3 flex w-fit cursor-pointer items-center gap-1.5 rounded p-1 text-xs font-semibold text-indigo-400 hover:bg-indigo-500/5 hover:text-indigo-300 select-none">
            <MessageSquare size={12} />
            <span>{message.threadRepliesCount} replies</span>
            <span className="text-[10px] font-normal text-slate-500">
              Last reply 1h ago
            </span>
          </button>
        )}
      </div>

      <div className="absolute right-4 top-[-14px] z-10 flex scale-95 items-center gap-0.5 rounded-xl border border-slate-800/90 bg-slate-900 px-1.5 py-1 opacity-0 shadow-2xl transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 select-none">
        {quickEmojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onAddReaction(message.id, emoji)}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-sm transition hover:bg-slate-800 active:scale-90"
            title={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}

        <div className="mx-1 h-4 w-[1px] bg-slate-800" />

        <button
          onClick={() => onTogglePin(message.id)}
          className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg transition hover:bg-slate-800 ${
            message.isPinned
              ? "bg-slate-800/80 text-indigo-400 hover:text-indigo-300"
              : "text-slate-400 hover:text-indigo-400"
          }`}
          title={message.isPinned ? "Unpin Message" : "Pin Message"}
        >
          <Pin size={13} className={message.isPinned ? "" : "rotate-45"} />
        </button>

        <button
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-indigo-400"
          title="Reply in Thread"
        >
          <MessageSquare size={13} />
        </button>
      </div>
    </div>
  );
}

export default MessageCard;
