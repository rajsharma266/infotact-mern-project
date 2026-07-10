import mongoose, { Document } from "mongoose";

export interface IChannel extends Document {
  name: string;
  description?: string;
  workspaceId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  isPrivate: boolean;
  members: mongoose.Types.ObjectId[];
}

const channelSchema = new mongoose.Schema<IChannel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Channel = mongoose.model<IChannel>("Channel", channelSchema);

export default Channel;
