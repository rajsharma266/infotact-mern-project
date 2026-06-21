import { useEffect, useRef } from "react";
import type { Message, User } from "../../types";
import MessageCard from "./MessageCard";

interface MessageListProps {
  messages: Message[];
  onAddReaction: (messageId: string, emoji: string) => void;
  onTogglePin: (messageId: string) => void;
  currentUser: User;
}

function MessageList({
  messages,
  onAddReaction,
  onTogglePin,
  currentUser,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-6 scroll-smooth select-text">
      <div className="mb-4 max-w-lg rounded-2xl border border-slate-800/60 bg-slate-900/35 p-5 text-left">
        <h3 className="text-sm font-extrabold text-slate-200">
          This is the start of your message history 💬
        </h3>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
          Send messages, add emoji reactions, and reply in threads. Keep
          communications clear and contextual.
        </p>
      </div>

      <div className="relative my-2 flex items-center justify-center select-none">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-800/70"></div>
        </div>
        <div className="relative rounded-full border border-slate-800/80 bg-slate-950 px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Messages History
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {messages.map((message) => (
          <MessageCard
            key={message.id}
            message={message}
            onAddReaction={onAddReaction}
            onTogglePin={onTogglePin}
            currentUser={currentUser}
          />
        ))}
      </div>

      <div ref={scrollRef} />
    </div>
  );
}

export default MessageList;
