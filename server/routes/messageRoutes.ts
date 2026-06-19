import express from "express";
import {
  sendMessage,
  getMessagesByChannel,
  deleteMessage,
} from "../controllers/messageController";

const router = express.Router();

router.post("/send", sendMessage);
router.get("/channel/:channelId", getMessagesByChannel);
router.delete("/:id", deleteMessage);

export default router;
