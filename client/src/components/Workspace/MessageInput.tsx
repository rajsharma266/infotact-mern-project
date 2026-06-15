import { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Code, Send, Strikethrough, HelpCircle } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  placeholder: string;
}

function MessageInput({ onSendMessage, placeholder }: MessageInputProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto size height based on contents
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [content]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim()) return;
    onSendMessage(content.trim());
    setContent('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter key (without Shift key)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Quick rich format appender
  const appendFormatting = (syntax: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    let formatted = '';
    if (syntax === '```') {
      formatted = `\n\`\`\`\n${selected || 'code block'}\n\`\`\`\n`;
    } else {
      formatted = `${syntax}${selected || 'text'}${syntax}`;
    }

    const newContent = text.substring(0, start) + formatted + text.substring(end);
    setContent(newContent);

    // Reposition cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + syntax.length, start + syntax.length + (selected ? selected.length : 4));
    }, 50);
  };

  // Emojis list simulator
  const insertEmoji = (emoji: string) => {
    setContent(prev => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="p-4 bg-slate-950/20 shrink-0 select-none">
      
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col focus-within:border-indigo-500/80 transition-all duration-200">
        
        {/* Editor Area */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="w-full bg-transparent border-none focus:outline-none px-4 pt-3.5 pb-2 text-sm text-slate-200 placeholder-slate-500 resize-none min-h-[44px] overflow-y-auto leading-relaxed select-text"
        />

        {/* Toolbar Footer Actions */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-slate-800/60 bg-slate-950/25 rounded-b-2xl">
          
          {/* Format buttons */}
          <div className="flex items-center gap-1 text-slate-500">
            
            <button 
              type="button"
              onClick={() => appendFormatting('*')}
              className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-300 transition cursor-pointer"
              title="Bold"
            >
              <Bold size={14} />
            </button>

            <button 
              type="button"
              onClick={() => appendFormatting('_')}
              className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-300 transition cursor-pointer"
              title="Italic"
            >
              <Italic size={14} />
            </button>

            <button 
              type="button"
              onClick={() => appendFormatting('~')}
              className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-300 transition cursor-pointer"
              title="Strikethrough"
            >
              <Strikethrough size={14} />
            </button>

            <div className="w-[1px] h-3.5 bg-slate-800 mx-1" />

            <button 
              type="button"
              onClick={() => appendFormatting('`')}
              className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-300 transition cursor-pointer"
              title="Inline Code"
            >
              <Code size={14} />
            </button>

            <button 
              type="button"
              onClick={() => appendFormatting('```')}
              className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-300 transition cursor-pointer"
              title="Code Block"
            >
              <Code size={14} className="scale-x-125" />
            </button>
            
            <button 
              type="button"
              onClick={() => insertEmoji('💡')}
              className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-slate-300 transition cursor-pointer hidden sm:block"
              title="Insert Tips Emoji"
            >
              <HelpCircle size={14} />
            </button>

          </div>

          {/* Action buttons (Emoji drawer trigger, Send) */}
          <div className="flex items-center gap-2">
            
            {/* Quick Emoji Buttons */}
            <div className="hidden sm:flex items-center gap-0.5 mr-1 text-slate-500">
              {['😄', '🚀', '🔥'].map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  className="w-6.5 h-6.5 text-xs flex items-center justify-center rounded-md hover:bg-slate-800 cursor-pointer transition"
                >
                  {emoji}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={!content.trim()}
              className={`p-2 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                content.trim() 
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 active:scale-95' 
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
              title="Send Message"
            >
              <Send size={14} />
            </button>
          </div>

        </div>

      </form>

    </div>
  );
}

export default MessageInput;
