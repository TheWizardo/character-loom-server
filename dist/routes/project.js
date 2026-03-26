"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const validator_1 = require("../middleware/validator");
const router = (0, express_1.Router)();
// ── PUT /project ──────────────────────────────────────────
/**
 * Upserts a project for the authenticated user.
 * `changedAt` is always stamped server-side — the client never sets it.
 *
 * Body:  { id: string, data: string }
 * Response: { ok: true, projectId: string, changedAt: number }
 */
router.put("/", auth_1.requireAuth, validator_1.isValidProjectPayload, async (req, res) => {
    const { uid } = req;
    const { id, data } = req.body;
    const stored = {
        id,
        ...{ ...data, updatedAt: Date.now() }
    };
    try {
        // Ensure user document exists
        await db_1.UserModel.findOneAndUpdate({ uid }, { $setOnInsert: { uid, projects: [] } }, { upsert: true });
        // Try to replace existing project in-place
        const matched = await db_1.UserModel.findOneAndUpdate({ uid, "projects.id": id }, { $set: { "projects.$": stored } });
        if (!matched) {
            // New project — append
            await db_1.UserModel.updateOne({ uid }, { $push: { projects: stored } });
        }
        res.json({ ok: true, projectId: id, data });
    }
    catch (err) {
        console.error("[PUT /project]", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
// ── DELETE /project/:id ───────────────────────────────────
/**
 * Removes a project from the user's list.
 * Returns 404 if not found, 409 if it's the user's only project.
 *
 * Response: { ok: true, projectId: string }
 */
router.delete("/:id", auth_1.requireAuth, async (req, res) => {
    const { uid } = req;
    const projectId = req.params.id;
    if (!projectId) {
        res.status(400).json({ error: "Missing project id" });
        return;
    }
    try {
        const user = await db_1.UserModel.findOne({ uid }, { projects: 1 }).lean();
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        if (!user.projects.some((p) => p.id === projectId)) {
            res.status(404).json({ error: "Project not found" });
            return;
        }
        if (user.projects.length === 1) {
            res.status(409).json({ error: "Cannot delete the only project. Create a replacement first." });
            return;
        }
        await db_1.UserModel.updateOne({ uid }, { $pull: { projects: { id: projectId } } });
        res.json({ ok: true, projectId });
    }
    catch (err) {
        console.error("[DELETE /project/:id]", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
