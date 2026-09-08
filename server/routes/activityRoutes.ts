import express from "express";
import { getActivitiesByWorkspace } from "../controllers/activityController";

const router = express.Router();

router.get("/:workspaceId", getActivitiesByWorkspace);

export default router;