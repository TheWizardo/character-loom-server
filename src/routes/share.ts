import { Router, Response } from "express";
import { UserModel } from "../db";
import { StoredProject } from "../types";

const router = Router();

router.get("/:uid/:pid", async (req, res: Response) => {
  const { uid, pid } = req.params;

  try {
    const userDoc = await UserModel.findOne({ uid });

    if (!userDoc) {
      res.status(404).json({ error: "Data not found" });
      return;
    }

    const project = userDoc.projects.find((p) => String(p.id) === pid);

    if (!project) {
      res.status(404).json({ error: "Data not found" });
      return;
    }

    if (!project.isPublic) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    res.status(200).json({ data: project.zippedProject });
  } catch (err) {
    console.error("Failed to fetch public project:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;