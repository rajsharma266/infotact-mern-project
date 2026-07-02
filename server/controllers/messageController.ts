import { Request, Response } from "express";
import mongoose from "mongoose";
import Message from "../models/Message";
import User from "../models/User";
import Channel from "../models/Channel";
import Workspace from "../models/Workspace";
import { MESSAGE_SOCKET_EVENTS, getChannelRoom } from "../socket/messageEvents";

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
    const userId = req.user?.id || sender;

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

    // Verify channel access
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

      // Add user to channel members array if not already present
      const isChannelMember = channel.members?.some(
        (mId) => mId.toString() === userId
      );
      if (!isChannelMember) {
        channel.members = channel.members || [];
        channel.members.push(new mongoose.Types.ObjectId(userId));
        await channel.save();
      }
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

    // Emit live Socket.io event
    const io = req.app.get("io");
    if (io) {
      io.to(getChannelRoom(channelId.toString())).emit(MESSAGE_SOCKET_EVENTS.MESSAGE_CREATED, {
        channelId: channelId.toString(),
        message: populatedMessage,
      });
    }

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
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

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

    // Verify channel access
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

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    const channelId = message.channelId;
    await message.deleteOne();

    // Emit live Socket.io event
    const io = req.app.get("io");
    if (io) {
      io.to(getChannelRoom(channelId.toString())).emit(MESSAGE_SOCKET_EVENTS.MESSAGE_DELETED, {
        channelId: channelId.toString(),
        messageId: id,
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

export const togglePinMessage = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message id",
      });
    }

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    message.isPinned = !message.isPinned;
    await message.save();

    const populated = await Message.findById(id).populate(messagePopulateOptions);

    const io = req.app.get("io");
    if (io) {
      io.to(getChannelRoom(message.channelId.toString())).emit("message:updated", populated);
    }

    res.status(200).json({
      success: true,
      message: message.isPinned ? "Message pinned" : "Message unpinned",
      data: populated,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const reactToMessage = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { emoji, userId } = req.body;

    if (!emoji || !userId) {
      return res.status(400).json({
        success: false,
        message: "emoji and userId are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message or user id",
      });
    }

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    const reactions = message.reactions || [];
    const reactIndex = reactions.findIndex((r) => r.emoji === emoji);

    if (reactIndex > -1) {
      const reaction = reactions[reactIndex];
      const userIndex = reaction.users.findIndex((u) => u.toString() === userId);

      if (userIndex > -1) {
        // Remove reaction if user already reacted
        reaction.users.splice(userIndex, 1);
        reaction.count -= 1;
        if (reaction.count === 0 || reaction.users.length === 0) {
          reactions.splice(reactIndex, 1);
        }
      } else {
        // Add user to reaction
        reaction.users.push(new mongoose.Types.ObjectId(userId));
        reaction.count += 1;
      }
    } else {
      // Create new reaction
      reactions.push({
        emoji,
        count: 1,
        users: [new mongoose.Types.ObjectId(userId)],
      });
    }

    message.reactions = reactions;
    await message.save();

    const populated = await Message.findById(id).populate(messagePopulateOptions);

    const io = req.app.get("io");
    if (io) {
      io.to(getChannelRoom(message.channelId.toString())).emit("message:updated", populated);
    }

    res.status(200).json({
      success: true,
      message: "Reaction updated successfully",
      data: populated,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
