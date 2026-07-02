"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactToMessage = exports.togglePinMessage = exports.deleteMessage = exports.getMessagesByChannel = exports.sendMessage = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Message_1 = __importDefault(require("../models/Message"));
const User_1 = __importDefault(require("../models/User"));
const Channel_1 = __importDefault(require("../models/Channel"));
const Workspace_1 = __importDefault(require("../models/Workspace"));
const messageEvents_1 = require("../socket/messageEvents");
const messagePopulateOptions = [
    { path: "sender", select: "name email role avatar" },
    {
        path: "channelId",
        select: "name description workspaceId createdBy",
        populate: [
            { path: "workspaceId", select: "name description owner members" },
            { path: "createdBy", select: "name email role avatar" },
        ],
    },
];
const sendMessage = async (req, res) => {
    try {
        const { content, sender, channelId, attachments } = req.body;
        const userId = req.user?.id || sender;
        if (!content || !sender || !channelId) {
            return res.status(400).json({
                success: false,
                message: "content, sender and channelId are required",
            });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(sender) ||
            !mongoose_1.default.Types.ObjectId.isValid(channelId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid sender or channelId",
            });
        }
        if (attachments && !Array.isArray(attachments)) {
            return res.status(400).json({
                success: false,
                message: "attachments must be an array of strings",
            });
        }
        const user = await User_1.default.findById(sender);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        const channel = await Channel_1.default.findById(channelId);
        if (!channel) {
            return res.status(404).json({
                success: false,
                message: "Channel not found",
            });
        }
        // Verify channel access
        if (channel.isPrivate || channel.type === "dm") {
            const isMember = channel.members?.some((mId) => mId.toString() === userId);
            if (!isMember) {
                return res.status(403).json({
                    success: false,
                    message: "You do not have access to this private channel",
                });
            }
        }
        else {
            // For public channels, check workspace membership
            const workspace = await Workspace_1.default.findById(channel.workspaceId);
            if (!workspace) {
                return res.status(404).json({
                    success: false,
                    message: "Workspace not found",
                });
            }
            const isWorkspaceMember = workspace.members.some((mId) => mId.toString() === userId);
            if (!isWorkspaceMember && workspace.owner.toString() !== userId) {
                return res.status(403).json({
                    success: false,
                    message: "You are not a member of this workspace",
                });
            }
            // Add user to channel members array if not already present
            const isChannelMember = channel.members?.some((mId) => mId.toString() === userId);
            if (!isChannelMember) {
                channel.members = channel.members || [];
                channel.members.push(new mongoose_1.default.Types.ObjectId(userId));
                await channel.save();
            }
        }
        const message = await Message_1.default.create({
            content,
            sender,
            channelId,
            attachments: attachments || [],
        });
        const populatedMessage = await Message_1.default.findById(message._id).populate(messagePopulateOptions);
        // Emit live Socket.io event
        const io = req.app.get("io");
        if (io) {
            io.to((0, messageEvents_1.getChannelRoom)(channelId.toString())).emit(messageEvents_1.MESSAGE_SOCKET_EVENTS.MESSAGE_CREATED, {
                channelId: channelId.toString(),
                message: populatedMessage,
            });
        }
        res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: populatedMessage,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};
exports.sendMessage = sendMessage;
const getMessagesByChannel = async (req, res) => {
    try {
        const channelId = String(req.params.channelId);
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(channelId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid channel id",
            });
        }
        const channel = await Channel_1.default.findById(channelId);
        if (!channel) {
            return res.status(404).json({
                success: false,
                message: "Channel not found",
            });
        }
        // Verify channel access
        if (channel.isPrivate || channel.type === "dm") {
            const isMember = channel.members?.some((mId) => mId.toString() === userId);
            if (!isMember) {
                return res.status(403).json({
                    success: false,
                    message: "You do not have access to this private channel",
                });
            }
        }
        else {
            // For public channels, check workspace membership
            const workspace = await Workspace_1.default.findById(channel.workspaceId);
            if (!workspace) {
                return res.status(404).json({
                    success: false,
                    message: "Workspace not found",
                });
            }
            const isWorkspaceMember = workspace.members.some((mId) => mId.toString() === userId);
            if (!isWorkspaceMember && workspace.owner.toString() !== userId) {
                return res.status(403).json({
                    success: false,
                    message: "You are not a member of this workspace",
                });
            }
        }
        const messages = await Message_1.default.find({ channelId })
            .populate(messagePopulateOptions)
            .sort({ createdAt: 1 });
        res.status(200).json({
            success: true,
            message: "Messages fetched successfully",
            data: messages,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};
exports.getMessagesByChannel = getMessagesByChannel;
const deleteMessage = async (req, res) => {
    try {
        const id = String(req.params.id);
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid message id",
            });
        }
        const message = await Message_1.default.findById(id);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found",
            });
        }
        const channelId = message.channelId;
        await message.deleteOne();
        // Emit live Socket.io event
        const io = req.app.get("io");
        if (io) {
            io.to((0, messageEvents_1.getChannelRoom)(channelId.toString())).emit(messageEvents_1.MESSAGE_SOCKET_EVENTS.MESSAGE_DELETED, {
                channelId: channelId.toString(),
                messageId: id,
            });
        }
        res.status(200).json({
            success: true,
            message: "Message deleted successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};
exports.deleteMessage = deleteMessage;
const togglePinMessage = async (req, res) => {
    try {
        const id = String(req.params.id);
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid message id",
            });
        }
        const message = await Message_1.default.findById(id);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found",
            });
        }
        message.isPinned = !message.isPinned;
        await message.save();
        const populated = await Message_1.default.findById(id).populate(messagePopulateOptions);
        const io = req.app.get("io");
        if (io) {
            io.to((0, messageEvents_1.getChannelRoom)(message.channelId.toString())).emit("message:updated", populated);
        }
        res.status(200).json({
            success: true,
            message: message.isPinned ? "Message pinned" : "Message unpinned",
            data: populated,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};
exports.togglePinMessage = togglePinMessage;
const reactToMessage = async (req, res) => {
    try {
        const id = String(req.params.id);
        const { emoji, userId } = req.body;
        if (!emoji || !userId) {
            return res.status(400).json({
                success: false,
                message: "emoji and userId are required",
            });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(id) || !mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid message or user id",
            });
        }
        const message = await Message_1.default.findById(id);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found",
            });
        }
        const reactions = message.reactions || [];
        const reactIndex = reactions.findIndex((r) => r.emoji === emoji);
        if (reactIndex > -1) {
            const reaction = reactions[reactIndex];
            const userIndex = reaction.users.findIndex((u) => u.toString() === userId);
            if (userIndex > -1) {
                // Remove reaction if user already reacted
                reaction.users.splice(userIndex, 1);
                reaction.count -= 1;
                if (reaction.count === 0 || reaction.users.length === 0) {
                    reactions.splice(reactIndex, 1);
                }
            }
            else {
                // Add user to reaction
                reaction.users.push(new mongoose_1.default.Types.ObjectId(userId));
                reaction.count += 1;
            }
        }
        else {
            // Create new reaction
            reactions.push({
                emoji,
                count: 1,
                users: [new mongoose_1.default.Types.ObjectId(userId)],
            });
        }
        message.reactions = reactions;
        await message.save();
        const populated = await Message_1.default.findById(id).populate(messagePopulateOptions);
        const io = req.app.get("io");
        if (io) {
            io.to((0, messageEvents_1.getChannelRoom)(message.channelId.toString())).emit("message:updated", populated);
        }
        res.status(200).json({
            success: true,
            message: "Reaction updated successfully",
            data: populated,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};
exports.reactToMessage = reactToMessage;
