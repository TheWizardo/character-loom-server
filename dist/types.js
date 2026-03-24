"use strict";
/**
 * Server-side payload types.
 *
 * The server stores no project metadata (name, createdAt, etc.) —
 * all of that lives inside the compressed `data` blob.
 * The only server-managed field beyond the blob is `changedAt`,
 * which the server stamps on every write.
 */
Object.defineProperty(exports, "__esModule", { value: true });
