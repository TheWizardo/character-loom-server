import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { rateLimit } from "express-rate-limit";
import { initFirebase } from "./firebase";
import userRouter   from "./routes/user";
import projectRouter from "./routes/project";
import logger from "./middleware/logger";

// ── Validate required env vars ────────────────────────────
const MONGODB_URI      = process.env.MONGODB_URI;
const PORT             = parseInt(process.env.PORT ?? "4000", 10);
const ALLOWED_ORIGINS  = (process.env.ALLOWED_ORIGINS ?? "http://localhost:3000")
  .split(",").map((s) => s.trim());

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not set. Check your .env file.");
  process.exit(1);
}

// ── Firebase ──────────────────────────────────────────────
initFirebase();

// ── Express app ───────────────────────────────────────────
const app = express();

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (e.g. curl, Postman) or matching origins
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true,
}));

app.use(express.json({ limit: "2mb" })); // compressed project blobs can be sizeable

// Global rate limiter — 120 requests per minute per IP
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please slow down." },
}));

app.use(logger);

// ── Routes ────────────────────────────────────────────────
app.use("/user",    userRouter);
app.use("/project", projectRouter);

// Health check — useful for uptime monitors / deployment checks
app.get("/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

// 404 fallback
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

// ── MongoDB + listen ──────────────────────────────────────
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });
