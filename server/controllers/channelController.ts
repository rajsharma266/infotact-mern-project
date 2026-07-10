import { Request, Response } from "express";
import mongoose from "mongoose";
import Channel from "../models/Channel";
import Workspace from "../models/Workspace";
import User from "../models/User";

const channelPopulateOptions = [
  {
    path: "workspaceId",
    select: "name description owner members",
    populate: [
      { path: "owner", select: "name email role avatar" },
      { path: "members", select: "name email role avatar" },
    ],
  },
  { path: "createdBy", select: "name email role avatar" },
  { path: "members", select: "name email role avatar" },
];

export const createChannel = async (req: Request, res: Response) => {
  try {
    const { name, description, workspaceId, isPrivate, members } = req.body;
    const createdBy = req.user?.id ?? req.body.createdBy;

    if (!name || !workspaceId || !createdBy) {
      return res.status(400).json({
        success: false,
        message: "name, workspaceId and createdBy are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(workspaceId) ||
      !mongoose.Types.ObjectId.isValid(createdBy)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid workspaceId or createdBy",
      });
    }

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
    }

    const isWorkspaceMember = workspace.members.some(
      (memberId) => memberId.toString() === createdBy
    );

    if (!isWorkspaceMember && workspace.owner.toString() !== createdBy) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this workspace",
      });
    }

    const user = await User.findById(createdBy);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (members && !Array.isArray(members)) {
      return res.status(400).json({
        success: false,
        message: "members must be an array",
      });
    }

    const resolvedMembers = Array.isArray(members)
      ? Array.from(new Set([createdBy, ...members]))
      : isPrivate
        ? [createdBy]
        : workspace.members.map((memberId) => memberId.toString());

    const channel = await Channel.create({
      name,
      description,
      workspaceId,
      createdBy,
      isPrivate: Boolean(isPrivate),
      members: resolvedMembers,
    });

    const populatedChannel = await Channel.findById(channel._id).populate(
      channelPopulateOptions
    );

    res.status(201).json({
      success: true,
      message: "Channel created successfully",
      data: populatedChannel,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const getAllChannels = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const workspaceId = req.query.workspaceId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const workspaceFilter =
      typeof workspaceId === "string" ? { _id: workspaceId } : {};
    const accessibleWorkspaces = await Workspace.find({
      ...workspaceFilter,
      $or: [{ owner: userId }, { members: userId }],
    }).select("_id");

    const accessibleWorkspaceIds = accessibleWorkspaces.map(
      (workspace) => workspace._id
    );

    const channels = await Channel.find({
      workspaceId: { $in: accessibleWorkspaceIds },
    }).populate(channelPopulateOptions);

    res.status(200).json({
      success: true,
      message: "Channels fetched successfully",
      data: channels,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const getChannelById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid channel id",
      });
    }

    const channel = await Channel.findById(id).populate(channelPopulateOptions);

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Channel not found",
      });
    }

    const accessibleWorkspace = await Workspace.exists({
      _id: channel.workspaceId,
      $or: [{ owner: userId }, { members: userId }],
    });

    if (!accessibleWorkspace) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this channel",
      });
    }

    res.status(200).json({
      success: true,
      message: "Channel fetched successfully",
      data: channel,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const updateChannel = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { workspaceId, createdBy, members } = req.body;
    const updates = { ...req.body };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid channel id",
      });
    }

    if (
      workspaceId &&
      !mongoose.Types.ObjectId.isValid(workspaceId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid workspaceId",
      });
    }

    if (
      createdBy &&
      !mongoose.Types.ObjectId.isValid(createdBy)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid createdBy",
      });
    }

    if (workspaceId) {
      const workspace = await Workspace.findById(workspaceId);

      if (!workspace) {
        return res.status(404).json({
          success: false,
          message: "Workspace not found",
        });
      }
    }

    if (createdBy) {
      const user = await User.findById(createdBy);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
    }

    if (members && !Array.isArray(members)) {
      return res.status(400).json({
        success: false,
        message: "members must be an array",
      });
    }

    if (Array.isArray(members)) {
      updates.members = Array.from(
        new Set(createdBy ? [createdBy, ...members] : members)
      );
    }

    const channel = await Channel.findByIdAndUpdate(id, updates, {
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const deleteChannel = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid channel id",
      });
    }

    const channel = await Channel.findByIdAndDelete(id);

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
