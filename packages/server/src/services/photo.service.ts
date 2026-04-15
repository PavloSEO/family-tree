import { eq } from "drizzle-orm";
import type { Photo } from "@family-tree/shared";
import { photoSchema, photoUpdateSchema } from "@family-tree/shared";
import { db } from "../db/connection.js";
import { photos } from "../db/schema.js";
import { unlinkAlbumPhotoFiles } from "../lib/album-photo-files.js";

export class PhotoNotFoundError extends Error {
  constructor(id: string) {
    super(`Фото не найдено: ${id}`);
    this.name = "PhotoNotFoundError";
  }
}

function mapPhotoRow(row: typeof photos.$inferSelect): Photo {
  return photoSchema.parse({
    id: row.id,
    albumId: row.albumId,
    src: row.src,
    thumbnail: row.thumbnail ?? null,
    description: row.description ?? null,
    dateTaken: row.dateTaken ?? null,
    year: row.year ?? null,
    location: row.location ?? null,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
  });
}

const photoMetaUpdateSchema = photoUpdateSchema
  .omit({ albumId: true, src: true, thumbnail: true })
  .strict();

export async function getPhotoById(id: string): Promise<Photo | null> {
  const row = await db.query.photos.findFirst({
    where: eq(photos.id, id),
  });
  return row ? mapPhotoRow(row) : null;
}

export async function updatePhoto(id: string, raw: unknown): Promise<Photo> {
  const existing = await getPhotoById(id);
  if (!existing) {
    throw new PhotoNotFoundError(id);
  }
  const patch = photoMetaUpdateSchema.parse(raw);
  if (Object.keys(patch).length === 0) {
    return existing;
  }
  await db
    .update(photos)
    .set({
      ...(patch.description !== undefined
        ? { description: patch.description }
        : {}),
      ...(patch.dateTaken !== undefined ? { dateTaken: patch.dateTaken } : {}),
      ...(patch.year !== undefined ? { year: patch.year } : {}),
      ...(patch.location !== undefined ? { location: patch.location } : {}),
      ...(patch.sortOrder !== undefined ? { sortOrder: patch.sortOrder } : {}),
    })
    .where(eq(photos.id, id));
  const updated = await getPhotoById(id);
  if (!updated) {
    throw new PhotoNotFoundError(id);
  }
  return updated;
}

export async function deletePhoto(id: string): Promise<void> {
  const row = await db.query.photos.findFirst({
    where: eq(photos.id, id),
    columns: { id: true, src: true, thumbnail: true },
  });
  if (!row) {
    throw new PhotoNotFoundError(id);
  }
  await unlinkAlbumPhotoFiles(row.src, row.thumbnail ?? null);
  await db.delete(photos).where(eq(photos.id, id));
}
