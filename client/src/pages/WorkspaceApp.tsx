import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Dashboard from "./Dashboard";
import Workspace from "./Workspace";
import type { Channel, Message, User, Workspace as WorkspaceType } from "../types";
import {
  clearSession,
  createChannel,
  createWorkspace,
  fetchChannelById,
  fetchChannels,
  fetchMessagesByChannel,
  fetchProfile,
  fetchUserById,
  fetchUsers,
  fetchWorkspaces,
  getStoredUser,
  saveStoredUser,
  sendMessage,
  toApiErrorMessage,
  toChannel,
  toMessage,
  toUser,
  toWorkspace,
} from "../services/api";

interface WorkspaceAppProps {
  initialView?: "dashboard" | "workspace";
}

function WorkspaceApp({ initialView = "dashboard" }: WorkspaceAppProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: routeId = "" } = useParams();
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());
  const [workspaces, setWorkspaces] = useState<WorkspaceType[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState("");
  const [activeChannelId, setActiveChannelId] = useState("");
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [appError, setAppError] = useState("");
  const [dashboardOpenCreate, setDashboardOpenCreate] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(
    () => (localStorage.getItem("theme") as "dark" | "light") || "dark"
  );

  const isDashboardView =
    location.pathname === "/dashboard" ||
    (location.pathname === "/" && initialView === "dashboard");
  const currentView: "dashboard" | "workspace" = isDashboardView
    ? "dashboard"
    : "workspace";

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    let isCancelled = false;

    const bootstrap = async () => {
      try {
        setIsBootstrapping(true);
        setAppError("");

        let resolvedUser = getStoredUser();

        if (!resolvedUser) {
          const profile = await fetchProfile();

          if (!profile.user?.id) {
            throw new Error("Unable to resolve the current user session");
          }

          const userResponse = await fetchUserById(profile.user.id);
          resolvedUser = toUser(userResponse.data);
          saveStoredUser(resolvedUser);
        }

        const [usersResponse, workspacesResponse] = await Promise.all([
          fetchUsers(),
          fetchWorkspaces(),
        ]);

        if (isCancelled) {
          return;
        }

        const mappedUsers = usersResponse.data.map(toUser);
        const userMap = new Map(mappedUsers.map((user) => [user.id, user]));
        userMap.set(resolvedUser.id, resolvedUser);

        setCurrentUser(resolvedUser);
        setUsers(Array.from(userMap.values()));
        setWorkspaces(workspacesResponse.data.map(toWorkspace));
      } catch (error) {
        if (isCancelled) {
          return;
        }

        if (error instanceof Error && "status" in error && error.status === 401) {
          clearSession();
          navigate("/login", { replace: true });
          return;
        }

        setAppError(toApiErrorMessage(error));
      } finally {
        if (!isCancelled) {
          setIsBootstrapping(false);
        }
      }
    };

    void bootstrap();

    return () => {
      isCancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    if (isBootstrapping) {
      return;
    }

    let isCancelled = false;

    const syncRoute = async () => {
      try {
        if (location.pathname.startsWith("/workspace/")) {
          setActiveWorkspaceId(routeId);
          setActiveChannelId("");
          setMessages([]);
          return;
        }

        if (location.pathname.startsWith("/channel/")) {
          const response = await fetchChannelById(routeId);

          if (isCancelled) {
            return;
          }

          const mappedChannel = toChannel(response.data);
          setActiveWorkspaceId(mappedChannel.workspaceId);
          setActiveChannelId(mappedChannel.id);
          return;
        }

        setActiveWorkspaceId("");
        setActiveChannelId("");
        setMessages([]);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setAppError(toApiErrorMessage(error));
      }
    };

    void syncRoute();

    return () => {
      isCancelled = true;
    };
  }, [isBootstrapping, location.pathname, routeId]);

  useEffect(() => {
    if (!activeWorkspaceId) {
      setChannels([]);
      return;
    }

    let isCancelled = false;

    const loadChannels = async () => {
      try {
        setAppError("");
        const response = await fetchChannels(activeWorkspaceId);

        if (isCancelled) {
          return;
        }

        setChannels(response.data.map(toChannel));
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setAppError(toApiErrorMessage(error));
      }
    };

    void loadChannels();

    return () => {
      isCancelled = true;
    };
  }, [activeWorkspaceId]);

  useEffect(() => {
    if (!activeChannelId) {
      setMessages([]);
      return;
    }

    let isCancelled = false;

    const loadMessages = async () => {
      try {
        setAppError("");
        const response = await fetchMessagesByChannel(activeChannelId);

        if (isCancelled) {
          return;
        }

        setMessages(response.data.map(toMessage));
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setAppError(toApiErrorMessage(error));
      }
    };

    void loadMessages();

    return () => {
      isCancelled = true;
    };
  }, [activeChannelId]);

  const visibleChannels = useMemo(
    () => channels.filter((channel) => channel.workspaceId === activeWorkspaceId),
    [activeWorkspaceId, channels]
  );

  const toggleTheme = () => {
    setTheme((previousTheme) =>
      previousTheme === "dark" ? "light" : "dark"
    );
  };

  const handleSelectWorkspace = (id: string) => {
    setActiveWorkspaceId(id);
    setActiveChannelId("");
    setMessages([]);
    navigate(`/workspace/${id}`);
  };

  const handleSelectChannel = (id: string) => {
    setActiveChannelId(id);
    navigate(`/channel/${id}`);
  };

  const handleCreateWorkspace = async (name: string, description: string) => {
    try {
      setAppError("");
      const response = await createWorkspace({ name, description });
      const workspace = toWorkspace(response.data);

      setWorkspaces((previousWorkspaces) => [...previousWorkspaces, workspace]);
      setDashboardOpenCreate(false);
      navigate(`/workspace/${workspace.id}`);
    } catch (error) {
      setAppError(toApiErrorMessage(error));
      throw error;
    }
  };

  const handleCreateChannel = async (
    name: string,
    description: string,
    isPrivate: boolean
  ) => {
    try {
      if (!activeWorkspaceId) {
        throw new Error("Select a workspace before creating a channel");
      }

      setAppError("");
      const response = await createChannel({
        name: name.toLowerCase().replace(/\s+/g, "-"),
        description,
        workspaceId: activeWorkspaceId,
        isPrivate,
      });
      const channel = toChannel(response.data);

      setChannels((previousChannels) => [...previousChannels, channel]);
      navigate(`/channel/${channel.id}`);
    } catch (error) {
      setAppError(toApiErrorMessage(error));
      throw error;
    }
  };

  const handleSendMessage = async (content: string) => {
    try {
      if (!activeChannelId) {
        throw new Error("Select a channel before sending a message");
      }

      setAppError("");
      const response = await sendMessage({
        content,
        channelId: activeChannelId,
      });
      const message = toMessage(response.data);

      setMessages((previousMessages) => [...previousMessages, message]);
    } catch (error) {
      setAppError(toApiErrorMessage(error));
      throw error;
    }
  };

  const handleCreateDM = (_recipientId: string) => {
    setAppError("Direct messages are not connected to backend APIs in this build.");
  };

  const handleJoinChannel = (channelId: string) => {
    handleSelectChannel(channelId);
  };

  const handleInviteToChannel = (_channelId: string, _userId: string) => {
    setAppError("Channel invite updates are not connected to a backend endpoint.");
  };

  const handleLeaveWorkspace = (_workspaceId: string) => {
    navigate("/dashboard");
  };

  const handleLeaveChannel = (_channelId: string) => {
    if (activeWorkspaceId) {
      navigate(`/workspace/${activeWorkspaceId}`);
    }
  };

  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
    navigate("/login", { replace: true });
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    if (!currentUser) {
      return;
    }

    setMessages((previousMessages) =>
      previousMessages.map((message) => {
        if (message.id !== messageId) {
          return message;
        }

        const reactions = message.reactions ? [...message.reactions] : [];
        const reactionIndex = reactions.findIndex(
          (reaction) => reaction.emoji === emoji
        );

        if (reactionIndex >= 0) {
          const reaction = reactions[reactionIndex];
          const hasReacted = reaction.users.includes(currentUser.id);

          if (hasReacted) {
            const nextUsers = reaction.users.filter(
              (userId) => userId !== currentUser.id
            );

            if (nextUsers.length === 0) {
              reactions.splice(reactionIndex, 1);
            } else {
              reactions[reactionIndex] = {
                ...reaction,
                count: reaction.count - 1,
                users: nextUsers,
              };
            }
          } else {
            reactions[reactionIndex] = {
              ...reaction,
              count: reaction.count + 1,
              users: [...reaction.users, currentUser.id],
            };
          }
        } else {
          reactions.push({
            emoji,
            count: 1,
            users: [currentUser.id],
          });
        }

        return { ...message, reactions };
      })
    );
  };

  const handleTogglePin = (messageId: string) => {
    setMessages((previousMessages) =>
      previousMessages.map((message) =>
        message.id === messageId
          ? { ...message, isPinned: !message.isPinned }
          : message
      )
    );
  };

  if (isBootstrapping || !currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-300">
        Loading workspace...
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {appError ? (
        <div className="absolute left-4 right-4 top-4 z-50 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {appError}
        </div>
      ) : null}

      {currentView === "dashboard" ? (
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
          channels={visibleChannels}
          activeChannelId={activeChannelId}
          onSelectChannel={handleSelectChannel}
          onCreateChannel={handleCreateChannel}
          onCreateDM={handleCreateDM}
          messages={messages}
          onSendMessage={handleSendMessage}
          onAddReaction={handleAddReaction}
          onTogglePin={handleTogglePin}
          users={users}
          currentUser={currentUser}
          typingUsers={[]}
          onGoToDashboard={(openCreate) => {
            setDashboardOpenCreate(Boolean(openCreate));
            navigate("/dashboard");
          }}
          unreadCounts={{}}
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

export default WorkspaceApp;
