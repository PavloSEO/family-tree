import type { Photo, PhotoTag, PhotoTagCreate } from "@family-tree/shared";
import { photoSchema, photoTagSchema } from "@family-tree/shared";
import { z } from "zod";
import { api } from "./client.js";
import { getMemoryToken } from "../lib/auth-token-store.js";

export type PhotoWithTags = Photo & { tags: PhotoTag[] };

export async function fetchPhotoWithTags(id: string): Promise<PhotoWithTags> {
  const raw = await api.get(`/api/photos/${id}`).json();
  const env = z.object({ data: z.unknown() }).parse(raw);
  const d = env.data as Record<string, unknown>;
  const { tags: tr, ...rest } = d;
  const photo = photoSchema.parse(rest as never) as Photo;
  const tags = Array.isArray(tr)
    ? tr.map((row) => photoTagSchema.parse(row as never) as PhotoTag)
    : [];
  return { ...photo, tags };
}

export async function createPhotoTag(
  photoId: string,
  body: PhotoTagCreate,
): Promise<PhotoTag> {
  const raw = await api
    .post(`/api/photos/${photoId}/tag`, { json: body })
    .json();
  const env = z.object({ data: z.unknown() }).parse(raw);
  return photoTagSchema.parse(env.data as never) as PhotoTag;
}

export async function deletePhotoTag(
  photoId: string,
  tagId: string,
): Promise<void> {
  await api.delete(`/api/photos/${photoId}/tag/${tagId}`);
}

const errorBodySchema = z.object({
  error: z.string().optional(),
});

function apiOrigin(): string {
  return import.meta.env.VITE_API_BASE_URL ?? "";
}

function xhrErrorMessage(xhr: XMLHttpRequest): string {
  try {
    const raw = JSON.parse(xhr.responseText) as unknown;
    const parsed = errorBodySchema.safeParse(raw);
    if (parsed.success && parsed.data.error) {
      return parsed.data.error;
    }
  } catch {
    /* ignore */
  }
  if (xhr.status === 401) {
    return "Требуется вход";
  }
  if (xhr.status === 403) {
    return "Недостаточно прав";
  }
  return `Ошибка загрузки (${String(xhr.status)})`;
}

/**
 * Multipart `POST /api/photos/upload` с прогрессом (XHR).
 * Поля: `albumId`, `file`.
 */
export function uploadAlbumPhoto(
  albumId: string,
  file: File,
  onProgress?: (loaded: number, total: number) => void,
): Promise<Photo> {
  const url = `${apiOrigin()}/api/photos/upload`;
  const token = getMemoryToken();
  const body = new FormData();
  body.set("albumId", albumId);
  body.set("file", file, file.name);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) {
        onProgress?.(ev.loaded, ev.total);
      }
    };
    xhr.onerror = () => {
      reject(new Error("Ошибка сети"));
    };
    xhr.onload = () => {
      if (xhr.status === 201) {
        try {
          const raw = JSON.parse(xhr.responseText) as unknown;
          const env = z.object({ data: z.unknown() }).parse(raw);
          resolve(photoSchema.parse(env.data as never) as Photo);
        } catch {
          reject(new Error("Некорректный ответ сервера"));
        }
        return;
      }
      reject(new Error(xhrErrorMessage(xhr)));
    };
    xhr.send(body);
  });
}
