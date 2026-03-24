"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * GET /user
 *
 * Returns the authenticated user's project list.
 * Creates an empty record on first visit.
 *
 * Response: { uid: string, projects: Array<{ id, changedAt, data }> }
 */
router.get("/", auth_1.requireAuth, async (req, res) => {
    const { uid } = req;
    try {
        const user = await db_1.UserModel.findOneAndUpdate({ uid }, { $setOnInsert: { uid, projects: [] } }, { upsert: true, new: true, lean: true });
        res.json({
            uid: user.uid,
            projects: user.projects ?? [],
        });
    }
    catch (err) {
        console.error("[GET /user]", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
