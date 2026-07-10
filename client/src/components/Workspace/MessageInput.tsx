import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  Bold,
  Code,
  HelpCircle,
  Italic,
  Send,
  Strikethrough,
} from "lucide-react";

import { socket } from "../../services/socket";
interface MessageInputProps {
  onSendMessage: (content: string) => void | Promise<void>;
  placeholder: string;
}

function MessageInput({ onSendMessage, placeholder }: MessageInputProps) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

useEffect(() => {
  socket.on("connect", () => {
    console.log("Socket Connected:", socket.id);
  });

  return () => {
    socket.off("connect");
  };
}, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        180
      )}px`;
    }
  }, [content]);

  const handleSubmit = async (event?: FormEvent) => {
    if (event) {
      event.preventDefault();
    }

    if (!content.trim()) {
      return;
    }

    try {
      await Promise.resolve(onSendMessage(content.trim()));
      setContent("");

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.focus();
      }
    } catch {
      // The parent container renders the request error state.
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  };

  const appendFormatting = (syntax: string) => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    const formatted =
      syntax === "```"
        ? `\n\`\`\`\n${selected || "code block"}\n\`\`\`\n`
        : `${syntax}${selected || "text"}${syntax}`;

    const newContent =
      text.substring(0, start) + formatted + text.substring(end);

    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + syntax.length,
        start + syntax.length + (selected ? selected.length : 4)
      );
    }, 50);
  };

  const insertEmoji = (emoji: string) => {
    setContent((previous) => previous + emoji);

    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="shrink-0 bg-slate-950/20 p-4 select-none">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900 transition-all duration-200 focus-within:border-indigo-500/80"
      >
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="min-h-[44px] w-full resize-none overflow-y-auto border-none bg-transparent px-4 pb-2 pt-3.5 text-sm leading-relaxed text-slate-200 placeholder-slate-500 focus:outline-none select-text"
        />

        <div className="flex items-center justify-between rounded-b-2xl border-t border-slate-800/60 bg-slate-950/25 px-3 py-2">
          <div className="flex items-center gap-1 text-slate-500">
            <button
              type="button"
              onClick={() => appendFormatting("*")}
              className="cursor-pointer rounded-lg p-1.5 transition hover:bg-slate-800 hover:text-slate-300"
              title="Bold"
            >
              <Bold size={14} />
            </button>

            <button
              type="button"
              onClick={() => appendFormatting("_")}
              className="cursor-pointer rounded-lg p-1.5 transition hover:bg-slate-800 hover:text-slate-300"
              title="Italic"
            >
              <Italic size={14} />
            </button>

            <button
              type="button"
              onClick={() => appendFormatting("~")}
              className="cursor-pointer rounded-lg p-1.5 transition hover:bg-slate-800 hover:text-slate-300"
              title="Strikethrough"
            >
              <Strikethrough size={14} />
            </button>

            <div className="mx-1 h-3.5 w-[1px] bg-slate-800" />

            <button
              type="button"
              onClick={() => appendFormatting("`")}
              className="cursor-pointer rounded-lg p-1.5 transition hover:bg-slate-800 hover:text-slate-300"
              title="Inline Code"
            >
              <Code size={14} />
            </button>

            <button
              type="button"
              onClick={() => appendFormatting("```")}
              className="cursor-pointer rounded-lg p-1.5 transition hover:bg-slate-800 hover:text-slate-300"
              title="Code Block"
            >
              <Code size={14} className="scale-x-125" />
            </button>

            <button
              type="button"
              onClick={() => insertEmoji("💡")}
              className="hidden cursor-pointer rounded-lg p-1.5 transition hover:bg-slate-800 hover:text-slate-300 sm:block"
              title="Insert Tips Emoji"
            >
              <HelpCircle size={14} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="mr-1 hidden items-center gap-0.5 text-slate-500 sm:flex">
              {["😄", "🚀", "🔥"].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  className="flex h-6.5 w-6.5 cursor-pointer items-center justify-center rounded-md text-xs transition hover:bg-slate-800"
                >
                  {emoji}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={!content.trim()}
              className={`flex cursor-pointer items-center justify-center rounded-xl p-2 transition-all duration-200 ${
                content.trim()
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 active:scale-95"
                  : "cursor-not-allowed bg-slate-800 text-slate-600"
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
