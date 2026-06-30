"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessage = exports.getMessagesByChannel = exports.sendMessage = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Message_1 = __importDefault(require("../models/Message"));
const User_1 = __importDefault(require("../models/User"));
const Channel_1 = __importDefault(require("../models/Channel"));
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
        const message = await Message_1.default.create({
            content,
            sender,
            channelId,
            attachments: attachments || [],
        });
        const populatedMessage = await Message_1.default.findById(message._id).populate(messagePopulateOptions);
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
        const message = await Message_1.default.findByIdAndDelete(id);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found",
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
