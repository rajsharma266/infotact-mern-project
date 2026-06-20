import mongoose, { Document } from "mongoose";

export interface IWorkspace extends Document {
  name: string;
  description?: string;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
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
  },
  { timestamps: true }
);

const Workspace = mongoose.model<IWorkspace>("Workspace", workspaceSchema);

export default Workspace;