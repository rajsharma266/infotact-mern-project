"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoute_1 = __importDefault(require("./routes/authRoute"));
const workspaceRoutes_1 = __importDefault(require("./routes/workspaceRoutes"));
const channelRoutes_1 = __importDefault(require("./routes/channelRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
const app = (0, express_1.default)();
app.disable("x-powered-by");
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/api/users", authRoute_1.default);
app.use("/api/workspaces", workspaceRoutes_1.default);
app.use("/api/channels", channelRoutes_1.default);
app.use("/api/messages", messageRoutes_1.default);
app.get("/api/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy",
    });
});
app.get("/", (_req, res) => {
    res.send("Backend Running");
});
exports.default = app;
