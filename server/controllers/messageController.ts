import { Request, Response } from "express";
import mongoose from "mongoose";
import Message from "../models/Message";
import User from "../models/User";
import Channel from "../models/Channel";

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

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { content, sender, channelId, attachments } = req.body;

    if (!content || !sender || !channelId) {
      return res.status(400).json({
        success: false,
        message: "content, sender and channelId are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(sender) ||
      !mongoose.Types.ObjectId.isValid(channelId)
    ) {
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

    const user = await User.findById(sender);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const channel = await Channel.findById(channelId);

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Channel not found",
      });
    }

    const message = await Message.create({
      content,
      sender,
      channelId,
      attachments: attachments || [],
    });

    const populatedMessage = await Message.findById(message._id).populate(
      messagePopulateOptions
    );

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const getMessagesByChannel = async (req: Request, res: Response) => {
  try {
    const channelId = String(req.params.channelId);

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

    const messages = await Message.find({ channelId })
      .populate(messagePopulateOptions)
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      message: "Messages fetched successfully",
      data: messages,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message id",
      });
    }

    const message = await Message.findByIdAndDelete(id);

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
