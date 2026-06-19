import express from "express";
import cors from "cors";
import userRoutes from "./routes/authRoute";
import workspaceRoutes from "./routes/workspaceRoutes";
import channelRoutes from "./routes/channelRoutes";
import messageRoutes from "./routes/messageRoutes";
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/messages", messageRoutes);
app.get("/", (req, res) => {
  res.send("Backend Running");
});

export default app;
