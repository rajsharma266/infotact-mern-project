import { useState, useEffect, useRef } from 'react';
import Dashboard from './pages/Dashboard';
import Workspace from './pages/Workspace';
import { mockWorkspaces, mockChannels, mockMessages, mockUsers, currentUser } from './data/mockData';
import type { Workspace as WorkspaceType, Channel, Message, User } from './types';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'workspace'>('dashboard');
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('ws-technova');
  const [activeChannelId, setActiveChannelId] = useState<string>('ch-tn-frontend');
  const [workspaces, setWorkspaces] = useState<WorkspaceType[]>(mockWorkspaces);
  const [channels, setChannels] = useState<Channel[]>(mockChannels);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [typing, setTyping] = useState<string[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({
    'ch-tn-general': 2,
    'ch-tn-backend': 5,
    'dm-tn-bob': 1,
  });
  const [pendingInviteId, setPendingInviteId] = useState<string | null>(null);
  const [guestName, setGuestName] = useState<string>('');
  const [dashboardOpenCreate, setDashboardOpenCreate] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const activeChannelIdRef = useRef(activeChannelId);

  useEffect(() => {
    activeChannelIdRef.current = activeChannelId;
    if (activeChannelId) {
      setUnreadCounts(prev => {
        if (!prev[activeChannelId]) return prev;
        return {
          ...prev,
          [activeChannelId]: 0,
        };
      });
    }
  }, [activeChannelId]);

  // Parse invite query parameters on startup
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinId = params.get('join');
    if (joinId) {
      setPendingInviteId(joinId);
      // Clean up browser address bar query params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);
  
  // Actions
  const handleSelectWorkspace = (id: string) => {
    setActiveWorkspaceId(id);
    // Find first channel in that workspace
    const wsChannels = channels.filter(c => c.workspaceId === id);
    if (wsChannels.length > 0) {
      setActiveChannelId(wsChannels[0].id);
    } else {
      setActiveChannelId('');
    }
    setCurrentView('workspace');
  };

  const handleSelectChannel = (id: string) => {
    setActiveChannelId(id);
  };

  const handleCreateWorkspace = (name: string, description: string) => {
    const newId = `ws-${Date.now()}`;
    const newWs: WorkspaceType = {
      id: newId,
      name,
      description,
      logo: name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'WS',
      membersCount: 1,
      userIds: [currentUser.id],
    };
    setWorkspaces([...workspaces, newWs]);
    
    // Automatically create a general channel for the new workspace
    const newChan: Channel = {
      id: `ch-${Date.now()}-general`,
      workspaceId: newId,
      name: 'general',
      description: 'General discussion',
      isPrivate: false,
      type: 'channel',
      userIds: [currentUser.id],
    };
    setChannels(prev => [...prev, newChan]);
    
    // Switch to it
    setActiveWorkspaceId(newId);
    setActiveChannelId(newChan.id);
    setDashboardOpenCreate(false);
    setCurrentView('workspace');
  };

  const handleAcceptInvite = (workspaceId: string, nameToJoin: string, existingUserId?: string) => {
    if (!nameToJoin.trim()) return;

    let targetUserId = existingUserId;

    if (!targetUserId) {
      // Generate initials for guest user avatar
      const initials = nameToJoin
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'GP';

      targetUserId = `user-guest-${Date.now()}`;
      const newGuestUser: User = {
        id: targetUserId,
        name: nameToJoin,
        avatar: initials,
        status: 'online',
        role: 'Member',
      };

      // Add guest to the global users list
      setUsers(prev => [...prev, newGuestUser]);
    }

    const finalUserId = targetUserId;

    // Update target workspace member count and user list
    setWorkspaces(prevWorkspaces =>
      prevWorkspaces.map(ws => {
        if (ws.id === workspaceId) {
          const updatedUserIds = ws.userIds ? [...ws.userIds] : [];
          if (!updatedUserIds.includes(finalUserId)) {
            updatedUserIds.push(finalUserId);
          }
          return {
            ...ws,
            membersCount: updatedUserIds.length,
            userIds: updatedUserIds,
          };
        }
        return ws;
      })
    );

    // Also update general channel of the workspace to include this user
    setChannels(prevChannels =>
      prevChannels.map(c => {
        if (c.workspaceId === workspaceId && c.name === 'general') {
          const updatedUserIds = c.userIds ? [...c.userIds] : [];
          if (!updatedUserIds.includes(finalUserId)) {
            updatedUserIds.push(finalUserId);
          }
          return {
            ...c,
            userIds: updatedUserIds,
          };
        }
        return c;
      })
    );

    // Navigate to new workspace general channel
    setActiveWorkspaceId(workspaceId);
    const wsChannels = channels.filter(c => c.workspaceId === workspaceId);
    const generalChannel = wsChannels.find(c => c.name === 'general') || wsChannels[0];
    
    if (generalChannel) {
      setActiveChannelId(generalChannel.id);
    } else {
      setActiveChannelId('');
    }

    setCurrentView('workspace');
    setPendingInviteId(null);
    setGuestName('');
  };

  const handleCreateChannel = (name: string, description: string, isPrivate: boolean) => {
    const formattedName = name.toLowerCase().replace(/\s+/g, '-');
    const newChan: Channel = {
      id: `ch-${Date.now()}`,
      workspaceId: activeWorkspaceId,
      name: formattedName,
      description,
      isPrivate,
      type: 'channel',
      userIds: [currentUser.id],
    };
    setChannels(prev => [...prev, newChan]);
    setActiveChannelId(newChan.id);
  };

  const handleCreateDM = (recipientId: string) => {
    const recipient = users.find(u => u.id === recipientId);
    if (!recipient) return;
    
    // Check if DM already exists in this workspace
    const existing = channels.find(
      c => c.workspaceId === activeWorkspaceId && c.type === 'dm' && c.recipientId === recipientId
    );
    if (existing) {
      setActiveChannelId(existing.id);
      return;
    }

    const newChan: Channel = {
      id: `dm-${Date.now()}`,
      workspaceId: activeWorkspaceId,
      name: recipient.name,
      description: `Direct message with ${recipient.name}`,
      isPrivate: true,
      type: 'dm',
      recipientId,
      userIds: [currentUser.id, recipientId],
    };
    setChannels(prev => [...prev, newChan]);
    setActiveChannelId(newChan.id);
  };

  const handleJoinChannel = (channelId: string) => {
    setChannels(prev => prev.map(c => {
      if (c.id === channelId) {
        const updatedUserIds = c.userIds ? [...c.userIds] : [];
        if (!updatedUserIds.includes(currentUser.id)) {
          updatedUserIds.push(currentUser.id);
        }
        return { ...c, userIds: updatedUserIds };
      }
      return c;
    }));
    setActiveChannelId(channelId);
  };

  const handleInviteToChannel = (channelId: string, userId: string) => {
    setChannels(prev => prev.map(c => {
      if (c.id === channelId) {
        const updatedUserIds = c.userIds ? [...c.userIds] : [];
        if (!updatedUserIds.includes(userId)) {
          updatedUserIds.push(userId);
        }
        return { ...c, userIds: updatedUserIds };
      }
      return c;
    }));
  };

  const handleLeaveWorkspace = (workspaceId: string) => {
    // Remove user from workspace userIds
    setWorkspaces(prev => prev.map(ws => {
      if (ws.id === workspaceId) {
        const updatedUserIds = ws.userIds ? ws.userIds.filter(id => id !== currentUser.id) : [];
        return {
          ...ws,
          membersCount: updatedUserIds.length,
          userIds: updatedUserIds
        };
      }
      return ws;
    }));

    // Remove user from all channels inside this workspace
    setChannels(prev => prev.map(c => {
      if (c.workspaceId === workspaceId) {
        const updatedUserIds = c.userIds ? c.userIds.filter(id => id !== currentUser.id) : [];
        return { ...c, userIds: updatedUserIds };
      }
      return c;
    }));

    // Return to dashboard
    setCurrentView('dashboard');
    setActiveWorkspaceId('');
    setActiveChannelId('');
  };

  const handleLeaveChannel = (channelId: string) => {
    setChannels(prev => {
      const updated = prev.map(c => {
        if (c.id === channelId) {
          const updatedUserIds = c.userIds ? c.userIds.filter(id => id !== currentUser.id) : [];
          return { ...c, userIds: updatedUserIds };
        }
        return c;
      });

      // Find the next active channel in the same workspace that the user is still a member of
      const wsChannels = updated.filter(c => c.workspaceId === activeWorkspaceId && (c.userIds?.includes(currentUser.id) ?? false));
      const generalChannel = wsChannels.find(c => c.name === 'general') || wsChannels[0];
      if (generalChannel) {
        setActiveChannelId(generalChannel.id);
      } else {
        setActiveChannelId('');
      }

      return updated;
    });
  };

  const handleLogout = () => {
    // Simulating logout by redirecting to dashboard and resetting state
    setCurrentView('dashboard');
    setActiveWorkspaceId('');
    setActiveChannelId('');
  };

  const handleSendMessage = (content: string) => {
    if (!activeChannelId) return;
    const newMsg: Message = {
      id: `m-${Date.now()}`,
      channelId: activeChannelId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content,
      timestamp: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, newMsg]);

    // Simulate typing indicator and response from bot/recipient
    const currentChan = channels.find(c => c.id === activeChannelId);
    if (currentChan) {
      let respondentName = '';
      let respondentAvatar = '';
      let respondentId = '';
      if (currentChan.type === 'dm') {
        const otherUser = users.find(u => u.id === currentChan.recipientId);
        if (otherUser) {
          respondentName = otherUser.name;
          respondentAvatar = otherUser.avatar;
          respondentId = otherUser.id;
        }
      } else {
        // Pick a random member from mock users
        const randUser = users[Math.floor(Math.random() * users.length)];
        respondentName = randUser.name;
        respondentAvatar = randUser.avatar;
        respondentId = randUser.id;
      }

      if (respondentName) {
        // Trigger simulated typing event in 800ms
        setTimeout(() => {
          setTyping(prev => {
            if (prev.includes(respondentName)) return prev;
            return [...prev, respondentName];
          });
          
          // Reply in 2.5 seconds
          setTimeout(() => {
            setTyping(prev => prev.filter(name => name !== respondentName));
            
            const replyMsg: Message = {
              id: `m-reply-${Date.now()}`,
              channelId: activeChannelId,
              senderId: respondentId,
              senderName: respondentName,
              senderAvatar: respondentAvatar,
              content: getSimulatedResponse(content, currentChan.name),
              timestamp: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              reactions: []
            };
            setMessages(prev => [...prev, replyMsg]);

            if (activeChannelIdRef.current !== replyMsg.channelId) {
              setUnreadCounts(prev => ({
                ...prev,
                [replyMsg.channelId]: (prev[replyMsg.channelId] || 0) + 1,
              }));
            }
          }, 2000);
        }, 800);
      }
    }
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id !== messageId) return msg;
      
      const reactions = msg.reactions ? [...msg.reactions] : [];
      const reactIndex = reactions.findIndex(r => r.emoji === emoji);
      
      if (reactIndex > -1) {
        const reaction = reactions[reactIndex];
        const userIndex = reaction.users.indexOf(currentUser.id);
        if (userIndex > -1) {
          // Remove reaction if user already reacted
          const newUsers = reaction.users.filter(u => u !== currentUser.id);
          if (newUsers.length === 0) {
            reactions.splice(reactIndex, 1);
          } else {
            reactions[reactIndex] = {
              ...reaction,
              count: reaction.count - 1,
              users: newUsers,
            };
          }
        } else {
          // Add user to reaction
          reactions[reactIndex] = {
            ...reaction,
            count: reaction.count + 1,
            users: [...reaction.users, currentUser.id],
          };
        }
      } else {
        // Create new reaction
        reactions.push({
          emoji,
          count: 1,
          users: [currentUser.id],
        });
      }
      
      return { ...msg, reactions };
    }));
  };

  const handleTogglePin = (messageId: string) => {
    setMessages(prev =>
      prev.map(m => (m.id === messageId ? { ...m, isPinned: !m.isPinned } : m))
    );
  };

  const targetWorkspace = workspaces.find(w => w.id === pendingInviteId);
  const isAlreadyMember = targetWorkspace?.userIds?.includes(currentUser.id);

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans relative">
      
      {pendingInviteId ? (
        <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-950 text-slate-100 p-6 relative overflow-hidden select-none">
          {/* Background glow decorations */}
          <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-8 md:p-10 rounded-3xl w-full max-w-md text-center shadow-2xl relative animate-[scaleIn_0.25s_ease-out] z-10">
            
            {/* Logo */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 font-extrabold text-white text-xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30 border border-indigo-400/20">
              {targetWorkspace?.logo || 'WS'}
            </div>

            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight mb-2">Workspace Invitation</h3>
            
            {targetWorkspace ? (
              <>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-6">
                  You've been invited to join <span className="text-indigo-400 font-bold">{targetWorkspace.name}</span>. 
                  {targetWorkspace.description && <span className="block mt-2 italic text-slate-400">"{targetWorkspace.description}"</span>}
                </p>

                {isAlreadyMember ? (
                  <div className="space-y-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-xs font-semibold text-emerald-400 flex items-center justify-center gap-2">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping shrink-0" />
                      You are already a member of this workspace.
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => setPendingInviteId(null)}
                        className="flex-1 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-slate-200 transition cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => {
                          setActiveWorkspaceId(pendingInviteId);
                          const wsChannels = channels.filter(c => c.workspaceId === pendingInviteId);
                          const generalChannel = wsChannels.find(c => c.name === 'general') || wsChannels[0];
                          if (generalChannel) setActiveChannelId(generalChannel.id);
                          setCurrentView('workspace');
                          setPendingInviteId(null);
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition cursor-pointer"
                      >
                        Enter Workspace
                      </button>
                    </div>
                  </div>
                ) : (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAcceptInvite(pendingInviteId, guestName);
                    }}
                    className="space-y-4 text-left"
                  >
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5 px-1">
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Jane Doe"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition"
                        required
                        autoFocus
                      />
                    </div>

                    <div className="flex gap-3 pt-3">
                      <button 
                        type="button"
                        onClick={() => {
                          setPendingInviteId(null);
                          setGuestName('');
                        }}
                        className="flex-1 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-slate-200 transition cursor-pointer"
                      >
                        Decline
                      </button>
                      
                      <button 
                        type="submit"
                        className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition cursor-pointer"
                      >
                        Accept & Join
                      </button>
                    </div>
                  </form>
                )}
              </>
            ) : (
              <div>
                <p className="text-sm text-red-400 font-semibold mb-6">
                  This workspace invitation link is invalid or expired.
                </p>
                <button 
                  onClick={() => setPendingInviteId(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition cursor-pointer"
                >
                  Back to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      ) : currentView === 'dashboard' ? (
        <Dashboard 
          workspaces={workspaces} 
          onSelectWorkspace={handleSelectWorkspace} 
          onCreateWorkspace={handleCreateWorkspace}
          currentUser={currentUser}
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogout={handleLogout}
          defaultShowCreateModal={dashboardOpenCreate}
        />
      ) : (
        <Workspace 
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          onSelectWorkspace={handleSelectWorkspace}
          channels={channels.filter(c => c.workspaceId === activeWorkspaceId)}
          activeChannelId={activeChannelId}
          onSelectChannel={handleSelectChannel}
          onCreateChannel={handleCreateChannel}
          onCreateDM={handleCreateDM}
          messages={messages.filter(m => m.channelId === activeChannelId)}
          onSendMessage={handleSendMessage}
          onAddReaction={handleAddReaction}
          onTogglePin={handleTogglePin}
          users={users}
          currentUser={currentUser}
          typingUsers={typing}
          onGoToDashboard={(openCreate) => {
            setCurrentView('dashboard');
            setDashboardOpenCreate(openCreate || false);
          }}
          unreadCounts={unreadCounts}
          theme={theme}
          onToggleTheme={toggleTheme}
          onJoinChannel={handleJoinChannel}
          onInviteToChannel={handleInviteToChannel}
          onLeaveWorkspace={handleLeaveWorkspace}
          onLeaveChannel={handleLeaveChannel}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

// Simple logic helper to get a response
function getSimulatedResponse(userMsg: string, channelName: string): string {
  const msg = userMsg.toLowerCase();
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return `Hey there! Glad to connect in #${channelName}. What are you working on today?`;
  }
  if (msg.includes('react 19')) {
    return `React 19 concurrent mode and server components are really shaking up frontend architectures!`;
  }
  if (msg.includes('tailwind')) {
    return `Tailwind CSS v4's direct compilation is blazing fast. The performance upgrade is noticeable.`;
  }
  if (msg.includes('socket.io') || msg.includes('websocket')) {
    return `Socket.IO makes pub/sub real-time events extremely easy to build.`;
  }
  if (msg.includes('redis')) {
    return `Redis pub/sub is essential when scaling the WebSocket servers behind a load balancer!`;
  }
  return `Interesting input! Let's keep iterating on our real-time workspace prototype. Let me know if you want to test anything else.`;
}

export default App;