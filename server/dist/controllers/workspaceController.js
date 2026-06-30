"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinWorkspaceByInvite = exports.validateInviteLink = exports.generateInviteLink = exports.deleteWorkspace = exports.updateWorkspace = exports.getWorkspaceById = exports.getAllWorkspaces = exports.createWorkspace = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Workspace_1 = __importDefault(require("../models/Workspace"));
const User_1 = __importDefault(require("../models/User"));
const crypto_1 = __importDefault(require("crypto"));
const workspacePopulateOptions = [
    { path: "owner", select: "name email role avatar" },
    { path: "members", select: "name email role avatar" },
];
const createWorkspace = async (req, res) => {
    try {
        const { name, description, owner, members } = req.body;
        if (!name || !owner) {
            return res.status(400).json({
                success: false,
                message: "name and owner are required",
            });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(owner)) {
            return res.status(400).json({
                success: false,
                message: "Invalid owner id",
            });
        }
        if (members && !Array.isArray(members)) {
            return res.status(400).json({
                success: false,
                message: "members must be an array",
            });
        }
        const ownerUser = await User_1.default.findById(owner);
        if (!ownerUser) {
            return res.status(404).json({
                success: false,
                message: "Owner not found",
            });
        }
        const memberIds = Array.isArray(members) ? members : [owner];
        const normalizedMembers = Array.from(new Set([owner, ...memberIds]));
        const workspace = await Workspace_1.default.create({
            name,
            description,
            owner,
            members: normalizedMembers,
        });
        const populatedWorkspace = await Workspace_1.default.findById(workspace._id).populate(workspacePopulateOptions);
        res.status(201).json({
            success: true,
            message: "Workspace created successfully",
            data: populatedWorkspace,
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
exports.createWorkspace = createWorkspace;
const getAllWorkspaces = async (req, res) => {
    try {
        const workspaces = await Workspace_1.default.find().populate(workspacePopulateOptions);
        res.status(200).json({
            success: true,
            message: "Workspaces fetched successfully",
            data: workspaces,
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
exports.getAllWorkspaces = getAllWorkspaces;
const getWorkspaceById = async (req, res) => {
    try {
        const id = String(req.params.id);
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid workspace id",
            });
        }
        const workspace = await Workspace_1.default.findById(id).populate(workspacePopulateOptions);
        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: "Workspace not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Workspace fetched successfully",
            data: workspace,
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
exports.getWorkspaceById = getWorkspaceById;
const updateWorkspace = async (req, res) => {
    try {
        const id = String(req.params.id);
        const { owner, members } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid workspace id",
            });
        }
        if (owner && !mongoose_1.default.Types.ObjectId.isValid(owner)) {
            return res.status(400).json({
                success: false,
                message: "Invalid owner id",
            });
        }
        if (members && !Array.isArray(members)) {
            return res.status(400).json({
                success: false,
                message: "members must be an array",
            });
        }
        const workspace = await Workspace_1.default.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }).populate(workspacePopulateOptions);
        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: "Workspace not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Workspace updated successfully",
            data: workspace,
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
exports.updateWorkspace = updateWorkspace;
const deleteWorkspace = async (req, res) => {
    try {
        const id = String(req.params.id);
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid workspace id",
            });
        }
        const workspace = await Workspace_1.default.findByIdAndDelete(id);
        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: "Workspace not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Workspace deleted successfully",
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
exports.deleteWorkspace = deleteWorkspace;
const generateInviteLink = async (req, res) => {
    try {
        const workspaceId = String(req.params.id);
        if (!mongoose_1.default.Types.ObjectId.isValid(workspaceId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid workspace id",
            });
        }
        const workspace = await Workspace_1.default.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: "Workspace not found",
            });
        }
        // Generate random token
        const token = crypto_1.default.randomBytes(16).toString("hex");
        // Save token in DB
        workspace.inviteToken = token;
        workspace.inviteExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // expires in 24 hours
        await workspace.save();
        res.status(200).json({
            success: true,
            message: "Invite link generated successfully",
            inviteLink: `http://localhost:5173/invite/${token}`,
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
exports.generateInviteLink = generateInviteLink;
const validateInviteLink = async (req, res) => {
    try {
        const token = String(req.params.token);
        const workspace = await Workspace_1.default.findOne({
            inviteToken: token,
        }).populate(workspacePopulateOptions);
        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: "Invalid invite link",
            });
        }
        if (workspace.inviteExpiresAt &&
            new Date(workspace.inviteExpiresAt) < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Invite link expired",
            });
        }
        res.status(200).json({
            success: true,
            message: "Invite link is valid",
            data: workspace,
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
exports.validateInviteLink = validateInviteLink;
const joinWorkspaceByInvite = async (req, res) => {
    try {
        const { token, userId } = req.body;
        if (!token || !userId) {
            return res.status(400).json({
                success: false,
                message: "token and userId are required",
            });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user id",
            });
        }
        const workspace = await Workspace_1.default.findOne({
            inviteToken: token,
        });
        if (!workspace) {
            return res.status(404).json({
                success: false,
                message: "Invalid invite link",
            });
        }
        if (workspace.inviteExpiresAt &&
            new Date(workspace.inviteExpiresAt) < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Invite link expired",
            });
        }
        const alreadyMember = workspace.members.some((member) => member.toString() === userId);
        if (alreadyMember) {
            return res.status(400).json({
                success: false,
                message: "User already joined workspace",
            });
        }
        workspace.members.push(new mongoose_1.default.Types.ObjectId(userId));
        await workspace.save();
        res.status(200).json({
            success: true,
            message: "Joined workspace successfully",
            data: workspace,
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
exports.joinWorkspaceByInvite = joinWorkspaceByInvite;
