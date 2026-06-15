import { useState } from 'react';
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
  const [users] = useState<User[]>(mockUsers);
  const [typing, setTyping] = useState<string[]>([]);
  
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
    };
    setChannels(prev => [...prev, newChan]);
    
    // Switch to it
    setActiveWorkspaceId(newId);
    setActiveChannelId(newChan.id);
    setCurrentView('workspace');
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
    };
    setChannels(prev => [...prev, newChan]);
    setActiveChannelId(newChan.id);
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

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans">
      {currentView === 'dashboard' ? (
        <Dashboard 
          workspaces={workspaces} 
          onSelectWorkspace={handleSelectWorkspace} 
          onCreateWorkspace={handleCreateWorkspace}
          currentUser={currentUser}
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
          users={users}
          currentUser={currentUser}
          typingUsers={typing}
          onGoToDashboard={() => setCurrentView('dashboard')}
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