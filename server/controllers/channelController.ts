import { Request, Response } from "express";
import mongoose from "mongoose";
import Channel from "../models/Channel";
import Workspace from "../models/Workspace";
import User from "../models/User";

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

    // Set up members array - default to the creator
    const memberIds = Array.isArray(members) ? members : [createdBy];
    const normalizedMembers = Array.from(new Set([createdBy, ...memberIds]));

    const channel = await Channel.create({
      name,
      description: description || "",
      workspaceId,
      createdBy,
      isPrivate: isPrivate ?? false,
      type: type || "channel",
      recipientId: recipientId || null,
      members: normalizedMembers,
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
    const filter: any = {};

    if (workspaceId && mongoose.Types.ObjectId.isValid(String(workspaceId))) {
      filter.workspaceId = workspaceId;
    }

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
