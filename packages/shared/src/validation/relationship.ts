import { z } from "zod";
import { sqliteTimestampSchema, uuidSchema } from "./common.js";

export const relationshipTypeSchema = z.enum(["parent", "spouse"]);

export const relationshipSchema = z.object({
  id: uuidSchema,
  type: relationshipTypeSchema,
  fromPersonId: uuidSchema,
  toPersonId: uuidSchema,
  marriageDate: z.string().nullable(),
  divorceDate: z.string().nullable(),
  isCurrentSpouse: z.boolean().nullable(),
  notes: z.string().nullable(),
  createdAt: sqliteTimestampSchema,
});

export type Relationship = z.infer<typeof relationshipSchema>;

export const relationshipCreateSchema = z.object({
  type: relationshipTypeSchema,
  fromPersonId: uuidSchema,
  toPersonId: uuidSchema,
  marriageDate: z.string().nullable().optional(),
  divorceDate: z.string().nullable().optional(),
  isCurrentSpouse: z.boolean().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type RelationshipCreate = z.infer<typeof relationshipCreateSchema>;

export const relationshipUpdateSchema = z.object({
  marriageDate: z.string().nullable().optional(),
  divorceDate: z.string().nullable().optional(),
  isCurrentSpouse: z.boolean().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type RelationshipUpdate = z.infer<typeof relationshipUpdateSchema>;
