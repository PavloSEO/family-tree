import { eq, sql } from "drizzle-orm";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { Person } from "@family-tree/shared";
import { db } from "../db/connection.js";
import { persons } from "../db/schema.js";
import { getPhotosRoot } from "../lib/photos-root.js";
import { getPersonById, PersonNotFoundError } from "./person.service.js";

const SHARP_FORMATS = new Set(["jpeg", "png", "webp", "gif", "tiff"]);

function maxUploadBytes(): number {
  const mb = Number(process.env.MAX_UPLOAD_SIZE_MB ?? "10");
  const n = Number.isFinite(mb) && mb > 0 ? mb : 10;
  return Math.floor(n * 1024 * 1024);
}

async function unlinkOldMainFiles(dir: string): Promise<void> {
  let names: string[];
  try {
    names = await fs.readdir(dir);
  } catch {
    return;
  }
  await Promise.all(
    names
      .filter((n) => /^main\.[a-z0-9]+$/i.test(n))
      .map((n) => fs.unlink(path.join(dir, n)).catch(() => undefined)),
  );
}

/**
 * Save mainPhoto: sharp (EXIF rotate, preview up to 300px on long side), file `main.jpg`,
 * DB path `{personId}/main.jpg` (POSIX).
 */
export async function uploadPersonMainPhoto(
  personId: string,
  input: { buffer: Buffer },
): Promise<Person> {
  const existing = await db.query.persons.findFirst({
    where: eq(persons.id, personId),
    columns: { id: true },
  });
  if (!existing) {
    throw new PersonNotFoundError(personId);
  }

  const maxB = maxUploadBytes();
  if (input.buffer.length > maxB) {
    throw new Error(
      `Файл слишком большой (макс. ${String(Math.round(maxB / 1024 / 1024))} МБ)`,
    );
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

  const root = getPhotosRoot();
  const personDir = path.join(root, personId);
  await fs.mkdir(personDir, { recursive: true });
  await unlinkOldMainFiles(personDir);

  const relDb = `${personId}/main.jpg`;
  const outPath = path.join(personDir, "main.jpg");

  try {
    await sharp(input.buffer)
      .rotate()
      .resize(300, 300, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 88, mozjpeg: true })
      .toFile(outPath);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Не удалось обработать изображение: ${msg}`);
  }

  await db
    .update(persons)
    .set({
      mainPhoto: relDb,
      updatedAt: sql`(datetime('now'))`,
    })
    .where(eq(persons.id, personId));

  const updated = await getPersonById(personId);
  if (!updated) {
    throw new PersonNotFoundError(personId);
  }
  return updated;
}
