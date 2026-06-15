import type { Channel, Message, User } from '../../types';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import EmptyState from './EmptyState';

interface ChatAreaProps {
  activeChannel: Channel | undefined;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  typingUsers: string[];
  toggleMembersList: () => void;
  showMembersList: boolean;
  toggleMobileSidebar: () => void;
  currentUser: User;
}

function ChatArea({
  activeChannel,
  messages,
  onSendMessage,
  onAddReaction,
  typingUsers,
  toggleMembersList,
  showMembersList,
  toggleMobileSidebar,
  currentUser,
}: ChatAreaProps) {
  return (
    <div className="flex flex-col flex-1 h-full min-w-0 bg-slate-900/10">
      
      {/* 1. Chat Header */}
      <ChatHeader
        channelName={activeChannel?.name}
        channelDescription={activeChannel?.description}
        isPrivate={activeChannel?.isPrivate}
        type={activeChannel?.type}
        toggleMembersList={toggleMembersList}
        showMembersList={showMembersList}
        toggleMobileSidebar={toggleMobileSidebar}
      />

      {/* 2. Chat Contents */}
      {activeChannel ? (
        <div className="flex-1 flex flex-col min-h-0 relative">
          
          {/* Scrollable Message List */}
          <MessageList 
            messages={messages} 
            onAddReaction={onAddReaction} 
            currentUser={currentUser} 
          />

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