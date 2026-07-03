import { Request, Response } from "express";
import mongoose from "mongoose";
import Workspace from "../models/Workspace";
import User from "../models/User";
import Channel from "../models/Channel";
import crypto from "crypto";
import Activity from "../models/Activity";

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

    // Automatically create a general channel for the workspace
    await Channel.create({
      name: "general",
      description: "General discussion",
      workspaceId: workspace._id,
      createdBy: owner,
      isPrivate: false,
      type: "channel",
      members: normalizedMembers,
    });

    await Activity.create({
    user: owner,
    workspace: workspace._id,
    action: "WORKSPACE_CREATED",
    details: `created workspace ${workspace.name}`,
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
    const userId = req.user?.id;

    const workspaces = await Workspace.find({
      members: userId,
    }).populate(workspacePopulateOptions);

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

    if (members && Array.isArray(members)) {
      await Channel.updateMany(
        { workspaceId: id, isPrivate: false, type: "channel" },
        { $addToSet: { members: { $each: members.map((mId: string) => new mongoose.Types.ObjectId(mId)) } } }
      );
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

    // Log invite generation activity
    await Activity.create({
      user: req.user?.id,
      workspace: workspace._id,
      action: "INVITE_GENERATED",
      details: "generated an invitation link",
    });

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

export const validateInviteLink = async (req: Request, res: Response) => {
  try {
    const token = String(req.params.token);

    const workspace = await Workspace.findOne({
      inviteToken: token,
    }).populate(workspacePopulateOptions);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Invalid invite link",
      });
    }

    if (
      workspace.inviteExpiresAt &&
      new Date(workspace.inviteExpiresAt) < new Date()
    ) {
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const joinWorkspaceByInvite = async (req: Request, res: Response) => {
  try {
    const { token, userId } = req.body;

    if (!token || !userId) {
      return res.status(400).json({
        success: false,
        message: "token and userId are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    const workspace = await Workspace.findOne({
      inviteToken: token,
    });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Invalid invite link",
      });
    }

    if (
      workspace.inviteExpiresAt &&
      new Date(workspace.inviteExpiresAt) < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invite link expired",
      });
    }

    const alreadyMember = workspace.members.some(
      (member) => member.toString() === userId
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: "User already joined workspace",
      });
    }

    workspace.members.push(new mongoose.Types.ObjectId(userId));
    await workspace.save();

    // Automatically add the user to all public channels of the joined workspace
    await Channel.updateMany(
      { workspaceId: workspace._id, isPrivate: false, type: "channel" },
      { $addToSet: { members: new mongoose.Types.ObjectId(userId) } }
    );

    await Activity.create({
  user: userId,
  workspace: workspace._id,
  action: "USER_JOINED",
  details: `joined workspace ${workspace.name}`,
});

    res.status(200).json({
      success: true,
      message: "Joined workspace successfully",
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

export const exitWorkspace = async (req: Request, res: Response) => {
  try {
    const workspaceId = String(req.params.id);
    const userId = req.user?.id;

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

    // Owner cannot exit
    if (workspace.owner.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "Workspace owner cannot exit the workspace. You must delete the workspace or transfer ownership first.",
      });
    }

    // Check if user is a member
    const isMember = workspace.members.some(
      (mId) => mId.toString() === userId
    );
    if (!isMember) {
      return res.status(400).json({
        success: false,
        message: "You are not a member of this workspace",
      });
    }

    // Remove user from workspace members
    workspace.members = workspace.members.filter(
      (mId) => mId.toString() !== userId
    );
    await workspace.save();

    // Remove user from all channels in this workspace
    await Channel.updateMany(
      { workspaceId: workspace._id },
      { $pull: { members: new mongoose.Types.ObjectId(userId) } }
    );

    // Log Activity
    await Activity.create({
      user: userId,
      workspace: workspace._id,
      action: "USER_LEFT",
      details: `left workspace ${workspace.name}`,
    });

    res.status(200).json({
      success: true,
      message: "Exited workspace successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
