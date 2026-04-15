import path from "node:path";

/** Storage directory for mainPhoto files etc. (`PHOTOS_PATH`, else `<cwd>/data/photos`). */
export function getPhotosRoot(): string {
  const raw = process.env.PHOTOS_PATH?.trim();
  if (raw && raw.length > 0) {
    return path.resolve(raw);
  }
  return path.resolve(process.cwd(), "data", "photos");
}
