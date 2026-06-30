"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./config/db"));
const PORT = Number(process.env.PORT) || 4000;
const startServer = async () => {
    await (0, db_1.default)();
    const server = http_1.default.createServer(app_1.default);
    server.listen(PORT, () => {
        console.log(`Server is successfully running on http://localhost:${PORT}`);
    });
};
startServer().catch((error) => {
    console.error("Failed to start server");
    console.error(error);
    process.exit(1);
});
