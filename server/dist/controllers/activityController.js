"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivitiesByWorkspace = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Activity_1 = __importDefault(require("../models/Activity"));
const getActivitiesByWorkspace = async (req, res) => {
    try {
        const workspaceId = String(req.params.workspaceId);
        if (!mongoose_1.default.Types.ObjectId.isValid(workspaceId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid workspace id",
            });
        }
        const activities = await Activity_1.default.find({ workspace: workspaceId })
            .populate("user", "name email avatar")
            .populate("workspace", "name")
            .sort({ createdAt: -1 })
            .limit(10);
        res.status(200).json({
            success: true,
            message: "Activities fetched successfully",
            data: activities,
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
exports.getActivitiesByWorkspace = getActivitiesByWorkspace;
