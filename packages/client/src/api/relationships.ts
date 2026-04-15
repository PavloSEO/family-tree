import type { Relationship, RelationshipCreate } from "@family-tree/shared";
import { relationshipSchema } from "@family-tree/shared";
import { z } from "zod";
import { api } from "./client.js";

const relationshipsListEnvelopeSchema = z.object({
  data: z.array(z.unknown()),
});

const relationshipCreateResponseSchema = z.object({
  data: z.unknown(),
  warnings: z.array(z.string()).optional(),
});

export async function fetchRelationships(): Promise<Relationship[]> {
  const raw = await api.get("/api/relationships").json();
  const env = relationshipsListEnvelopeSchema.parse(raw);
  return env.data.map((row) => relationshipSchema.parse(row));
}

export async function createRelationship(
  body: RelationshipCreate,
): Promise<{ data: Relationship; warnings: string[] }> {
  const raw = await api.post("/api/relationships", { json: body }).json();
  const env = relationshipCreateResponseSchema.parse(raw);
  return {
    data: relationshipSchema.parse(env.data),
    warnings: env.warnings ?? [],
  };
}

export async function deleteRelationship(id: string): Promise<void> {
  await api.delete(`/api/relationships/${id}`);
}
