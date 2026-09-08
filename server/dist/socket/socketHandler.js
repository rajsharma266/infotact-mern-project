"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const messageEvents_1 = require("./messageEvents");
let io = null;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: "*", // Allow all origins for testing/development
            methods: ["GET", "POST", "PUT", "DELETE"],
        },
    });
    io.on("connection", (socket) => {
        console.log(`Socket client connected: ${socket.id}`);
        // Join a channel's room
        socket.on(messageEvents_1.MESSAGE_SOCKET_EVENTS.JOIN_CHANNEL, ({ channelId }) => {
            if (channelId) {
                const room = (0, messageEvents_1.getChannelRoom)(channelId);
                socket.join(room);
                console.log(`Socket ${socket.id} joined room ${room}`);
            }
        });
        // Leave a channel's room
        socket.on(messageEvents_1.MESSAGE_SOCKET_EVENTS.LEAVE_CHANNEL, ({ channelId }) => {
            if (channelId) {
                const room = (0, messageEvents_1.getChannelRoom)(channelId);
                socket.leave(room);
                console.log(`Socket ${socket.id} left room ${room}`);
            }
        });
        // Handle typing events
        socket.on("typing:start", ({ channelId, userName }) => {
            if (channelId && userName) {
                socket.to((0, messageEvents_1.getChannelRoom)(channelId)).emit("typing:start", { channelId, userName });
            }
        });
        socket.on("typing:stop", ({ channelId, userName }) => {
            if (channelId && userName) {
                socket.to((0, messageEvents_1.getChannelRoom)(channelId)).emit("typing:stop", { channelId, userName });
            }
        });
        socket.on("disconnect", () => {
            console.log(`Socket client disconnected: ${socket.id}`);
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!io) {
        throw new Error("Socket.io has not been initialized!");
    }
    return io;
};
exports.getIO = getIO;
