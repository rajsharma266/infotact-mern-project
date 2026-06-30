"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const workspaceController_1 = require("../controllers/workspaceController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.get("/invite/:token", workspaceController_1.validateInviteLink);
router.use(authMiddleware_1.authMiddleware);
router.post("/create", workspaceController_1.createWorkspace);
router.get("/", workspaceController_1.getAllWorkspaces);
router.post("/join", workspaceController_1.joinWorkspaceByInvite);
router.post("/:id/invite", workspaceController_1.generateInviteLink);
router.get("/:id", workspaceController_1.getWorkspaceById);
router.put("/:id", workspaceController_1.updateWorkspace);
router.delete("/:id", workspaceController_1.deleteWorkspace);
exports.default = router;
