import { eq, sql } from "drizzle-orm";
import exifr from "exifr";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { Photo } from "@family-tree/shared";
import { photoSchema } from "@family-tree/shared";
import { db } from "../db/connection.js";
import { photos } from "../db/schema.js";
import { unlinkAlbumPhotoFiles } from "../lib/album-photo-files.js";
import { getPhotosRoot } from "../lib/photos-root.js";
import { getAlbumById, AlbumNotFoundError } from "./album.service.js";

const SHARP_FORMATS = new Set(["jpeg", "png", "webp", "gif", "tiff"]);

const ALLOWED_CLIENT_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function maxUploadBytes(): number {
  const mb = Number(process.env.MAX_UPLOAD_SIZE_MB ?? "10");
  const n = Number.isFinite(mb) && mb > 0 ? mb : 10;
  return Math.floor(n * 1024 * 1024);
}

function toIsoDate(v: unknown): string | null {
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    return v.toISOString().slice(0, 10);
  }
  if (typeof v === "string") {
    const s = v.trim();
    const m = /^(\d{4})[:\-/](\d{2})[:\-/](\d{2})/.exec(s);
    if (m) {
      return `${m[1]}-${m[2]}-${m[3]}`;
    }
  }
  return null;
}

function yearFromIsoDate(iso: string | null): number | null {
  if (!iso || iso.length < 4) {
    return null;
  }
  const y = Number(iso.slice(0, 4));
  return Number.isFinite(y) ? y : null;
}

function pickGpsJson(tags: Record<string, unknown> | undefined): string | null {
  if (!tags) {
    return null;
  }
  const lat =
    (tags.latitude as number | undefined) ??
    (tags.GPSLatitude as number | undefined);
  const lng =
    (tags.longitude as number | undefined) ??
    (tags.GPSLongitude as number | undefined);
  if (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng)
  ) {
    return JSON.stringify({ lat, lng });
  }
  return null;
}

/**
 * Загрузка фото в альбом: MIME + Sharp, превью, EXIF дата, GPS (exifr), пути `album/{albumId}/{id}.jpg`.
 */
export async function uploadAlbumPhoto(
  albumId: string,
  input: { buffer: Buffer; clientMime?: string | null },
): Promise<Photo> {
  const album = await getAlbumById(albumId);
  if (!album) {
    throw new AlbumNotFoundError(albumId);
  }

  const maxB = maxUploadBytes();
  if (input.buffer.length > maxB) {
    throw new Error(
      `Файл слишком большой (макс. ${String(Math.round(maxB / 1024 / 1024))} МБ)`,
    );
  }

  const hint = input.clientMime?.split(";")[0]?.trim().toLowerCase() ?? "";
  if (hint && !ALLOWED_CLIENT_MIME.has(hint)) {
    throw new Error("Недопустимый тип файла (разрешены JPEG, PNG, WebP)");
  }

  let meta: sharp.Metadata;
  try {
    meta = await sharp(input.buffer).metadata();
  } catch {
    throw new Error("Файл не является поддерживаемым изображением");
  }
  if (!meta.format || !SHARP_FORMATS.has(meta.format)) {
    throw new Error("Неподдерживаемый формат изображения");
  }

  let tags: Record<string, unknown> | undefined;
  try {
    tags = (await exifr.parse(input.buffer)) as
      | Record<string, unknown>
      | undefined;
  } catch {
    tags = undefined;
  }

  const dateTaken =
    toIsoDate(tags?.DateTimeOriginal) ??
    toIsoDate(tags?.CreateDate) ??
    toIsoDate(tags?.ModifyDate) ??
    null;
  const location = pickGpsJson(tags);
  const year = yearFromIsoDate(dateTaken);

  const photoId = crypto.randomUUID();
  const relSrc = `album/${albumId}/${photoId}.jpg`;
  const relThumb = `album/${albumId}/${photoId}_thumb.jpg`;
  const root = getPhotosRoot();
  const dir = path.join(root, "album", albumId);
  await fs.mkdir(dir, { recursive: true });
  const outMain = path.join(dir, `${photoId}.jpg`);
  const outThumb = path.join(dir, `${photoId}_thumb.jpg`);

  try {
    await sharp(input.buffer)
      .rotate()
      .resize(2048, 2048, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 90, mozjpeg: true })
      .toFile(outMain);
    await sharp(input.buffer)
      .rotate()
      .resize(320, 320, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(outThumb);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await unlinkAlbumPhotoFiles(relSrc, relThumb).catch(() => undefined);
    throw new Error(`Не удалось обработать изображение: ${msg}`);
  }

  const sortRes = await db
    .select({
      m: sql<number>`ifnull(max(${photos.sortOrder}), -1)`.mapWith(Number),
    })
    .from(photos)
    .where(eq(photos.albumId, albumId));
  const sortOrder = (sortRes[0]?.m ?? -1) + 1;

  const now = sql`(datetime('now'))`;
  await db.insert(photos).values({
    id: photoId,
    albumId,
    src: relSrc,
    thumbnail: relThumb,
    description: null,
    dateTaken,
    year,
    location,
    sortOrder,
    createdAt: now,
  });

  const row = await db.query.photos.findFirst({
    where: eq(photos.id, photoId),
  });
  if (!row) {
    throw new Error("Не удалось сохранить фото");
  }
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
