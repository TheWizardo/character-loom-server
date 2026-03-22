import admin from "firebase-admin";
import path from "path";
import fs from "fs";

/**
 * Initialise Firebase Admin SDK.
 * Supports two config strategies (see .env.example):
 *   (a) FIREBASE_SERVICE_ACCOUNT_PATH — path to the downloaded JSON file
 *   (b) FIREBASE_PROJECT_ID + FIREBASE_PRIVATE_KEY + FIREBASE_CLIENT_EMAIL
 */
export function initFirebase(): void {
  if (admin.apps.length > 0) return; // already initialised

  const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (filePath) {
    const resolved = path.resolve(filePath);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Firebase service account file not found: ${resolved}`);
    }
    const serviceAccount = JSON.parse(fs.readFileSync(resolved, "utf8"));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    return;
  }

  // Inline env vars
  const projectId   = process.env.FIREBASE_PROJECT_ID;
  const privateKey  = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!projectId || !privateKey || !clientEmail) {
    throw new Error(
      "Firebase is not configured. " +
      "Set FIREBASE_SERVICE_ACCOUNT_PATH or the three FIREBASE_* env vars."
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert({ projectId, privateKey, clientEmail }),
  });
}

export { admin };
