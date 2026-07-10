import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";
import app from "./app";
import dbConnect from "./config/db";

const PORT = Number(process.env.PORT) || 4000;

const startServer = async () => {
  await dbConnect();

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on("joinChannel", (channelId) => {
      socket.join(channelId);
      console.log(`User joined channel: ${channelId}`);
    });

    socket.on("sendMessage", (data) => {
      io.to(data.channelId).emit("receiveMessage", data);
    });

    socket.on("disconnect", () => {
      console.log("User Disconnected:", socket.id);
    });
  });

  server.listen(PORT, () => {
    console.log(`Server is successfully running on http://localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server");
  console.error(error);
  process.exit(1);
});