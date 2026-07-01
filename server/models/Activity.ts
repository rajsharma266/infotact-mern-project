import mongoose, { Schema, Document } from "mongoose";

export interface IActivity extends Document {
  user: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  action: string;
  details?: string;
  createdAt: Date;
}

const activitySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    action: {
      type: String,
      required: true,
      enum: [
        "WORKSPACE_CREATED",
        "CHANNEL_CREATED",
        "USER_JOINED",
        "USER_LEFT",
        "INVITE_GENERATED"
      ],
    },

    details: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IActivity>(
  "Activity",
  activitySchema
);