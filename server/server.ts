import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app";
import dbConnect from "./config/db";
import { initSocket } from "./socket/socketHandler";

const PORT = Number(process.env.PORT) || 4000;

const startServer = async () => {
  await dbConnect();

  const server = http.createServer(app);
  
  // Initialize Socket.IO and set it on the express app instance
  const io = initSocket(server);
  app.set("io", io);

  server.listen(PORT, () => {
    console.log(`Server is successfully running on http://localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server");
  console.error(error);
  process.exit(1);
});
