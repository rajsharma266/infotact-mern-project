import { useState } from 'react';
import type { Workspace as WorkspaceType, Channel, Message, User } from '../types';
import WorkspaceSidebar from '../components/Workspace/WorkspaceSidebar';
import ChannelPanel from '../components/Workspace/ChannelPanel';
import ChatArea from '../components/Workspace/ChatArea';
import MembersList from '../components/Workspace/MembersList';
import ProfileDrawer from '../components/Workspace/ProfileDrawer';
import PinnedPanel from '../components/Workspace/PinnedPanel';

interface WorkspaceProps {
  workspaces: WorkspaceType[];
  activeWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  channels: Channel[];
  activeChannelId: string;
  onSelectChannel: (id: string) => void;
  onCreateChannel: (name: string, desc: string, isPrivate: boolean) => void;
  onCreateDM: (recipientId: string) => void;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  users: User[];
  currentUser: User;
  typingUsers: string[];
  onGoToDashboard: (openCreate?: boolean) => void;
  unreadCounts?: Record<string, number>;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onJoinChannel?: (id: string) => void;
  onInviteToChannel?: (channelId: string, userId: string) => void;
  onLeaveWorkspace?: (workspaceId: string) => void;
  onLeaveChannel?: (channelId: string) => void;
  onLogout?: () => void;
  onTogglePin: (messageId: string) => void;
  onDeleteMessage: (messageId: string) => void;
}

function Workspace({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  channels,
  activeChannelId,
  onSelectChannel,
  onCreateChannel,
  onCreateDM,
  messages,
  onSendMessage,
  onAddReaction,
  users,
  currentUser,
  typingUsers,
  onGoToDashboard,
  unreadCounts,
  theme,
  onToggleTheme,
  onJoinChannel,
  onInviteToChannel,
  onLeaveWorkspace,
  onLeaveChannel,
  onLogout,
  onTogglePin,
  onDeleteMessage,
}: WorkspaceProps) {
  const [showMembersPanel, setShowMembersPanel] = useState<boolean>(false);
  const [showProfilePanel, setShowProfilePanel] = useState<boolean>(false);
  const [showPinnedPanel, setShowPinnedPanel] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Active items
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);
  const activeChannel = channels.find((c) => c.id === activeChannelId);

  // Filter users to only include members of this workspace
  const workspaceMembers = users.filter((u) => activeWorkspace?.userIds?.includes(u.id) ?? true);

  // Filter users to only include members of this channel
  const channelMembers = workspaceMembers.filter((u) => activeChannel?.userIds?.includes(u.id) ?? true);

  // Toggle handlers that ensure only one right-side drawer panel is open at a time
  const toggleMembersList = () => {
    setShowMembersPanel(prev => !prev);
    setShowProfilePanel(false);
    setShowPinnedPanel(false);
  };

  const toggleProfilePanel = () => {
    setShowProfilePanel(prev => !prev);
    setShowMembersPanel(false);
    setShowPinnedPanel(false);
  };

  const togglePinnedPanel = () => {
    setShowPinnedPanel(prev => !prev);
    setShowMembersPanel(false);
    setShowProfilePanel(false);
  };

  return (
    <div className="flex-1 flex h-screen bg-slate-950 text-slate-100 overflow-hidden relative">
      
      {/* 1. WORKSPACE SELECTOR BAR (DESKTOP ONLY) */}
      <div className="hidden md:flex">
        <WorkspaceSidebar
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          onSelectWorkspace={onSelectWorkspace}
          onGoToDashboard={onGoToDashboard}
        />
      </div>

      {/* 2. CHANNELS PANEL (DESKTOP & MOBILE TRANSITION SHEET) */}
      <div className="hidden md:flex">
        <ChannelPanel
          workspaceId={activeWorkspaceId}
          workspaceName={activeWorkspace?.name || 'Workspace'}
          channels={channels}
          activeChannelId={activeChannelId}
          onSelectChannel={onSelectChannel}
          onCreateChannel={onCreateChannel}
          onCreateDM={onCreateDM}
          users={workspaceMembers}
          currentUser={currentUser}
          onGoToDashboard={onGoToDashboard}
          unreadCounts={unreadCounts}
          onJoinChannel={onJoinChannel}
          onLeaveWorkspace={onLeaveWorkspace}
        />
      </div>

      {/* MOBILE COLLAPSIBLE CHANNELS NAV (Drawer Overlay) */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden bg-slate-950/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="flex h-full animate-[slideInLeft_0.2s_ease-out]">
            {/* Minimal workspaces sidebar on mobile drawer */}
            <WorkspaceSidebar
              workspaces={workspaces}
              activeWorkspaceId={activeWorkspaceId}
              onSelectWorkspace={onSelectWorkspace}
              onGoToDashboard={onGoToDashboard}
              onClickWorkspace={() => {}}
            />
            {/* Main channels panel list */}
            <ChannelPanel
              workspaceId={activeWorkspaceId}
              workspaceName={activeWorkspace?.name || 'Workspace'}
              channels={channels}
              activeChannelId={activeChannelId}
              onSelectChannel={(id) => {
                onSelectChannel(id);
                setMobileSidebarOpen(false);
              }}
              onCreateChannel={onCreateChannel}
              onCreateDM={onCreateDM}
              users={workspaceMembers}
              currentUser={currentUser}
              onGoToDashboard={onGoToDashboard}
              unreadCounts={unreadCounts}
              onJoinChannel={onJoinChannel}
              onLeaveWorkspace={onLeaveWorkspace}
            />
          </div>
          {/* Backdrop click to close */}
          <div 
            className="flex-1"
            onClick={() => setMobileSidebarOpen(false)}
          />
        </div>
      )}

      {/* 3. CHAT WRAPPER AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900/40 border-r border-slate-800/60">
        <ChatArea
          activeChannel={activeChannel}
          messages={messages}
          onSendMessage={onSendMessage}
          onAddReaction={onAddReaction}
          onTogglePin={onTogglePin}
          onDeleteMessage={onDeleteMessage}
          typingUsers={typingUsers}
          toggleMembersList={toggleMembersList}
          showMembersList={showMembersPanel}
          toggleProfilePanel={toggleProfilePanel}
          showProfilePanel={showProfilePanel}
          togglePinnedPanel={togglePinnedPanel}
          showPinnedPanel={showPinnedPanel}
          toggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          currentUser={currentUser}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onLeaveChannel={onLeaveChannel}
        />
      </div>

      {/* 4. DETAILS DRAWER BAR (RIGHT DRAWER) */}
      {showMembersPanel && activeChannel && (
        <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full absolute right-0 top-0 bottom-0 z-30 md:static md:z-0 shadow-2xl md:shadow-none animate-[slideInRight_0.2s_ease-out]">
          <MembersList
            channelId={activeChannel.id}
            channelName={activeChannel.name}
            channelDescription={activeChannel.description}
            isPrivate={activeChannel.isPrivate}
            type={activeChannel.type}
            users={channelMembers}
            allWorkspaceUsers={workspaceMembers}
            onClose={() => setShowMembersPanel(false)}
            onInviteToChannel={onInviteToChannel}
            createdAt={activeChannel.createdAt}
            createdBy={activeChannel.createdBy}
          />
        </div>
      )}

      {/* PROFILE DRAWER (RIGHT DRAWER) */}
      {showProfilePanel && (
        <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full absolute right-0 top-0 bottom-0 z-30 md:static md:z-0 shadow-2xl md:shadow-none animate-[slideInRight_0.2s_ease-out]">
          <ProfileDrawer 
            user={currentUser}
            onClose={() => setShowProfilePanel(false)}
            onLogout={onLogout || (() => {})}
          />
        </div>
      )}

      {/* PINNED MESSAGES DRAWER (RIGHT DRAWER) */}
      {showPinnedPanel && activeChannel && (
        <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full absolute right-0 top-0 bottom-0 z-30 md:static md:z-0 shadow-2xl md:shadow-none animate-[slideInRight_0.2s_ease-out]">
          <PinnedPanel 
            channelName={activeChannel.name}
            pinnedMessages={messages.filter(m => m.channelId === activeChannel.id && m.isPinned)}
            onClose={() => setShowPinnedPanel(false)}
            onTogglePin={onTogglePin}
          />
        </div>
      )}
    </div>
  );
}

export default Workspace;