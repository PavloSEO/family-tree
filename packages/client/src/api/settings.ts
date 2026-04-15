import type { AppSettings } from "@family-tree/shared";
import { appSettingsSchema } from "@family-tree/shared";
import { z } from "zod";
import { api } from "./client.js";

const envelopeSchema = z.object({
  data: z.unknown(),
});

export async function fetchAppSettings(): Promise<AppSettings> {
  const raw = await api.get("/api/settings").json();
  const env = envelopeSchema.parse(raw);
  return appSettingsSchema.parse(env.data);
}

export async function updateAppSettings(
  body: Partial<AppSettings>,
): Promise<AppSettings> {
  const raw = await api.put("/api/settings", { json: body }).json();
  const env = envelopeSchema.parse(raw);
  return appSettingsSchema.parse(env.data);
}
