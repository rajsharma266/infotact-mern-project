import { useEffect, useState } from 'react';
import axios from "axios";
import type { Workspace, User } from '../types';
import { Plus, Users, ArrowRight, LayoutGrid, Activity, Bell, Compass, Sun, Moon } from 'lucide-react';
import ProfileDrawer from '../components/Workspace/ProfileDrawer';

interface DashboardProps {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  onCreateWorkspace: (name: string, description: string) => void;
  currentUser: User;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onLogout?: () => void;
  defaultShowCreateModal?: boolean;
}

function Dashboard({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateWorkspace,
  currentUser,
  theme,
  onToggleTheme,
  onLogout,
  defaultShowCreateModal = false,
}: DashboardProps) {
  const [showModal, setShowModal] = useState(defaultShowCreateModal);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateWorkspace(name, description);
    setName('');
    setDescription('');
    setShowModal(false);
  };

  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  useEffect(() => {
  const fetchActivities = async () => {
    if (workspaces.length === 0) return;

    try {
      const workspaceId = activeWorkspaceId;

      const res = await axios.get(
        `http://localhost:4000/api/activities/${workspaceId}`
      );

      const mappedActivities = res.data.data.map((act: any) => ({
        id: act._id,
        user: act.user?.name || "Unknown",
        workspace: act.workspace?.name || "Workspace",
        action: act.details,
        time: new Date(act.createdAt).toLocaleString(),
      }));

      setRecentActivities(mappedActivities);
    } catch (error) {
      console.error("Failed to load activities", error);
    }
  };

  fetchActivities();
}, [workspaces]);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6 md:p-10 text-slate-100 flex flex-col relative select-none">

      {/* BACKGROUND DECORATIONS */}
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* TOP NAV BAR */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6 mb-8 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/35">
            IT
          </div>
          <div>
            <span className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Infotact Workspace
            </span>
            <span className="ml-2 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-indigo-500/20 text-indigo-400 rounded-full border border-indigo-500/35">
              v1.0.0
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-2.5 bg-slate-900/60 backdrop-blur-md rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} className="text-indigo-400" />}
          </button>

          {/* User Card */}
          <div
            onClick={() => setShowProfileDrawer(true)}
            className="flex items-center gap-3 bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800 cursor-pointer hover:bg-slate-900/90 hover:border-indigo-500/40 transition-colors"
            title="View Profile"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center font-bold text-xs text-white">
              {currentUser.avatar}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-200">{currentUser.name}</div>
              <div className="text-[10px] text-slate-400">Developer Account</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 z-10">

        {/* LEFT 3 COLUMNS: WELCOME & WORKSPACES */}
        <div className="lg:col-span-3 flex flex-col gap-8">

          {/* WELCOME SECTION */}
          <div className="text-left bg-gradient-to-r from-indigo-950/40 to-slate-900/40 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-slate-800/80 shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-[circle_at_bottom_right] from-indigo-500/10 to-transparent pointer-events-none" />
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
              Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">{currentUser.name}</span>! 👋
            </h1>
            <p className="text-sm md:text-base text-slate-300 max-w-xl">
              Streamline collaboration, communication, and workflow management in one powerful SaaS platform.
              Create, scale, and manage workspaces effortlessly from anywhere.
            </p>

            <div className="flex flex-wrap gap-4 mt-6">
              <button
                onClick={() => setShowModal(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-sm transition shadow-lg shadow-indigo-600/25 flex items-center gap-2 hover:scale-[1.02] cursor-pointer"
              >
                <Plus size={18} />
                Create New Workspace
              </button>

              <div className="flex items-center gap-2 text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2.5 rounded-xl font-medium">
                <Activity size={14} className="animate-pulse" />
                Stateless backend services running
              </div>
            </div>
          </div>

          {/* WORKSPACES GRID SECTION */}
          <div className="text-left">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <LayoutGrid size={18} className="text-indigo-400" />
                Active Workspaces ({workspaces.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {workspaces.map((ws) => (
                <div
                  key={ws.id}
                  onClick={() => onSelectWorkspace(ws.id)}
                  className="group relative bg-slate-900/40 hover:bg-slate-900/90 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 hover:border-indigo-500/40 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-indigo-500/5 hover:scale-[1.01] flex flex-col justify-between h-52"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/35 flex items-center justify-center font-extrabold text-base transition-colors group-hover:from-indigo-600 group-hover:to-indigo-400 group-hover:text-white group-hover:border-transparent">
                        {ws.logo}
                      </div>

                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-400 text-xs font-medium">
                        <Users size={12} className="text-indigo-400" />
                        <span>{ws.membersCount}</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-100 text-base mb-1.5 group-hover:text-indigo-400 transition-colors">
                      {ws.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {ws.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/60">
                    <span className="text-[11px] text-slate-500 font-semibold tracking-wide uppercase">
                      Open Workspace
                    </span>
                    <ArrowRight size={14} className="text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}

              {/* DUMMY NEW WORKSPACE BUTTON IN GRID */}
              <div
                onClick={() => setShowModal(true)}
                className="bg-slate-950 hover:bg-slate-900/20 border-2 border-dashed border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-3 transition cursor-pointer min-h-52 group"
              >
                <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition">
                  <Plus size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-300 text-sm group-hover:text-indigo-400">Add Workspace</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-[160px]">Launch a new project channel structure</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT 1 COLUMN: SIDEBAR CONTROLS (STATS & LOGS) */}
        <div className="flex flex-col gap-6 text-left">

          {/* STATS AREA */}
          <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl flex flex-col gap-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Activity size={14} className="text-indigo-400" />
              Collaboration Stats
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                <div className="text-xl font-extrabold text-indigo-400">{workspaces.length}</div>
                <div className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">Workspaces</div>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                <div className="text-xl font-extrabold text-purple-400">12</div>
                <div className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">Total DMs</div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-300 font-bold">API Gateway Status</div>
                <div className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                  Connected to Redis Server
                </div>
              </div>
              <Compass size={22} className="text-emerald-500/40" />
            </div>
          </div>

          {/* TIMELINE ACTIVITIES */}
          <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl flex flex-col gap-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Bell size={14} className="text-indigo-400" />
              Recent Activities
            </h2>

            <div className="flex flex-col gap-3">
              {recentActivities.map((act) => (
                <div key={act.id} className="border-l-2 border-slate-800 pl-3 py-1">
                  <div className="text-xs text-slate-300">
                    <span className="font-semibold text-slate-200">{act.user}</span> {act.action}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">{act.workspace}</span>
                    <span className="text-[9px] text-slate-600 font-medium">• {act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* CREATE WORKSPACE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-[scaleIn_0.2s_ease-out] text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-2">Create a New Workspace</h3>
            <p className="text-xs text-slate-400 mb-6">
              Workspaces are where your team communicates. Add a name and description to fire up a new socket connection.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Workspace Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sales Launch Pad"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Description (Optional)</label>
                <textarea
                  placeholder="e.g. Space for coordinating marketing campaigns and metrics."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  Launch Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROFILE DRAWER (Dashboard View Overlay) */}
      {showProfileDrawer && (
        <>
          {/* Backdrop click to close */}
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-40 transition-opacity"
            onClick={() => setShowProfileDrawer(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 z-50 w-80 h-full bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl animate-[slideInRight_0.2s_ease-out]">
            <ProfileDrawer
              user={currentUser}
              onClose={() => setShowProfileDrawer(false)}
              onLogout={() => {
                setShowProfileDrawer(false);
                if (onLogout) onLogout();
              }}
            />
          </div>
        </>
      )}

    </div>
  );
}

export default Dashboard;
