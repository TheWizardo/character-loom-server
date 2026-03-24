"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const firebase_1 = require("../firebase");
async function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        res.status(401).json({ error: "Missing Authorization header" });
        return;
    }
    const token = header.slice(7);
    try {
        const decoded = await firebase_1.admin.auth().verifyIdToken(token);
        req.uid = decoded.uid;
        next();
    }
    catch {
        res.status(401).json({ error: "Invalid or expired token" });
    }
}
