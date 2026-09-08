import { Request, Response } from "express";
import mongoose from "mongoose";
import Activity from "../models/Activity";

export const getActivitiesByWorkspace = async (
  req: Request,
  res: Response
) => {
  try {
    const workspaceId = String(req.params.workspaceId);

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid workspace id",
      });
    }

    const activities = await Activity.find({ workspace: workspaceId })
      .populate("user", "name email avatar")
      .populate("workspace", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      message: "Activities fetched successfully",
      data: activities,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};