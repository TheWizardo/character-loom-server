import { Request, Response, NextFunction } from "express";
import { admin } from "../firebase";

/**
 * Verifies the Firebase ID token sent in the Authorization header.
 *
 * Frontend must send:
 *   Authorization: Bearer <firebase_id_token>
 *
 * On success, attaches `req.uid` (the Google UID) for downstream handlers.
 * On failure, responds 401 immediately.
 */
export interface AuthRequest extends Request {
  uid: string;
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing Authorization header" });
    return;
  }

  const token = header.slice(7);

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    (req as AuthRequest).uid = decoded.uid;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
