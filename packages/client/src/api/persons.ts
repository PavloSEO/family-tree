import type {
  PaginatedResponse,
  Person,
  PersonCreate,
  PersonUpdate,
} from "@family-tree/shared";
import { personSchema } from "@family-tree/shared";
import { z } from "zod";
import { api } from "./client.js";

const paginatedPersonsEnvelopeSchema = z.object({
  data: z.array(z.unknown()),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

const personEnvelopeSchema = z.object({
  data: z.unknown(),
});

const personRelativeRowSchema = z.object({
  personId: z.string().uuid(),
  relationshipLabel: z.string(),
  displayName: z.string(),
});

const relativesEnvelopeSchema = z.object({
  data: z.array(personRelativeRowSchema),
});

export type PersonRelative = z.infer<typeof personRelativeRowSchema>;

export type PersonListParams = {
  search?: string;
  country?: string;
  alive?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
};

function toSearchParams(p: PersonListParams): URLSearchParams {
  const out = new URLSearchParams();
  if (p.search) {
    out.set("search", p.search);
  }
  if (p.country) {
    out.set("country", p.country.toUpperCase());
  }
  if (p.alive === true) {
    out.set("alive", "true");
  }
  if (p.alive === false) {
    out.set("alive", "false");
  }
  if (p.page != null) {
    out.set("page", String(p.page));
  }
  if (p.limit != null) {
    out.set("limit", String(p.limit));
  }
  if (p.sort) {
    out.set("sort", p.sort);
  }
  if (p.order) {
    out.set("order", p.order);
  }
  return out;
}

export async function fetchPersonsList(
  params: PersonListParams,
): Promise<PaginatedResponse<Person>> {
  const raw = await api
    .get("/api/persons", { searchParams: toSearchParams(params) })
    .json();
  const env = paginatedPersonsEnvelopeSchema.parse(raw);
  return {
    data: env.data.map((row) => personSchema.parse(row)),
    total: env.total,
    page: env.page,
    limit: env.limit,
  };
}

export async function fetchPerson(id: string): Promise<Person> {
  const raw = await api.get(`/api/persons/${id}`).json();
  const env = personEnvelopeSchema.parse(raw);
  return personSchema.parse(env.data);
}

export async function fetchPersonRelatives(
  id: string,
): Promise<PersonRelative[]> {
  const raw = await api.get(`/api/persons/${id}/relatives`).json();
  const env = relativesEnvelopeSchema.parse(raw);
  return env.data;
}

export async function createPerson(body: PersonCreate): Promise<Person> {
  const raw = await api.post("/api/persons", { json: body }).json();
  const env = personEnvelopeSchema.parse(raw);
  return personSchema.parse(env.data);
}

export async function updatePerson(
  id: string,
  body: PersonUpdate,
): Promise<Person> {
  const raw = await api.put(`/api/persons/${id}`, { json: body }).json();
  const env = personEnvelopeSchema.parse(raw);
  return personSchema.parse(env.data);
}

export async function deletePerson(id: string): Promise<void> {
  await api.delete(`/api/persons/${id}`);
}
