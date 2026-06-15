import type { Workspace as WorkspaceType } from '../../types';
import { LayoutDashboard, Plus } from 'lucide-react';

interface WorkspaceSidebarProps {
  workspaces: WorkspaceType[];
  activeWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  onGoToDashboard: () => void;
  onClickWorkspace?: () => void;
}

function WorkspaceSidebar({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onGoToDashboard,
  onClickWorkspace,
}: WorkspaceSidebarProps) {
  return (
    <div className="w-20 bg-slate-950 border-r border-slate-800/80 flex flex-col items-center py-5 justify-between h-full select-none">
      
      {/* Top section: Home & List */}
      <div className="flex flex-col items-center gap-5 w-full">
        {/* Dashboard Launcher Button */}
        <div className="relative group w-full flex justify-center">
          <button 
            onClick={onGoToDashboard}
            className="w-12 h-12 rounded-2xl bg-slate-900 hover:bg-indigo-600 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 group-hover:rounded-xl shadow-md"
          >
            <LayoutDashboard size={20} />
          </button>
          
          {/* Tooltip */}
          <div className="absolute left-20 top-3 px-2.5 py-1 text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-200 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
            Dashboard Launcher
          </div>
        </div>

        {/* Separator */}
        <div className="w-8 h-[2px] bg-slate-800 rounded-full" />

        {/* Workspaces list */}
        <div className="flex flex-col items-center gap-4 w-full overflow-y-auto max-h-[60vh] scrollbar-none">
          {workspaces.map((ws) => {
            const isActive = ws.id === activeWorkspaceId;
            return (
              <div key={ws.id} className="relative group w-full flex justify-center">
                {/* Selection Indicator bar (Slack-style pill indicator) */}
                <div 
                  className={`absolute left-0 top-3.5 w-1 rounded-r-full bg-indigo-500 transition-all duration-300 ${
                    isActive ? 'h-5' : 'h-0 group-hover:h-3'
                  }`} 
                />

                {/* Workspace Logo Button */}
                <button
                  onClick={() => {
                    onSelectWorkspace(ws.id);
                    if (onClickWorkspace) onClickWorkspace();
                  }}
                  className={`w-12 h-12 rounded-2xl font-black text-sm flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 shadow-md ${
                    isActive 
                      ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white rounded-xl' 
                      : 'bg-slate-900 hover:bg-gradient-to-tr hover:from-slate-800 hover:to-slate-700 text-indigo-300 hover:text-indigo-200 border border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {ws.logo}
                </button>

                {/* Tooltip */}
                <div className="absolute left-20 top-3 px-2.5 py-1 text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-200 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                  {ws.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom section: Help/Add */}
      <div className="flex flex-col items-center gap-4 w-full">
        {/* Placeholder helper icon */}
        <div className="relative group w-full flex justify-center">
          <button 
            className="w-12 h-12 rounded-full bg-slate-900/40 hover:bg-indigo-500/10 hover:text-indigo-400 border border-dashed border-slate-800 hover:border-indigo-500/40 text-slate-500 flex items-center justify-center cursor-not-allowed transition duration-200"
            disabled
          >
            <Plus size={18} />
          </button>
          
          <div className="absolute left-20 top-3 px-2.5 py-1 text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-400 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            Create in Dashboard
          </div>
        </div>
      </div>

    </div>
  );
}

export default WorkspaceSidebar;