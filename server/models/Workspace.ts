import mongoose, { Document } from "mongoose";

export interface IWorkspace extends Document {
  name: string;
  description?: string;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  inviteToken?: string;
  inviteExpiresAt?: Date;
}

const workspaceSchema = new mongoose.Schema<IWorkspace>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      
    ],
    inviteToken: {
    type: String,
    default: null,
    },

    inviteExpiresAt: {
    type: Date,
    default: null,
    },
  },
  { timestamps: true }
);

const Workspace = mongoose.model<IWorkspace>("Workspace", workspaceSchema);

export default Workspace;