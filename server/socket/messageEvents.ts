export const MESSAGE_SOCKET_EVENTS = {
  JOIN_CHANNEL: "channel:join",
  LEAVE_CHANNEL: "channel:leave",
  MESSAGE_CREATED: "message:created",
  MESSAGE_DELETED: "message:deleted",
} as const;

export const getChannelRoom = (channelId: string) => `channel:${channelId}`;

export interface MessageSenderSnapshot {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "member";
  avatar?: string;
}

export interface MessageChannelSnapshot {
  _id: string;
  name: string;
}

export interface MessageSnapshot {
  _id: string;
  content: string;
  attachments: string[];
  sender: MessageSenderSnapshot;
  channelId: MessageChannelSnapshot | string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageCreatedEventPayload {
  channelId: string;
  message: MessageSnapshot;
}

export interface MessageDeletedEventPayload {
  channelId: string;
  messageId: string;
}
