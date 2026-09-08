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
const Activity_1 = __importDefault(require("../models/Activity"));
const channelPopulateOptions = [
    { path: "workspaceId", select: "name description owner members" },
    { path: "createdBy", select: "name email role avatar" },
];
const createChannel = async (req, res) => {
    try {
        const { name, description, workspaceId, createdBy, isPrivate, type, recipientId, members } = req.body;
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
        // Set up members array - default to the creator
        const memberIds = Array.isArray(members) ? members : [createdBy];
        const normalizedMembers = Array.from(new Set([createdBy, ...memberIds]));
        const channel = await Channel_1.default.create({
            name,
            description: description || "",
            workspaceId,
            createdBy,
            isPrivate: isPrivate ?? false,
            type: type || "channel",
            recipientId: recipientId || null,
            members: normalizedMembers,
        });
        await Activity_1.default.create({
            user: createdBy,
            workspace: workspaceId,
            action: "CHANNEL_CREATED",
            details: `created channel ${channel.name}`,
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
        const { workspaceId } = req.query;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const filter = {};
        if (workspaceId && mongoose_1.default.Types.ObjectId.isValid(String(workspaceId))) {
            filter.workspaceId = workspaceId;
            // Verify user is a member of the workspace
            const workspace = await Workspace_1.default.findById(workspaceId);
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
        // Access policy: user can see public channels (isPrivate is false and type is "channel")
        // or private/dm channels they are a member of.
        filter.$or = [
            { isPrivate: false, type: "channel" },
            { members: userId }
        ];
        const channels = await Channel_1.default.find(filter).populate(channelPopulateOptions);
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
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
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
        // Check visibility/access permissions
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
