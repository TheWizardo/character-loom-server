import mongoose, { Schema, Document } from "mongoose";
import { StoredProject } from "./types";

/**
 * One MongoDB document per Google UID.
 *
 * Projects are stored as an array of { id, changedAt, data }.
 * No project metadata (name, createdAt, etc.) is kept here —
 * everything about the project lives inside the compressed data blob.
 */
interface UserDocument extends Document {
  uid: string;
  projects: StoredProject[];
}

const ProjectSchema = new Schema<StoredProject>(
  {
    id: { type: String, required: true },
    updatedAt: { type: Number, required: true },
    zippedProject: { type: String, required: true },
    isPublic: { type: Boolean, required: true }
  },
  { _id: false }
);

const UserSchema = new Schema<UserDocument>(
  {
    uid: { type: String, required: true, unique: true, index: true },
    projects: { type: [ProjectSchema], default: [] },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<UserDocument>("Users", UserSchema);
