/**
 * Server-side payload types.
 *
 * The server stores no project metadata (name, createdAt, etc.) —
 * all of that lives inside the compressed `data` blob.
 * The only server-managed field beyond the blob is `changedAt`,
 * which the server stamps on every write.
 */

/** What the client sends when saving a project */

export interface ProjectData {
  zippedProject: string; // gzip+base64 blob (cl:p:{id} value from localStorage)
  updatedAt: number;
  isPublic: boolean;
}

export interface ProjectPayload {
  id: string; // project UUID
  data: ProjectData;
}

/** What the server stores and returns per project */
export interface StoredProject extends ProjectData {
  id: string;
}
