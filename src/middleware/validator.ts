import { Request, Response, NextFunction } from "express";

export async function isValidProjectPayload(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (typeof req.body !== "object" || req.body === null) {
    res.status(400).json({
      error: "Body must be { id: string, data: { zippedProject: string, updatedAt: number, isPublic: boolean } }",
    });
    return;
  }

  const b = req.body as Record<string, unknown>;

  if (typeof b.id !== "string" || b.id.length === 0) {
    res.status(400).json({
      error: "Body must include a non-empty string id",
    });
    return;
  }

  if (typeof b.data !== "object" || b.data === null) {
    res.status(400).json({
      error: "Body must include data: { zippedProject: string, updatedAt: number, isPublic: boolean }",
    });
    return;
  }

  const data = b.data as Record<string, unknown>;

  const isValid =
    typeof data.zippedProject === "string" &&
    data.zippedProject.length > 0 &&
    typeof data.updatedAt === "number" &&
    Number.isFinite(data.updatedAt) &&
    typeof data.isPublic === "boolean";

  if (!isValid) {
    res.status(400).json({
      error: "Body must be { id: string, data: { zippedProject: string, updatedAt: number, isPublic: boolean } }",
    });
    return;
  }

  next();
}