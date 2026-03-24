"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = void 0;
exports.initFirebase = initFirebase;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
exports.admin = firebase_admin_1.default;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
/**
 * Initialise Firebase Admin SDK.
 * Supports two config strategies (see .env.example):
 *   (a) FIREBASE_SERVICE_ACCOUNT_PATH — path to the downloaded JSON file
 *   (b) FIREBASE_PROJECT_ID + FIREBASE_PRIVATE_KEY + FIREBASE_CLIENT_EMAIL
 */
function initFirebase() {
    if (firebase_admin_1.default.apps.length > 0)
        return; // already initialised
    const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (filePath) {
        const resolved = path_1.default.resolve(filePath);
        if (!fs_1.default.existsSync(resolved)) {
            throw new Error(`Firebase service account file not found: ${resolved}`);
        }
        const serviceAccount = JSON.parse(fs_1.default.readFileSync(resolved, "utf8"));
        firebase_admin_1.default.initializeApp({ credential: firebase_admin_1.default.credential.cert(serviceAccount) });
        return;
    }
    // Inline env vars
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    if (!projectId || !privateKey || !clientEmail) {
        throw new Error("Firebase is not configured. " +
            "Set FIREBASE_SERVICE_ACCOUNT_PATH or the three FIREBASE_* env vars.");
    }
    firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert({ projectId, privateKey, clientEmail }),
    });
}
