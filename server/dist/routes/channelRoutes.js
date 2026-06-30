"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const channelController_1 = require("../controllers/channelController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.authMiddleware);
router.post("/create", channelController_1.createChannel);
router.get("/", channelController_1.getAllChannels);
router.get("/:id", channelController_1.getChannelById);
router.put("/:id", channelController_1.updateChannel);
router.delete("/:id", channelController_1.deleteChannel);
exports.default = router;
