export interface User {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "offline" | "away";
  role: "Admin" | "Member";
  email?: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[]; // usernames or userIds
}

export interface Message {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string; // Relative or formatted time e.g., '10:42 AM'
  reactions?: MessageReaction[];
  threadRepliesCount?: number;
  isPinned?: boolean;
}

export interface Channel {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  isPrivate: boolean;
  type: "channel" | "dm";
  recipientId?: string;
  userIds: string[];
  createdBy?: string;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  logo: string;
  membersCount: number;
  userIds: string[];
  ownerId: string;
}
