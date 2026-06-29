import { Request, Response } from "express";
import mongoose from "mongoose";
import Workspace from "../models/Workspace";
import User from "../models/User";
import crypto from "crypto";

const workspacePopulateOptions = [
  { path: "owner", select: "name email role avatar" },
  { path: "members", select: "name email role avatar" },
];

export const createWorkspace = async (req: Request, res: Response) => {
  try {
    const { name, description, owner, members } = req.body;

    if (!name || !owner) {
      return res.status(400).json({
        success: false,
        message: "name and owner are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(owner)) {
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

    const ownerUser = await User.findById(owner);

    if (!ownerUser) {
      return res.status(404).json({
        success: false,
        message: "Owner not found",
      });
    }

    const memberIds = Array.isArray(members) ? members : [owner];
    const normalizedMembers = Array.from(new Set([owner, ...memberIds]));

    const workspace = await Workspace.create({
      name,
      description,
      owner,
      members: normalizedMembers,
    });

    const populatedWorkspace = await Workspace.findById(workspace._id).populate(
      workspacePopulateOptions
    );

    res.status(201).json({
      success: true,
      message: "Workspace created successfully",
      data: populatedWorkspace,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const getAllWorkspaces = async (req: Request, res: Response) => {
  try {
    const workspaces = await Workspace.find().populate(workspacePopulateOptions);

    res.status(200).json({
      success: true,
      message: "Workspaces fetched successfully",
      data: workspaces,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const getWorkspaceById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid workspace id",
      });
    }

    const workspace = await Workspace.findById(id).populate(workspacePopulateOptions);

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const updateWorkspace = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { owner, members } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid workspace id",
      });
    }

    if (owner && !mongoose.Types.ObjectId.isValid(owner)) {
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

    const workspace = await Workspace.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate(workspacePopulateOptions);

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const deleteWorkspace = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid workspace id",
      });
    }

    const workspace = await Workspace.findByIdAndDelete(id);

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const generateInviteLink = async (req: Request, res: Response) => {
  try {
    const workspaceId = String(req.params.id);

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid workspace id",
      });
    }

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
    }

    // Generate random token
    const token = crypto.randomBytes(16).toString("hex");

    // Save token in DB
    workspace.inviteToken = token;
    workspace.inviteExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ); // expires in 24 hours

    await workspace.save();

    res.status(200).json({
      success: true,
      message: "Invite link generated successfully",
      inviteLink: `http://localhost:5173/invite/${token}`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
