import path from "node:path";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MAIN_FILE_RE = /^main\.[a-z0-9]+$/i;

/** `{photoUuid}.jpg` or `{photoUuid}_thumb.jpg` (Sharp writes JPEG). */
const ALBUM_JPG_RE =
  /^([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})(_thumb)?\.jpg$/i;

function underRoot(rootResolved: string, full: string): string | null {
  const rel = path.relative(rootResolved, full);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    return null;
  }
  return full;
}

function resolvePersonMain(
  photosRoot: string,
  personId: string,
  fileName: string,
): string | null {
  if (!UUID_RE.test(personId) || fileName.includes("/")) {
    return null;
  }
  if (!MAIN_FILE_RE.test(fileName)) {
    return null;
  }
  const full = path.resolve(photosRoot, personId, fileName);
  const rootResolved = path.resolve(photosRoot);
  return underRoot(rootResolved, full);
}

function resolveAlbumPhoto(
  photosRoot: string,
  albumId: string,
  fileName: string,
): string | null {
  if (!UUID_RE.test(albumId) || fileName.includes("/")) {
    return null;
  }
  if (!ALBUM_JPG_RE.test(fileName)) {
    return null;
  }
  const full = path.resolve(photosRoot, "album", albumId, fileName);
  const rootResolved = path.resolve(photosRoot);
  return underRoot(rootResolved, full);
}

/**
 * Safely resolve a relative path under `PHOTOS_PATH`:
 * - `{personId}/main.ext` — mainPhoto;
 * - `album/{albumId}/{photoId}.jpg` / `…_thumb.jpg` — album photos (phase 35+).
 */
export function resolvePhotoFile(
  photosRoot: string,
  relPosix: string,
): string | null {
  const normalized = relPosix.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalized || normalized.includes("..")) {
    return null;
  }
  const parts = normalized.split("/");
  if (parts.length === 2) {
    return resolvePersonMain(photosRoot, parts[0]!, parts[1]!);
  }
  if (
    parts.length === 3 &&
    parts[0] === "album" &&
    parts[1] != null &&
    parts[2] != null
  ) {
    return resolveAlbumPhoto(photosRoot, parts[1], parts[2]);
  }
  return null;
}
