import express from "express";
import {
  createChannel,
  getAllChannels,
  getChannelById,
  updateChannel,
  deleteChannel,
} from "../controllers/channelController";

const router = express.Router();

router.post("/create", createChannel);
router.get("/", getAllChannels);
router.get("/:id", getChannelById);
router.put("/:id", updateChannel);
router.delete("/:id", deleteChannel);

export default router;
