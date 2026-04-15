import fs from "node:fs/promises";
import path from "node:path";
import { getPhotosRoot } from "./photos-root.js";

/** Удаляет файлы по относительным POSIX-путям под `PHOTOS_PATH`. */
export async function unlinkAlbumPhotoFiles(
  relSrc: string,
  relThumb: string | null,
): Promise<void> {
  const root = getPhotosRoot();
  const unlinkOne = async (rel: string) => {
    const full = path.join(root, ...rel.split("/"));
    await fs.unlink(full).catch(() => undefined);
  };
  await unlinkOne(relSrc);
  if (relThumb) {
    await unlinkOne(relThumb);
  }
}
