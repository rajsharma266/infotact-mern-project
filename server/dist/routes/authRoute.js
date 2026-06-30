"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
router.post("/create", authController_1.createUser);
router.post("/register", authController_1.registerUser);
router.post("/login", authController_1.loginUser);
router.get("/", authMiddleware_1.authMiddleware, authController_1.getAllUsers);
router.get("/profile", authMiddleware_1.authMiddleware, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Protected Route Accessed",
        user: req.user ?? null,
    });
});
router.get("/:id", authMiddleware_1.authMiddleware, authController_1.getUserById);
router.put("/:id", authMiddleware_1.authMiddleware, authController_1.updateUser);
router.delete("/:id", authMiddleware_1.authMiddleware, authController_1.deleteUser);
exports.default = router;
