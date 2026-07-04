import { useState, useEffect } from 'react';
import type { Channel, Message, User } from '../../types';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import EmptyState from './EmptyState';
import { Search } from 'lucide-react';

interface ChatAreaProps {
  activeChannel: Channel | undefined;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  typingUsers: string[];
  toggleMembersList: () => void;
  showMembersList: boolean;
  toggleProfilePanel: () => void;
  showProfilePanel: boolean;
  togglePinnedPanel: () => void;
  showPinnedPanel: boolean;
  toggleMobileSidebar: () => void;
  currentUser: User;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onLeaveChannel?: (channelId: string) => void;
  onTogglePin: (messageId: string) => void;
  onDeleteMessage: (messageId: string) => void;
}

function ChatArea({
  activeChannel,
  messages,
  onSendMessage,
  onAddReaction,
  typingUsers,
  toggleMembersList,
  showMembersList,
  toggleProfilePanel,
  showProfilePanel,
  togglePinnedPanel,
  showPinnedPanel,
  toggleMobileSidebar,
  currentUser,
  theme,
  onToggleTheme,
  onLeaveChannel,
  onTogglePin,
  onDeleteMessage,
}: ChatAreaProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Clear search query when channel switches
  useEffect(() => {
    setSearchQuery('');
  }, [activeChannel?.id]);

  const filteredMessages = searchQuery
    ? messages.filter(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  return (
    <div className="flex flex-col flex-1 h-full min-w-0 bg-slate-900/10">
      
      {/* 1. Chat Header */}
      <ChatHeader
        channelId={activeChannel?.id}
        channelName={activeChannel?.name}
        channelDescription={activeChannel?.description}
        isPrivate={activeChannel?.isPrivate}
        type={activeChannel?.type}
        toggleMembersList={toggleMembersList}
        showMembersList={showMembersList}
        toggleProfilePanel={toggleProfilePanel}
        showProfilePanel={showProfilePanel}
        togglePinnedPanel={togglePinnedPanel}
        showPinnedPanel={showPinnedPanel}
        toggleMobileSidebar={toggleMobileSidebar}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        theme={theme}
        onToggleTheme={onToggleTheme}
        currentUser={currentUser}
        onLeaveChannel={onLeaveChannel}
      />

      {/* 2. Chat Contents */}
      {activeChannel ? (
        <div className="flex-1 flex flex-col min-h-0 relative">
          
          {/* Scrollable Message List or Search Empty State */}
          {searchQuery && filteredMessages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-500 select-none">
              <Search size={36} className="mb-2.5 text-slate-700 opacity-60" />
              <p className="text-sm font-bold text-slate-400">No results found</p>
              <p className="text-xs text-slate-500 mt-1 text-center max-w-xs leading-relaxed">
                We couldn't find any messages matching "{searchQuery}" in this channel.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-indigo-400 hover:text-indigo-300 rounded-xl transition cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <MessageList 
              messages={filteredMessages} 
              onAddReaction={onAddReaction} 
              onTogglePin={onTogglePin}
              onDeleteMessage={onDeleteMessage}
              currentUser={currentUser} 
            />
          )}

          {/* Typing Indicator Overlay / Footer */}
          <TypingIndicator typingUsers={typingUsers} />

          {/* Input Box */}
          <MessageInput 
            onSendMessage={onSendMessage} 
            placeholder={
              activeChannel.type === 'dm'
                ? `Message ${activeChannel.name}`
                : `Message #${activeChannel.name}`
            } 
          />

        </div>
      ) : (
        /* Empty State */
        <EmptyState 
          title="No Active Conversations" 
          description="Click on any channel in the sidebar or start a direct message thread with a team member to begin writing." 
        />
      )}

    </div>
  );
}

export default ChatArea;