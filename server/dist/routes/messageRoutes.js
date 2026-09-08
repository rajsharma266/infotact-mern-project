"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const messageController_1 = require("../controllers/messageController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.authMiddleware);
router.post("/send", messageController_1.sendMessage);
router.get("/channel/:channelId", messageController_1.getMessagesByChannel);
router.delete("/:id", messageController_1.deleteMessage);
router.put("/:id/pin", messageController_1.togglePinMessage);
router.post("/:id/react", messageController_1.reactToMessage);
exports.default = router;
