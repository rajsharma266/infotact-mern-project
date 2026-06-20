import mongoose, { Document } from "mongoose";

export interface IMessage extends Document {
  content: string;
  sender: mongoose.Types.ObjectId;
  channelId: mongoose.Types.ObjectId;
  attachments: string[];
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
  },
  { timestamps: true }
);

const Message = mongoose.model<IMessage>("Message", messageSchema);

export default Message;
