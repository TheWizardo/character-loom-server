"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const express_rate_limit_1 = require("express-rate-limit");
const firebase_1 = require("./firebase");
const user_1 = __importDefault(require("./routes/user"));
const project_1 = __importDefault(require("./routes/project"));
const share_1 = __importDefault(require("./routes/share"));
const logger_1 = __importDefault(require("./middleware/logger"));
// ── Validate required env vars ────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_NAME = process.env.MONGODB_NAME;
const PORT = parseInt(process.env.PORT ?? "4000", 10);
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "http://localhost:3000")
    .split(",").map((s) => s.trim());
if (!MONGODB_URI) {
    console.error("MONGODB_URI is not set. Check your .env file.");
    process.exit(1);
}
// ── Firebase ──────────────────────────────────────────────
(0, firebase_1.initFirebase)();
// ── Express app ───────────────────────────────────────────
const app = (0, express_1.default)();
app.use(logger_1.default);
app.use((0, cors_1.default)({
    origin: (origin, cb) => {
        // Allow requests with no origin (e.g. curl, Postman) or matching origins
        if (!origin || ALLOWED_ORIGINS.includes(origin))
            return cb(null, true);
        cb(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
}));
app.use(express_1.default.json({ limit: "2mb" })); // compressed project blobs can be sizeable
// Global rate limiter — 120 requests per minute per IP
app.use((0, express_rate_limit_1.rateLimit)({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please slow down." },
}));
// ── Routes ────────────────────────────────────────────────
app.use("/user", user_1.default);
app.use("/project", project_1.default);
app.use("/share", share_1.default);
// Health check — useful for uptime monitors / deployment checks
app.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));
// 404 fallback
app.use((_req, res) => res.status(404).json({ error: "Not found" }));
// ── MongoDB + listen ──────────────────────────────────────
mongoose_1.default
    .connect(MONGODB_URI + MONGODB_NAME)
    .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
})
    .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
});
