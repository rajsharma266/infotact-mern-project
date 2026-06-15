import { MessageSquare } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
}

function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative select-none">
      
      {/* Glow background */}
      <div className="absolute w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* SVG illustration container */}
      <div className="mb-6 relative flex items-center justify-center">
        
        {/* Border circles */}
        <div className="absolute w-24 h-24 rounded-full border border-slate-800/80 animate-[ping_3s_infinite_ease-in-out]" />
        
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 border border-slate-800 text-indigo-400 flex items-center justify-center shadow-xl">
          <MessageSquare size={26} className="animate-pulse" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-100 mb-2 max-w-sm">
        {title}
      </h3>
      <p className="text-xs md:text-sm text-slate-400 max-w-sm leading-relaxed mb-6">
        {description}
      </p>

      {/* Interactive Helper list */}
      <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl max-w-xs text-left text-xs text-slate-400 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          <span>Select public channels (e.g. #frontend)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          <span>Launch direct DMs with teammates</span>
        </div>
      </div>

    </div>
  );
}

export default EmptyState;
