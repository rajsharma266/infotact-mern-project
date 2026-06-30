import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinChannel: (channelId: string) => void;
  leaveChannel: (channelId: string) => void;
  startTyping: (channelId: string, userName: string) => void;
  stopTyping: (channelId: string, userName: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to backend Socket.io server
    const socketInstance = io("http://localhost:4000", {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected to server");
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected from server");
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinChannel = (channelId: string) => {
    if (socket && isConnected) {
      socket.emit("channel:join", { channelId });
    }
  };

  const leaveChannel = (channelId: string) => {
    if (socket && isConnected) {
      socket.emit("channel:leave", { channelId });
    }
  };

  const startTyping = (channelId: string, userName: string) => {
    if (socket && isConnected) {
      socket.emit("typing:start", { channelId, userName });
    }
  };

  const stopTyping = (channelId: string, userName: string) => {
    if (socket && isConnected) {
      socket.emit("typing:stop", { channelId, userName });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinChannel,
        leaveChannel,
        startTyping,
        stopTyping,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
