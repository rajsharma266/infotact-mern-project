interface TypingIndicatorProps {
  typingUsers: string[];
}

function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return <div className="h-6" />; // Keep height placeholder to prevent input shifting

  let text = '';
  if (typingUsers.length === 1) {
    text = `${typingUsers[0]} is typing`;
  } else if (typingUsers.length === 2) {
    text = `${typingUsers[0]} and ${typingUsers[1]} are typing`;
  } else {
    text = 'Several people are typing';
  }

  return (
    <div className="absolute left-6 bottom-4 flex items-center gap-2 text-xs text-slate-400 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-800/80 shadow-lg animate-[fadeIn_0.15s_ease-out] select-none z-10">
      
      {/* Animated dots */}
      <div className="flex items-center gap-1">
        <span className="typing-dot bg-indigo-400" />
        <span className="typing-dot bg-indigo-400" />
        <span className="typing-dot bg-indigo-400" />
      </div>

      <span className="font-medium">{text}</span>

    </div>
  );
}

export default TypingIndicator;
