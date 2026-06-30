"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteChannel = exports.updateChannel = exports.getChannelById = exports.getAllChannels = exports.createChannel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Channel_1 = __importDefault(require("../models/Channel"));
const Workspace_1 = __importDefault(require("../models/Workspace"));
const User_1 = __importDefault(require("../models/User"));
const channelPopulateOptions = [
    { path: "workspaceId", select: "name description owner members" },
    { path: "createdBy", select: "name email role avatar" },
];
const createChannel = async (req, res) => {
    try {
        const { name, description, workspaceId, createdBy } = req.body;
        if (!name || !workspaceId || !createdBy) {
            return res.status(400).json({
                success: false,
                message: "name, workspaceId and createdBy are required",
            });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(workspaceId) ||
            !mongoose_1.default.Types.ObjectId.isValid(createdBy)) {
            return res.status(400).json({
                success: false,
                message: "Invalid workspaceId or createdBy",
            });
        }
        const workspace = await Workspace_1.default.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: "Workspace not found",
            });
        }
        const user = await User_1.default.findById(createdBy);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        const channel = await Channel_1.default.create({
            name,
            description,
            workspaceId,
            createdBy,
        });
        const populatedChannel = await Channel_1.default.findById(channel._id).populate(channelPopulateOptions);
        res.status(201).json({
            success: true,
            message: "Channel created successfully",
            data: populatedChannel,
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
exports.createChannel = createChannel;
const getAllChannels = async (req, res) => {
    try {
        const channels = await Channel_1.default.find().populate(channelPopulateOptions);
        res.status(200).json({
            success: true,
            message: "Channels fetched successfully",
            data: channels,
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
exports.getAllChannels = getAllChannels;
const getChannelById = async (req, res) => {
    try {
        const id = String(req.params.id);
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid channel id",
            });
        }
        const channel = await Channel_1.default.findById(id).populate(channelPopulateOptions);
        if (!channel) {
            return res.status(404).json({
                success: false,
                message: "Channel not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Channel fetched successfully",
            data: channel,
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
exports.getChannelById = getChannelById;
const updateChannel = async (req, res) => {
    try {
        const id = String(req.params.id);
        const { workspaceId, createdBy } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid channel id",
            });
        }
        if (workspaceId &&
            !mongoose_1.default.Types.ObjectId.isValid(workspaceId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid workspaceId",
            });
        }
        if (createdBy &&
            !mongoose_1.default.Types.ObjectId.isValid(createdBy)) {
            return res.status(400).json({
                success: false,
                message: "Invalid createdBy",
            });
        }
        if (workspaceId) {
            const workspace = await Workspace_1.default.findById(workspaceId);
            if (!workspace) {
                return res.status(404).json({
                    success: false,
                    message: "Workspace not found",
                });
            }
        }
        if (createdBy) {
            const user = await User_1.default.findById(createdBy);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }
        }
        const channel = await Channel_1.default.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        }).populate(channelPopulateOptions);
        if (!channel) {
            return res.status(404).json({
                success: false,
                message: "Channel not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Channel updated successfully",
            data: channel,
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
exports.updateChannel = updateChannel;
const deleteChannel = async (req, res) => {
    try {
        const id = String(req.params.id);
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid channel id",
            });
        }
        const channel = await Channel_1.default.findByIdAndDelete(id);
        if (!channel) {
            return res.status(404).json({
                success: false,
                message: "Channel not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Channel deleted successfully",
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
exports.deleteChannel = deleteChannel;
