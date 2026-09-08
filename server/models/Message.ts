import mongoose, { Document } from "mongoose";

export interface IMessageReaction {
  emoji: string;
  count: number;
  users: mongoose.Types.ObjectId[];
}

export interface IMessage extends Document {
  content: string;
  sender: mongoose.Types.ObjectId;
  channelId: mongoose.Types.ObjectId;
  attachments: string[];
  reactions: IMessageReaction[];
  isPinned: boolean;
  threadRepliesCount: number;
}

const messageSchema = new mongoose.Schema<IMessage>(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },
    attachments: {
      type: [String],
      default: [],
    },
    reactions: [
      {
        emoji: { type: String, required: true },
        count: { type: Number, default: 1 },
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      },
    ],
    isPinned: {
      type: Boolean,
      default: false,
    },
    threadRepliesCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model<IMessage>("Message", messageSchema);

export default Message;
