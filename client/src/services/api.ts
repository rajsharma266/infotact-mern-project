import type { Channel, Message, User, Workspace } from "../types";

const API_BASE_URL = "http://localhost:4000/api";
const TOKEN_STORAGE_KEY = "infotact_token";
const USER_STORAGE_KEY = "infotact_user";

type MaybePopulated<T> = T | string;

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError extends Error {
  status?: number;
}

export interface BackendUser {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "member";
  avatar?: string;
}

export interface BackendWorkspace {
  _id: string;
  name: string;
  description?: string;
  owner: MaybePopulated<BackendUser>;
  members: Array<MaybePopulated<BackendUser>>;
}

export interface BackendChannel {
  _id: string;
  name: string;
  description?: string;
  workspaceId: MaybePopulated<BackendWorkspace>;
  createdBy: MaybePopulated<BackendUser>;
  isPrivate?: boolean;
  members?: Array<MaybePopulated<BackendUser>>;
}

export interface BackendMessage {
  _id: string;
  content: string;
  sender: MaybePopulated<BackendUser>;
  channelId: MaybePopulated<BackendChannel>;
  attachments: string[];
  createdAt?: string;
}

interface ProfileResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    role?: string;
  } | null;
}

interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  data: BackendUser;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface CreateWorkspacePayload {
  name: string;
  description: string;
}

interface CreateChannelPayload {
  name: string;
  description: string;
  workspaceId: string;
  isPrivate?: boolean;
}

interface SendMessagePayload {
  content: string;
  channelId: string;
}

const buildHeaders = (headers?: HeadersInit) => {
  const token = getToken();
  const baseHeaders = new Headers(headers);

  if (!baseHeaders.has("Content-Type")) {
    baseHeaders.set("Content-Type", "application/json");
  }

  if (token && !baseHeaders.has("Authorization")) {
    baseHeaders.set("Authorization", `Bearer ${token}`);
  }

  return baseHeaders;
};

const extractId = <T extends { _id: string }>(value: MaybePopulated<T>) =>
  typeof value === "string" ? value : value._id;

const formatTimestamp = (value?: string) => {
  if (!value) {
    return "Just now";
  }

  const timestamp = new Date(value);

  if (Number.isNaN(timestamp.getTime())) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
};

export const getInitials = (name: string, fallback = "U") => {
  const initials = name
    .split(" ")
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);

  return initials || fallback;
};

const request = async <T>(path: string, init: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: buildHeaders(init.headers),
  });

  const rawText = await response.text();
  const payload = rawText ? JSON.parse(rawText) : null;

  if (!response.ok) {
    const error = new Error(
      payload?.message || `Request failed with status ${response.status}`
    ) as ApiError;
    error.status = response.status;
    throw error;
  }

  return payload as T;
};

export const getToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);

export const hasToken = () => Boolean(getToken());

export const getStoredUser = () => {
  const rawUser = localStorage.getItem(USER_STORAGE_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as User;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
};

export const saveSession = (token: string, user: User) => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const saveStoredUser = (user: User) => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
};

export const toApiErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";

export const toUser = (user: BackendUser): User => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar?.trim() || getInitials(user.name),
  role: user.role === "admin" ? "Admin" : "Member",
  status: "online",
});

export const toWorkspace = (workspace: BackendWorkspace): Workspace => {
  const userIds = workspace.members.map((member) => extractId(member));

  return {
    id: workspace._id,
    name: workspace.name,
    description: workspace.description || "",
    logo: getInitials(workspace.name, "WS"),
    membersCount: userIds.length,
    userIds,
    ownerId: extractId(workspace.owner),
  };
};

export const toChannel = (channel: BackendChannel): Channel => {
  const workspaceId = extractId(channel.workspaceId);
  const channelMembers = channel.members?.map((member) => extractId(member)) ?? [];

  return {
    id: channel._id,
    workspaceId,
    name: channel.name,
    description: channel.description || "",
    isPrivate: Boolean(channel.isPrivate),
    type: "channel",
    userIds: channelMembers,
    createdBy: extractId(channel.createdBy),
  };
};

export const toMessage = (message: BackendMessage): Message => {
  const sender =
    typeof message.sender === "string" ? null : message.sender;
  const senderName = sender?.name || "Unknown User";

  return {
    id: message._id,
    channelId: extractId(message.channelId),
    senderId: extractId(message.sender),
    senderName,
    senderAvatar: sender?.avatar?.trim() || getInitials(senderName),
    content: message.content,
    timestamp: formatTimestamp(message.createdAt),
    reactions: [],
    isPinned: false,
  };
};

export const registerUser = (payload: RegisterPayload) =>
  request<ApiResponse<BackendUser>>("/users/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const loginUser = (payload: LoginPayload) =>
  request<LoginResponse>("/users/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const fetchProfile = () => request<ProfileResponse>("/users/profile");

export const fetchUserById = (id: string) =>
  request<ApiResponse<BackendUser>>(`/users/${id}`);

export const fetchUsers = () => request<ApiResponse<BackendUser[]>>("/users");

export const fetchWorkspaces = () =>
  request<ApiResponse<BackendWorkspace[]>>("/workspaces");

export const createWorkspace = (payload: CreateWorkspacePayload) =>
  request<ApiResponse<BackendWorkspace>>("/workspaces/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const fetchChannels = (workspaceId: string) =>
  request<ApiResponse<BackendChannel[]>>(
    `/channels?workspaceId=${encodeURIComponent(workspaceId)}`
  );

export const fetchChannelById = (id: string) =>
  request<ApiResponse<BackendChannel>>(`/channels/${id}`);

export const createChannel = (payload: CreateChannelPayload) =>
  request<ApiResponse<BackendChannel>>("/channels/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const fetchMessagesByChannel = (channelId: string) =>
  request<ApiResponse<BackendMessage[]>>(
    `/messages/channel/${encodeURIComponent(channelId)}`
  );

export const sendMessage = (payload: SendMessagePayload) =>
  request<ApiResponse<BackendMessage>>("/messages/send", {
    method: "POST",
    body: JSON.stringify(payload),
  });
