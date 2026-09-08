"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dbConnect = async () => {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
        throw new Error("MONGO_URL is not set. Update server/.env before starting the API.");
    }
    try {
        await mongoose_1.default.connect(mongoUrl, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("DB connected successfully");
    }
    catch (error) {
        console.error("Failed to connect to MongoDB");
        throw error;
    }
};
exports.default = dbConnect;
