import express from "express";
import cors from "cors";
import userRoutes from "./routes/authRoute";
import workspaceRoutes from "./routes/workspaceRoutes";
import channelRoutes from "./routes/channelRoutes";
import messageRoutes from "./routes/messageRoutes";

const app = express();

app.disable("x-powered-by");
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/messages", messageRoutes);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
});

app.get("/", (_req, res) => {
  res.send("Backend Running");
});

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

export default app;
