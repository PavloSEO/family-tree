import { and, eq } from "drizzle-orm";
import type { PhotoTag } from "@family-tree/shared";
import { photoTagCreateSchema, photoTagSchema } from "@family-tree/shared";
import { db } from "../db/connection.js";
import { persons, photos, taggedPersons } from "../db/schema.js";
import { PhotoNotFoundError } from "./photo.service.js";

export class PhotoTagNotFoundError extends Error {
  constructor(id: string) {
    super(`Разметка не найдена: ${id}`);
    this.name = "PhotoTagNotFoundError";
  }
}

function mapTagRow(row: typeof taggedPersons.$inferSelect): PhotoTag {
  return photoTagSchema.parse({
    id: row.id,
    photoId: row.photoId,
    personId: row.personId,
    x: row.x,
    y: row.y,
    width: row.width,
    height: row.height,
  });
}

export async function listTagsForPhoto(photoId: string): Promise<PhotoTag[]> {
  const rows = await db.query.taggedPersons.findMany({
    where: eq(taggedPersons.photoId, photoId),
  });
  return rows.map(mapTagRow);
}

export async function createPhotoTag(
  photoId: string,
  raw: unknown,
): Promise<PhotoTag> {
  const photo = await db.query.photos.findFirst({
    where: eq(photos.id, photoId),
    columns: { id: true },
  });
  if (!photo) {
    throw new PhotoNotFoundError(photoId);
  }
  const body = photoTagCreateSchema.parse(raw);

  const person = await db.query.persons.findFirst({
    where: eq(persons.id, body.personId),
    columns: { id: true },
  });
  if (!person) {
    throw new Error("Человек не найден");
  }

  const dup = await db.query.taggedPersons.findFirst({
    where: and(
      eq(taggedPersons.photoId, photoId),
      eq(taggedPersons.personId, body.personId),
    ),
  });
  if (dup) {
    throw new Error("Для этого человека разметка на фото уже существует");
  }

  const id = crypto.randomUUID();
  await db.insert(taggedPersons).values({
    id,
    photoId,
    personId: body.personId,
    x: body.x,
    y: body.y,
    width: body.width,
    height: body.height,
  });

  const row = await db.query.taggedPersons.findFirst({
    where: eq(taggedPersons.id, id),
  });
  if (!row) {
    throw new Error("Не удалось сохранить разметку");
  }
  return mapTagRow(row);
}

export async function deletePhotoTag(
  photoId: string,
  tagId: string,
): Promise<void> {
  const tag = await db.query.taggedPersons.findFirst({
    where: and(
      eq(taggedPersons.id, tagId),
      eq(taggedPersons.photoId, photoId),
    ),
  });
  if (!tag) {
    throw new PhotoTagNotFoundError(tagId);
  }
  await db.delete(taggedPersons).where(eq(taggedPersons.id, tagId));
}
