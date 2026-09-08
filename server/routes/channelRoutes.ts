import express from "express";
import {
  createChannel,
  getAllChannels,
  getChannelById,
  updateChannel,
  deleteChannel,
  exitChannel,
} from "../controllers/channelController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.use(authMiddleware);
router.post("/create", createChannel);
router.get("/", getAllChannels);
router.post("/:id/exit", exitChannel);
router.get("/:id", getChannelById);
router.put("/:id", updateChannel);
router.delete("/:id", deleteChannel);

export default router;
