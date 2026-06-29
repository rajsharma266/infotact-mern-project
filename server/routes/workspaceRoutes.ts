import express from "express";
import {
  createWorkspace,
  getAllWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  generateInviteLink,
} from "../controllers/workspaceController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.use(authMiddleware);
router.post("/create", createWorkspace);
router.get("/", getAllWorkspaces);
router.get("/:id", getWorkspaceById);
router.put("/:id", updateWorkspace);
router.delete("/:id", deleteWorkspace);
router.post("/:id/invite", generateInviteLink);

export default router;
