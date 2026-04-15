import { z } from "zod";
import { nullableIsoDateStringSchema, sqliteTimestampSchema, uuidSchema } from "./common.js";

export const albumSchema = z.object({
  id: uuidSchema,
  title: z.string().min(1),
  description: z.string().nullable(),
  year: z.number().int().nullable(),
  ownerId: uuidSchema.nullable(),
  coverPhotoIndex: z.number().int().nonnegative(),
  createdAt: sqliteTimestampSchema,
  updatedAt: sqliteTimestampSchema,
});

export type Album = z.infer<typeof albumSchema>;

/** Album list row (cover from photo at `coverPhotoIndex`). */
export const albumListItemSchema = albumSchema.extend({
  coverThumbnail: z.string().nullable(),
});

export type AlbumListItem = z.infer<typeof albumListItemSchema>;

export const albumCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  year: z.number().int().nullable().optional(),
  ownerId: uuidSchema.nullable().optional(),
  coverPhotoIndex: z.number().int().nonnegative().optional(),
});

export type AlbumCreate = z.infer<typeof albumCreateSchema>;

export const albumUpdateSchema = albumCreateSchema.partial();

export type AlbumUpdate = z.infer<typeof albumUpdateSchema>;

export const photoSchema = z.object({
  id: uuidSchema,
  albumId: uuidSchema,
  src: z.string().min(1),
  thumbnail: z.string().nullable(),
  description: z.string().nullable(),
  dateTaken: nullableIsoDateStringSchema,
  year: z.number().int().nullable(),
  location: z.string().nullable(),
  sortOrder: z.number().int(),
  createdAt: sqliteTimestampSchema,
});

export type Photo = z.infer<typeof photoSchema>;

export const photoCreateSchema = z.object({
  albumId: uuidSchema,
  src: z.string().min(1),
  thumbnail: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  dateTaken: nullableIsoDateStringSchema.optional(),
  year: z.number().int().nullable().optional(),
  location: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export type PhotoCreate = z.infer<typeof photoCreateSchema>;

export const photoUpdateSchema = z.object({
  albumId: uuidSchema.optional(),
  src: z.string().min(1).optional(),
  thumbnail: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  dateTaken: nullableIsoDateStringSchema.optional(),
  year: z.number().int().nullable().optional(),
  location: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export type PhotoUpdate = z.infer<typeof photoUpdateSchema>;
