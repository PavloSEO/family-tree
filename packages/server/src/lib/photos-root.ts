import path from "node:path";

/** Каталог хранения файлов mainPhoto и др. (`PHOTOS_PATH`, иначе `<cwd>/data/photos`). */
export function getPhotosRoot(): string {
  const raw = process.env.PHOTOS_PATH?.trim();
  if (raw && raw.length > 0) {
    return path.resolve(raw);
  }
  return path.resolve(process.cwd(), "data", "photos");
}
