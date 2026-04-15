import type { Album, AlbumCreate, AlbumListItem, Photo } from "@family-tree/shared";
import {
  albumListItemSchema,
  albumSchema,
  photoSchema,
} from "@family-tree/shared";
import { z } from "zod";
import { api } from "./client.js";

const listEnvelopeSchema = z.object({
  data: z.array(z.unknown()),
});

const singleEnvelopeSchema = z.object({
  data: z.unknown(),
});

export type AlbumListParams = {
  ownerId?: string;
  year?: number;
};

function toAlbumSearchParams(p: AlbumListParams): URLSearchParams {
  const out = new URLSearchParams();
  if (p.ownerId) {
    out.set("ownerId", p.ownerId);
  }
  if (p.year != null) {
    out.set("year", String(p.year));
  }
  return out;
}

export async function fetchAlbumsList(
  params: AlbumListParams = {},
): Promise<AlbumListItem[]> {
  const sp = toAlbumSearchParams(params);
  const qs = sp.toString();
  const path = qs.length > 0 ? `/api/albums?${qs}` : "/api/albums";
  const raw = await api.get(path).json();
  const env = listEnvelopeSchema.parse(raw);
  return env.data.map((row) => albumListItemSchema.parse(row));
}

export async function createAlbum(body: AlbumCreate): Promise<Album> {
  const raw = await api.post("/api/albums", { json: body }).json();
  const env = singleEnvelopeSchema.parse(raw);
  return albumSchema.parse(env.data);
}

export async function fetchAlbumWithPhotos(
  id: string,
): Promise<{ album: Album; photos: Photo[] }> {
  const raw = await api.get(`/api/albums/${id}`).json();
  const env = z.object({ data: z.unknown() }).parse(raw);
  const d = env.data as { album?: unknown; photos?: unknown };
  const albumParsed = albumSchema.parse(d.album as never) as Album;
  const rows = Array.isArray(d.photos) ? d.photos : [];
  const photosParsed = rows.map(
    (row) => photoSchema.parse(row as never) as Photo,
  );
  return { album: albumParsed, photos: photosParsed };
}
