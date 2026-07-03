import { Request, Response } from "express";
import mongoose from "mongoose";
import Channel from "../models/Channel";
import Workspace from "../models/Workspace";
import User from "../models/User";
import Activity from "../models/Activity";

const channelPopulateOptions = [
  { path: "workspaceId", select: "name description owner members" },
  { path: "createdBy", select: "name email role avatar" },
];

export const createChannel = async (req: Request, res: Response) => {
  try {
    const { name, description, workspaceId, createdBy, isPrivate, type, recipientId, members } = req.body;

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

    const user = await User.findById(createdBy);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Set up members array - public channels automatically get all workspace members
    const channelIsPrivate = isPrivate ?? false;
    const channelType = type || "channel";
    
    let normalizedMembers;
    if (channelType === "channel" && !channelIsPrivate) {
      normalizedMembers = workspace.members;
    } else {
      const memberIds = Array.isArray(members) ? members : [createdBy];
      normalizedMembers = Array.from(new Set([createdBy, ...memberIds]));
    }

    const channel = await Channel.create({
      name,
      description: description || "",
      workspaceId,
      createdBy,
      isPrivate: channelIsPrivate,
      type: channelType,
      recipientId: recipientId || null,
      members: normalizedMembers,
    });

    await Activity.create({
      user: createdBy,
      workspace: workspaceId,
      action: "CHANNEL_CREATED",
      details: `created channel ${channel.name}`,
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
    const { workspaceId } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const filter: any = {};

    if (workspaceId && mongoose.Types.ObjectId.isValid(String(workspaceId))) {
      filter.workspaceId = workspaceId;

      // Verify user is a member of the workspace
      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        return res.status(404).json({
          success: false,
          message: "Workspace not found",
        });
      }
      const isWorkspaceMember = workspace.members.some(
        (mId) => mId.toString() === userId
      );
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

    const channels = await Channel.find(filter).populate(channelPopulateOptions);

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

    // Check visibility/access permissions
    if (channel.isPrivate || channel.type === "dm") {
      const isMember = channel.members?.some(
        (mId) => mId.toString() === userId
      );
      if (!isMember) {
        return res.status(403).json({
          success: false,
          message: "You do not have access to this private channel",
        });
      }
    } else {
      // For public channels, check workspace membership
      const workspace = await Workspace.findById(channel.workspaceId);
      if (!workspace) {
        return res.status(404).json({
          success: false,
          message: "Workspace not found",
        });
      }
      const isWorkspaceMember = workspace.members.some(
        (mId) => mId.toString() === userId
      );
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
    const { workspaceId, createdBy } = req.body;

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

    const channel = await Channel.findByIdAndUpdate(id, req.body, {
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

export const exitChannel = async (req: Request, res: Response) => {
  try {
    const channelId = String(req.params.id);
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid channel id",
      });
    }

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Channel not found",
      });
    }

    // Cannot exit 'general' channel
    if (channel.name === "general") {
      return res.status(400).json({
        success: false,
        message: "You cannot leave the general channel",
      });
    }

    // Check if user is a member of the channel
    const isMember = channel.members?.some(
      (mId) => mId.toString() === userId
    );
    if (!isMember) {
      return res.status(400).json({
        success: false,
        message: "You are not a member of this channel",
      });
    }

    // Remove user from channel members
    channel.members = channel.members?.filter(
      (mId) => mId.toString() !== userId
    ) || [];
    await channel.save();

    // Log Activity
    await Activity.create({
      user: userId,
      workspace: channel.workspaceId,
      action: "USER_LEFT",
      details: `left channel ${channel.name}`,
    });

    res.status(200).json({
      success: true,
      message: "Exited channel successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
