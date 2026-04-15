import { and, asc, eq, inArray, sql } from "drizzle-orm";
import type {
  Album,
  AlbumCreate,
  AlbumListItem,
  AlbumUpdate,
  Photo,
} from "@family-tree/shared";
import {
  albumCreateSchema,
  albumListItemSchema,
  albumSchema,
  albumUpdateSchema,
  photoSchema,
} from "@family-tree/shared";
import { z } from "zod";
import { db } from "../db/connection.js";
import { albums, photos } from "../db/schema.js";

type PhotoRow = typeof photos.$inferSelect;
import { unlinkAlbumPhotoFiles } from "../lib/album-photo-files.js";

export class AlbumNotFoundError extends Error {
  constructor(id: string) {
    super(`Альбом не найден: ${id}`);
    this.name = "AlbumNotFoundError";
  }
}

function mapAlbumRow(row: typeof albums.$inferSelect): Album {
  return albumSchema.parse({
    id: row.id,
    title: row.title,
    description: row.description ?? null,
    year: row.year ?? null,
    ownerId: row.ownerId ?? null,
    coverPhotoIndex: row.coverPhotoIndex,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
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

const listQuerySchema = z.object({
  ownerId: z.string().uuid().optional(),
  year: z.coerce.number().int().optional(),
});

export type AlbumListQuery = z.infer<typeof listQuerySchema>;

export async function listAlbums(
  query: Record<string, string | undefined>,
): Promise<AlbumListItem[]> {
  const q = listQuerySchema.parse(query);
  const conds = [];
  if (q.ownerId) {
    conds.push(eq(albums.ownerId, q.ownerId));
  }
  if (q.year != null) {
    conds.push(eq(albums.year, q.year));
  }
  const where = conds.length === 0 ? undefined : and(...conds);
  const rows = await db.query.albums.findMany({
    where,
    orderBy: [asc(albums.year), asc(albums.title)],
  });
  const mapped = rows.map(mapAlbumRow);
  if (mapped.length === 0) {
    return [];
  }
  const ids = mapped.map((a) => a.id);
  const photoRows = await db.query.photos.findMany({
    where: inArray(photos.albumId, ids),
  });
  const grouped = new Map<string, PhotoRow[]>();
  for (const p of photoRows) {
    const list = grouped.get(p.albumId) ?? [];
    list.push(p);
    grouped.set(p.albumId, list);
  }
  for (const list of grouped.values()) {
    list.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return a.createdAt.localeCompare(b.createdAt);
    });
  }
  return mapped.map((album) => {
    const list = grouped.get(album.id) ?? [];
    let coverThumb: string | null = null;
    if (list.length > 0) {
      const idx = Math.min(
        Math.max(0, album.coverPhotoIndex),
        list.length - 1,
      );
      const cover = list[idx] ?? list[0];
      coverThumb = cover?.thumbnail ?? cover?.src ?? null;
    }
    return albumListItemSchema.parse({
      ...album,
      coverThumbnail: coverThumb,
    });
  });
}

export async function getAlbumById(id: string): Promise<Album | null> {
  const row = await db.query.albums.findFirst({
    where: eq(albums.id, id),
  });
  return row ? mapAlbumRow(row) : null;
}

export async function getAlbumWithPhotos(id: string): Promise<{
  album: Album;
  photos: Photo[];
} | null> {
  const album = await getAlbumById(id);
  if (!album) {
    return null;
  }
  const photoRows = await db.query.photos.findMany({
    where: eq(photos.albumId, id),
    orderBy: [asc(photos.sortOrder), asc(photos.createdAt)],
  });
  return { album, photos: photoRows.map(mapPhotoRow) };
}

export async function createAlbum(raw: unknown): Promise<Album> {
  const input = albumCreateSchema.parse(raw);
  const id = crypto.randomUUID();
  const now = sql`(datetime('now'))`;
  await db.insert(albums).values({
    id,
    title: input.title,
    description: input.description ?? null,
    year: input.year ?? null,
    ownerId: input.ownerId ?? null,
    coverPhotoIndex: input.coverPhotoIndex ?? 0,
    createdAt: now,
    updatedAt: now,
  });
  const created = await getAlbumById(id);
  if (!created) {
    throw new Error("Не удалось создать альбом");
  }
  return created;
}

export async function updateAlbum(id: string, raw: unknown): Promise<Album> {
  const existing = await getAlbumById(id);
  if (!existing) {
    throw new AlbumNotFoundError(id);
  }
  const patch = albumUpdateSchema.parse(raw);
  if (Object.keys(patch).length === 0) {
    return existing;
  }
  await db
    .update(albums)
    .set({
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.description !== undefined
        ? { description: patch.description }
        : {}),
      ...(patch.year !== undefined ? { year: patch.year } : {}),
      ...(patch.ownerId !== undefined ? { ownerId: patch.ownerId } : {}),
      ...(patch.coverPhotoIndex !== undefined
        ? { coverPhotoIndex: patch.coverPhotoIndex }
        : {}),
      updatedAt: sql`(datetime('now'))`,
    })
    .where(eq(albums.id, id));
  const updated = await getAlbumById(id);
  if (!updated) {
    throw new AlbumNotFoundError(id);
  }
  return updated;
}

export async function deleteAlbum(id: string): Promise<void> {
  const existing = await getAlbumById(id);
  if (!existing) {
    throw new AlbumNotFoundError(id);
  }
  const photoRows = await db.query.photos.findMany({
    where: eq(photos.albumId, id),
    columns: { src: true, thumbnail: true },
  });
  for (const p of photoRows) {
    await unlinkAlbumPhotoFiles(p.src, p.thumbnail);
  }
  await db.delete(albums).where(eq(albums.id, id));
}
