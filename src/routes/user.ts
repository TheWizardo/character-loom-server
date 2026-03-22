import { Router, Response } from "express";
import { UserModel } from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

/**
 * GET /user
 *
 * Returns the authenticated user's project list.
 * Creates an empty record on first visit.
 *
 * Response: { uid: string, projects: Array<{ id, changedAt, data }> }
 */
router.get("/", requireAuth, async (req, res: Response) => {
  const { uid } = req as AuthRequest;

  try {
    const user = await UserModel.findOneAndUpdate(
      { uid },
      { $setOnInsert: { uid, projects: [] } },
      { upsert: true, new: true, lean: true }
    );

    res.json({
      uid:      user!.uid,
      projects: user!.projects ?? [],
    });
  } catch (err) {
    console.error("[GET /user]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
