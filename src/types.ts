/**
 * Server-side payload types.
 *
 * The server stores no project metadata (name, createdAt, etc.) —
 * all of that lives inside the compressed `data` blob.
 * The only server-managed field beyond the blob is `changedAt`,
 * which the server stamps on every write.
 */

/** What the client sends when saving a project */
export interface ProjectPayload {
  id:   string; // project UUID
  data: string; // gzip+base64 blob (cl:p:{id} value from localStorage)
}

/** What the server stores and returns per project */
export interface StoredProject {
  id:        string;
  changedAt: number; // set by the server on every PUT — Unix ms
  data:      string;
}
