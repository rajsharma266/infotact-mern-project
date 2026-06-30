import express from "express";
import {
  sendMessage,
  getMessagesByChannel,
  deleteMessage,
  togglePinMessage,
  reactToMessage,
} from "../controllers/messageController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.use(authMiddleware);
router.post("/send", sendMessage);
router.get("/channel/:channelId", getMessagesByChannel);
router.delete("/:id", deleteMessage);
router.put("/:id/pin", togglePinMessage);
router.post("/:id/react", reactToMessage);

export default router;
