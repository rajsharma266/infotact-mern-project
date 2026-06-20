import { useEffect, useRef } from 'react';
import type { Message, User } from '../../types';
import MessageCard from './MessageCard';

interface MessageListProps {
  messages: Message[];
  onAddReaction: (messageId: string, emoji: string) => void;
  onTogglePin: (messageId: string) => void;
  currentUser: User;
}

function MessageList({ messages, onAddReaction, onTogglePin, currentUser }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Group messages simple logic: for a clean UI, we can show date labels or just lists
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6 scroll-smooth select-text">
      
      {/* Starting welcome element */}
      <div className="text-left bg-slate-900/35 border border-slate-800/60 p-5 rounded-2xl mb-4 max-w-lg">
        <h3 className="font-extrabold text-sm text-slate-200">This is the start of your message history 💬</h3>
        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
          Send messages, add emoji reactions, and reply in threads. Keep communications clear and contextual.
        </p>
      </div>

      {/* Date Divider (Simulated standard layout) */}
      <div className="relative flex items-center justify-center my-2 select-none">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-800/70"></div>
        </div>
        <div className="relative bg-slate-950 px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 rounded-full border border-slate-800/80">
          Messages History
        </div>
      </div>

      {/* Render messages */}
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

      {/* Scroll anchor node */}
      <div ref={scrollRef} />

    </div>
  );
}

export default MessageList;
