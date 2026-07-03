import axios from "axios";

const API_BASE_URL = "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically inject JWT token into requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  getProfile: async () => {
    const res = await api.get("/users/profile");
    return res.data;
  },
  getAllUsers: async () => {
    const res = await api.get("/users");
    return res.data.data;
  },
  getUserById: async (id: string) => {
    const res = await api.get(`/users/${id}`);
    return res.data.data;
  },
  updateUser: async (id: string, data: any) => {
    const res = await api.put(`/users/${id}`, data);
    return res.data.data;
  },
};

// Workspace Services
export const workspaceService = {
  getAll: async () => {
    const res = await api.get("/workspaces");
    return res.data.data;
  },
  create: async (name: string, description: string, ownerId: string) => {
    const res = await api.post("/workspaces/create", {
      name,
      description,
      owner: ownerId,
    });
    return res.data.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/workspaces/${id}`);
    return res.data.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/workspaces/${id}`, data);
    return res.data.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/workspaces/${id}`);
    return res.data;
  },
  generateInvite: async (id: string) => {
    const res = await api.post(`/workspaces/${id}/invite`);
    return res.data.inviteLink;
  },
  joinByInvite: async (token: string, userId: string) => {
    const res = await api.post("/workspaces/join", { token, userId });
    return res.data;
  },
  validateInvite: async (token: string) => {
    const res = await api.get(`/workspaces/invite/${token}`);
    return res.data.data;
  },
  exit: async (id: string) => {
    const res = await api.post(`/workspaces/${id}/exit`);
    return res.data;
  },
};

// Channel Services
export const channelService = {
  getAll: async (workspaceId?: string) => {
    const url = workspaceId ? `/channels?workspaceId=${workspaceId}` : "/channels";
    const res = await api.get(url);
    return res.data.data;
  },
  create: async (data: {
    name: string;
    description: string;
    workspaceId: string;
    createdBy: string;
    isPrivate?: boolean;
    type?: "channel" | "dm";
    recipientId?: string;
    members?: string[];
  }) => {
    const res = await api.post("/channels/create", data);
    return res.data.data;
  },
  getById: async (id: string) => {
    const res = await api.get(`/channels/${id}`);
    return res.data.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/channels/${id}`, data);
    return res.data.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/channels/${id}`);
    return res.data;
  },
  exit: async (id: string) => {
    const res = await api.post(`/channels/${id}/exit`);
    return res.data;
  },
};

// Message Services
export const messageService = {
  getByChannel: async (channelId: string) => {
    const res = await api.get(`/messages/channel/${channelId}`);
    return res.data.data;
  },
  send: async (data: {
    content: string;
    sender: string;
    channelId: string;
    attachments?: string[];
  }) => {
    const res = await api.post("/messages/send", data);
    return res.data.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/messages/${id}`);
    return res.data;
  },
  togglePin: async (id: string) => {
    const res = await api.put(`/messages/${id}/pin`);
    return res.data.data;
  },
  react: async (id: string, emoji: string, userId: string) => {
    const res = await api.post(`/messages/${id}/react`, { emoji, userId });
    return res.data.data;
  },
};

export default api;
