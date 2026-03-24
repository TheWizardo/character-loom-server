"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidProjectPayload = isValidProjectPayload;
async function isValidProjectPayload(req, res, next) {
    if (typeof req.body !== "object" || req.body === null) {
        res.status(400).json({
            error: "Body must be { id: string, data: { zippedProject: string, updatedAt: number, isPublic: boolean } }",
        });
        return;
    }
    const b = req.body;
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
    const data = b.data;
    const isValid = typeof data.zippedProject === "string" &&
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
