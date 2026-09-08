import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { MESSAGE_SOCKET_EVENTS, getChannelRoom } from "./messageEvents";

let io: Server | null = null;

export const initSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: "*", // Allow all origins for testing/development
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`Socket client connected: ${socket.id}`);

    // Join a channel's room
    socket.on(MESSAGE_SOCKET_EVENTS.JOIN_CHANNEL, ({ channelId }: { channelId: string }) => {
      if (channelId) {
        const room = getChannelRoom(channelId);
        socket.join(room);
        console.log(`Socket ${socket.id} joined room ${room}`);
      }
    });

    // Leave a channel's room
    socket.on(MESSAGE_SOCKET_EVENTS.LEAVE_CHANNEL, ({ channelId }: { channelId: string }) => {
      if (channelId) {
        const room = getChannelRoom(channelId);
        socket.leave(room);
        console.log(`Socket ${socket.id} left room ${room}`);
      }
    });

    // Handle typing events
    socket.on("typing:start", ({ channelId, userName }: { channelId: string; userName: string }) => {
      if (channelId && userName) {
        socket.to(getChannelRoom(channelId)).emit("typing:start", { channelId, userName });
      }
    });

    socket.on("typing:stop", ({ channelId, userName }: { channelId: string; userName: string }) => {
      if (channelId && userName) {
        socket.to(getChannelRoom(channelId)).emit("typing:stop", { channelId, userName });
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io has not been initialized!");
  }
  return io;
};
