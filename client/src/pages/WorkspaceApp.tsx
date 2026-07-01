import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import Workspace from './Workspace';
import { currentUser as mockCurrentUser } from '../data/mockData';
import type { Workspace as WorkspaceType, Channel, Message, User } from '../types';
import { authService, workspaceService, channelService, messageService } from '../services/api';
import { useSocket } from '../contexts/SocketContext';

interface WorkspaceAppProps {
    initialView?: 'dashboard' | 'workspace';
}

function WorkspaceApp({ initialView = 'dashboard' }: WorkspaceAppProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const [currentView, setCurrentView] = useState<'dashboard' | 'workspace'>(() =>
        location.pathname === '/workspace' ? 'workspace' : initialView
    );
    const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('');
    const [activeChannelId, setActiveChannelId] = useState<string>('');
    const [workspaces, setWorkspaces] = useState<WorkspaceType[]>([]);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [typing, setTyping] = useState<string[]>([]);
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
    const [pendingInviteId, setPendingInviteId] = useState<string | null>(null);
    const [guestName, setGuestName] = useState<string>('');
    const [dashboardOpenCreate, setDashboardOpenCreate] = useState(false);
    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    });
    const [currentUser] = useState<User>(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                return {
                    id: parsed._id || parsed.id || 'user-infotact',
                    name: parsed.name || 'Infotact Solution',
                    avatar: parsed.avatar || (parsed.name ? parsed.name.slice(0, 2).toUpperCase() : 'IS'),
                    status: parsed.status || 'online',
                    role: (parsed.role === 'admin' || parsed.role === 'Admin') ? 'Admin' : 'Member',
                    email: parsed.email || 'info@infotact.com'
                };
            } catch (e) {
                // fallback
            }
        }
        return mockCurrentUser;
    });

    const { joinChannel, leaveChannel, startTyping, stopTyping, socket } = useSocket();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    // Load users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const u = await authService.getAllUsers();
                const mappedUsers = u.map((user: any) => ({
                    id: user._id,
                    name: user.name,
                    avatar: user.avatar || user.name.slice(0, 2).toUpperCase(),
                    status: "online",
                    role: user.role === "admin" ? "Admin" : "Member",
                    email: user.email,
                }));
                setUsers(mappedUsers);
            } catch (err) {
                console.error("Failed to load users", err);
            }
        };
        fetchUsers();
    }, []);

    // Load workspaces
    useEffect(() => {
        const fetchWorkspaces = async () => {
            try {
                const ws = await workspaceService.getAll();
                const mappedWorkspaces = ws.map((w: any) => ({
                    id: w._id,
                    name: w.name,
                    description: w.description || "",
                    logo: w.name.split(' ').map((word: string) => word[0]).join('').toUpperCase().slice(0, 2) || "WS",
                    membersCount: w.members?.length || 0,
                    userIds: w.members?.map((m: any) => m._id || m) || [],
                }));
                setWorkspaces(mappedWorkspaces);
                
                if (mappedWorkspaces.length > 0) {
                    if (!activeWorkspaceId || !mappedWorkspaces.some((w: any) => w.id === activeWorkspaceId)) {
                        setActiveWorkspaceId(mappedWorkspaces[0].id);
                    }
                }
            } catch (err) {
                console.error("Failed to load workspaces", err);
            }
        };
        fetchWorkspaces();
    }, [currentUser, activeWorkspaceId]);

    // Load channels of the active workspace
    useEffect(() => {
        if (!activeWorkspaceId) return;
        const fetchChannels = async () => {
            try {
                const chs = await channelService.getAll(activeWorkspaceId);
                const mappedChannels = chs.map((c: any) => ({
                    id: c._id,
                    workspaceId: c.workspaceId?._id || c.workspaceId,
                    name: c.name,
                    description: c.description || "",
                    isPrivate: c.isPrivate || false,
                    type: c.type || "channel",
                    recipientId: c.recipientId?._id || c.recipientId || undefined,
                    userIds: c.members?.map((m: any) => m._id || m) || [],
                }));
                setChannels(mappedChannels);

                if (mappedChannels.length > 0) {
                    const hasActive = mappedChannels.some((c: any) => c.id === activeChannelId);
                    if (!hasActive) {
                        setActiveChannelId(mappedChannels[0].id);
                    }
                } else {
                    setActiveChannelId("");
                }
            } catch (err) {
                console.error("Failed to load channels", err);
            }
        };
        fetchChannels();
    }, [activeWorkspaceId, activeChannelId]);

    // Load messages of active channel
    useEffect(() => {
        if (!activeChannelId) {
            setMessages([]);
            return;
        }
        const fetchMessages = async () => {
            try {
                const msgs = await messageService.getByChannel(activeChannelId);
                const mappedMessages = msgs.map((m: any) => ({
                    id: m._id,
                    channelId: m.channelId?._id || m.channelId,
                    senderId: m.sender?._id || m.sender,
                    senderName: m.sender?.name || "Unknown",
                    senderAvatar: m.sender?.avatar || m.sender?.name?.slice(0, 2).toUpperCase() || "U",
                    content: m.content,
                    timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", " + new Date(m.createdAt).toLocaleDateString([], { month: "short", day: "numeric" }),
                    reactions: m.reactions?.map((r: any) => ({
                        emoji: r.emoji,
                        count: r.count,
                        users: r.users?.map((u: any) => u._id || u) || [],
                    })) || [],
                    isPinned: m.isPinned || false,
                    threadRepliesCount: m.threadRepliesCount || 0,
                }));
                setMessages(mappedMessages);
            } catch (err) {
                console.error("Failed to load messages", err);
            }
        };
        fetchMessages();
    }, [activeChannelId]);

    // Join/Leave Channel Room via WebSocket
    useEffect(() => {
        if (activeChannelId) {
            joinChannel(activeChannelId);
            return () => {
                leaveChannel(activeChannelId);
            };
        }
    }, [activeChannelId]);

    // Listen to real-time events
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (payload: { channelId: string; message: any }) => {
            if (payload.channelId === activeChannelId) {
                const m = payload.message;
                const newMsg = {
                    id: m._id,
                    channelId: m.channelId?._id || m.channelId,
                    senderId: m.sender?._id || m.sender,
                    senderName: m.sender?.name || "Unknown",
                    senderAvatar: m.sender?.avatar || m.sender?.name?.slice(0, 2).toUpperCase() || "U",
                    content: m.content,
                    timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", " + new Date(m.createdAt).toLocaleDateString([], { month: "short", day: "numeric" }),
                    reactions: m.reactions?.map((r: any) => ({
                        emoji: r.emoji,
                        count: r.count,
                        users: r.users?.map((u: any) => u._id || u) || [],
                    })) || [],
                    isPinned: m.isPinned || false,
                    threadRepliesCount: m.threadRepliesCount || 0,
                };
                setMessages((prev) => {
                    if (prev.some((msg) => msg.id === newMsg.id)) return prev;
                    return [...prev, newMsg];
                });
            } else {
                setUnreadCounts((prev) => ({
                    ...prev,
                    [payload.channelId]: (prev[payload.channelId] || 0) + 1,
                }));
            }
        };

        const handleDeletedMessage = (payload: { channelId: string; messageId: string }) => {
            if (payload.channelId === activeChannelId) {
                setMessages((prev) => prev.filter((msg) => msg.id !== payload.messageId));
            }
        };

        const handleUpdatedMessage = (message: any) => {
            const chanId = message.channelId?._id || message.channelId;
            if (chanId === activeChannelId) {
                const updatedMsg = {
                    id: message._id,
                    channelId: chanId,
                    senderId: message.sender?._id || message.sender,
                    senderName: message.sender?.name || "Unknown",
                    senderAvatar: message.sender?.avatar || message.sender?.name?.slice(0, 2).toUpperCase() || "U",
                    content: message.content,
                    timestamp: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", " + new Date(message.createdAt).toLocaleDateString([], { month: "short", day: "numeric" }),
                    reactions: message.reactions?.map((r: any) => ({
                        emoji: r.emoji,
                        count: r.count,
                        users: r.users?.map((u: any) => u._id || u) || [],
                    })) || [],
                    isPinned: message.isPinned || false,
                    threadRepliesCount: message.threadRepliesCount || 0,
                };
                setMessages((prev) => prev.map((msg) => (msg.id === updatedMsg.id ? updatedMsg : msg)));
            }
        };

        const handleTypingStart = ({ channelId, userName }: { channelId: string; userName: string }) => {
            if (channelId === activeChannelId) {
                setTyping((prev) => {
                    if (prev.includes(userName)) return prev;
                    return [...prev, userName];
                });
            }
        };

        const handleTypingStop = ({ channelId, userName }: { channelId: string; userName: string }) => {
            if (channelId === activeChannelId) {
                setTyping((prev) => prev.filter((name) => name !== userName));
            }
        };

        socket.on("message:created", handleNewMessage);
        socket.on("message:deleted", handleDeletedMessage);
        socket.on("message:updated", handleUpdatedMessage);
        socket.on("typing:start", handleTypingStart);
        socket.on("typing:stop", handleTypingStop);

        return () => {
            socket.off("message:created", handleNewMessage);
            socket.off("message:deleted", handleDeletedMessage);
            socket.off("message:updated", handleUpdatedMessage);
            socket.off("typing:start", handleTypingStart);
            socket.off("typing:stop", handleTypingStop);
        };
    }, [socket, activeChannelId]);

    // Handle theme toggle
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

    // Handle view location sync
    useEffect(() => {
        if (location.pathname === '/workspace') {
            setCurrentView('workspace');
            return;
        }
        if (location.pathname === '/dashboard' || location.pathname === '/workspaceapp') {
            setCurrentView('dashboard');
        }
    }, [location.pathname]);

    useEffect(() => {
        const targetPath = currentView === 'workspace' ? '/workspace' : '/dashboard';
        if (location.pathname !== targetPath) {
            navigate({ pathname: targetPath, search: location.search }, { replace: true });
        }
    }, [currentView, location.pathname, location.search, navigate]);

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
        const params = new URLSearchParams(location.search);
        const joinId = params.get('join');
        if (joinId) {
            setPendingInviteId(joinId);
            navigate(location.pathname, { replace: true });
        }
    }, [location.pathname, location.search, navigate]);

    // Actions
    const handleSelectWorkspace = (id: string) => {
        setActiveWorkspaceId(id);
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

    const handleCreateWorkspace = async (name: string, description: string) => {
        try {
            const newWs = await workspaceService.create(name, description, currentUser.id);
            const mappedWs: WorkspaceType = {
                id: newWs._id,
                name: newWs.name,
                description: newWs.description || "",
                logo: newWs.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) || "WS",
                membersCount: newWs.members?.length || 0,
                userIds: newWs.members?.map((m: any) => m._id || m) || [],
            };
            setWorkspaces(prev => [...prev, mappedWs]);

            // Set active workspace (automatically selects general channel created on the backend)
            setActiveWorkspaceId(mappedWs.id);
            setDashboardOpenCreate(false);
            setCurrentView('workspace');
        } catch (err) {
            console.error("Failed to create workspace", err);
        }
    };

    const handleAcceptInvite = (workspaceId: string, nameToJoin: string, existingUserId?: string) => {
        if (!nameToJoin.trim()) return;

        let targetUserId = existingUserId;

        if (!targetUserId) {
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

            setUsers(prev => [...prev, newGuestUser]);
        }

        const finalUserId = targetUserId;

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

    const handleCreateChannel = async (name: string, description: string, isPrivate: boolean) => {
        try {
            const formattedName = name.toLowerCase().replace(/\s+/g, '-');
            const newChan = await channelService.create({
                name: formattedName,
                description,
                workspaceId: activeWorkspaceId,
                createdBy: currentUser.id,
                isPrivate,
                type: "channel",
                members: [currentUser.id]
            });
            const mappedChan: Channel = {
                id: newChan._id,
                workspaceId: newChan.workspaceId?._id || newChan.workspaceId,
                name: newChan.name,
                description: newChan.description || "",
                isPrivate: newChan.isPrivate || false,
                type: newChan.type || "channel",
                userIds: newChan.members?.map((m: any) => m._id || m) || [],
            };
            setChannels(prev => [...prev, mappedChan]);
            setActiveChannelId(mappedChan.id);
        } catch (err) {
            console.error("Failed to create channel", err);
        }
    };

    const handleCreateDM = async (recipientId: string) => {
        const recipient = users.find(u => u.id === recipientId);
        if (!recipient) return;

        const existing = channels.find(
            c => c.workspaceId === activeWorkspaceId && c.type === 'dm' && c.recipientId === recipientId
        );
        if (existing) {
            setActiveChannelId(existing.id);
            return;
        }

        try {
            const newChan = await channelService.create({
                name: recipient.name,
                description: `Direct message with ${recipient.name}`,
                workspaceId: activeWorkspaceId,
                createdBy: currentUser.id,
                isPrivate: true,
                type: "dm",
                recipientId,
                members: [currentUser.id, recipientId]
            });
            const mappedChan: Channel = {
                id: newChan._id,
                workspaceId: newChan.workspaceId?._id || newChan.workspaceId,
                name: newChan.name,
                description: newChan.description || "",
                isPrivate: newChan.isPrivate || false,
                type: newChan.type || "dm",
                recipientId: newChan.recipientId?._id || newChan.recipientId || undefined,
                userIds: newChan.members?.map((m: any) => m._id || m) || [],
            };
            setChannels(prev => [...prev, mappedChan]);
            setActiveChannelId(mappedChan.id);
        } catch (err) {
            console.error("Failed to create DM channel", err);
        }
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

        setChannels(prev => prev.map(c => {
            if (c.workspaceId === workspaceId) {
                const updatedUserIds = c.userIds ? c.userIds.filter(id => id !== currentUser.id) : [];
                return { ...c, userIds: updatedUserIds };
            }
            return c;
        }));

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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentView('dashboard');
        setActiveWorkspaceId('');
        setActiveChannelId('');
        setPendingInviteId(null);
        setGuestName('');
        navigate('/login');
    };

    const handleSendMessage = async (content: string) => {
        if (!activeChannelId) return;
        try {
            await messageService.send({
                content,
                sender: currentUser.id,
                channelId: activeChannelId,
            });
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    const handleAddReaction = async (messageId: string, emoji: string) => {
        try {
            await messageService.react(messageId, emoji, currentUser.id);
        } catch (err) {
            console.error("Failed to add reaction", err);
        }
    };

    const handleTogglePin = async (messageId: string) => {
        try {
            await messageService.togglePin(messageId);
        } catch (err) {
            console.error("Failed to toggle pin", err);
        }
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
                    activeWorkspaceId={activeWorkspaceId}
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

export default WorkspaceApp;
