import type { User, UserCreate, UserUpdate } from "@family-tree/shared";
import { userPublicSchema } from "@family-tree/shared";
import { z } from "zod";
import { api } from "./client.js";

const listEnvelopeSchema = z.object({
  data: z.array(z.unknown()),
});

const singleEnvelopeSchema = z.object({
  data: z.unknown(),
});

export async function fetchUsersList(): Promise<User[]> {
  const raw = await api.get("/api/users").json();
  const env = listEnvelopeSchema.parse(raw);
  return env.data.map((row) => userPublicSchema.parse(row as never) as User);
}

export async function createUser(body: UserCreate): Promise<User> {
  const raw = await api.post("/api/users", { json: body }).json();
  const env = singleEnvelopeSchema.parse(raw);
  return userPublicSchema.parse(env.data as never) as User;
}

export async function updateUser(id: string, body: UserUpdate): Promise<User> {
  const raw = await api.put(`/api/users/${id}`, { json: body }).json();
  const env = singleEnvelopeSchema.parse(raw);
  return userPublicSchema.parse(env.data as never) as User;
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/api/users/${id}`);
}
