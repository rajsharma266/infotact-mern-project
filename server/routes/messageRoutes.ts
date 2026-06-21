import express from "express";
import {
  sendMessage,
  getMessagesByChannel,
  deleteMessage,
} from "../controllers/messageController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.use(authMiddleware);
router.post("/send", sendMessage);
router.get("/channel/:channelId", getMessagesByChannel);
router.delete("/:id", deleteMessage);

export default router;
