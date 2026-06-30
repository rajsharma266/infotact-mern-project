import express from "express";
import {
  createWorkspace,
  getAllWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  generateInviteLink,
  validateInviteLink,
  joinWorkspaceByInvite,
} from "../controllers/workspaceController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();


router.get("/invite/:token", validateInviteLink);
router.use(authMiddleware);
router.post("/create", createWorkspace);
router.get("/", getAllWorkspaces);

router.post("/join", joinWorkspaceByInvite);
router.post("/:id/invite", generateInviteLink);
router.get("/:id", getWorkspaceById);
router.put("/:id", updateWorkspace);
router.delete("/:id", deleteWorkspace);




export default router;
