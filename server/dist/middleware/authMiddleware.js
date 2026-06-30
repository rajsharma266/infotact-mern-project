"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Access Denied. No Token Provided",
            });
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({
                success: false,
                message: "JWT_SECRET is not configured",
            });
        }
        const token = authHeader.startsWith("Bearer ")
            ? authHeader.slice(7).trim()
            : authHeader.trim();
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        req.user = {
            id: decoded.id,
            role: decoded.role,
        };
        next();
    }
    catch {
        return res.status(401).json({
            success: false,
            message: "Invalid Token",
        });
    }
};
exports.authMiddleware = authMiddleware;
