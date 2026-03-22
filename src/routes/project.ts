import { Router, Response } from "express";
import { UserModel } from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { ProjectData, ProjectPayload, StoredProject } from "../types";

const router = Router();

// ── validation ────────────────────────────────────────────

function isValidPayload(body: unknown): body is ProjectPayload {
  if (typeof body !== "object" || body === null) return false;

  const b = body as Record<string, unknown>;
  if (typeof b.id !== "string" || b.id.length === 0) return false;
  if (typeof b.data !== "object" || b.data === null) return false;

  const data = b.data as Record<string, unknown>;
  return (
    typeof data.zippedProject === "string" &&
    data.zippedProject.length > 0 &&
    typeof data.updatedAt === "number" &&
    Number.isFinite(data.updatedAt)
  );
}

// ── PUT /project ──────────────────────────────────────────

/**
 * Upserts a project for the authenticated user.
 * `changedAt` is always stamped server-side — the client never sets it.
 *
 * Body:  { id: string, data: string }
 * Response: { ok: true, projectId: string, changedAt: number }
 */
router.put("/", requireAuth, async (req, res: Response) => {
  const { uid } = req as AuthRequest;

  if (!isValidPayload(req.body)) {
    res.status(400).json({ error: "Body must be { id: string, data: { payload: string, updatedAt: number } }" });
    return;
  }

  const { id, data } = req.body;
  const stored: StoredProject = {
    id,
    ...data
  };

  try {
    // Ensure user document exists
    await UserModel.findOneAndUpdate(
      { uid },
      { $setOnInsert: { uid, projects: [] } },
      { upsert: true }
    );

    // Try to replace existing project in-place
    const matched = await UserModel.findOneAndUpdate(
      { uid, "projects.id": id },
      { $set: { "projects.$": stored } }
    );

    if (!matched) {
      // New project — append
      await UserModel.updateOne({ uid }, { $push: { projects: stored } });
    }

    res.json({ ok: true, projectId: id, data });
  } catch (err) {
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
router.delete("/:id", requireAuth, async (req, res: Response) => {
  const { uid } = req as AuthRequest;
  const projectId = req.params.id;

  if (!projectId) {
    res.status(400).json({ error: "Missing project id" });
    return;
  }

  try {
    const user = await UserModel.findOne({ uid }, { projects: 1 }).lean();

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

    await UserModel.updateOne({ uid }, { $pull: { projects: { id: projectId } } });

    res.json({ ok: true, projectId });
  } catch (err) {
    console.error("[DELETE /project/:id]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


export default router;
