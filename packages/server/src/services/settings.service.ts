import {
  appSettingsPatchSchema,
  appSettingsSchema,
  type AppSettings,
  type AppSettingsPatch,
  type SettingsKey,
  SETTINGS_KEYS,
} from "@family-tree/shared";
import { db } from "../db/connection.js";
import { settings } from "../db/schema.js";
import { getPersonById } from "./person.service.js";

const DEFAULT_APP_SETTINGS: AppSettings = {
  siteName: "Family Tree",
  defaultRootPersonId: null,
  defaultDepthUp: 3,
  defaultDepthDown: 3,
  showExternalBranches: true,
  externalBranchDepth: 1,
  accentColor: "#6750A4",
  sessionTtlDays: 7,
};

function parseBool(raw: string | undefined): boolean | undefined {
  if (raw === undefined) return undefined;
  if (raw === "1" || raw === "true") return true;
  if (raw === "0" || raw === "false") return false;
  return undefined;
}

function parseIntSafe(raw: string | undefined): number | undefined {
  if (raw === undefined || raw === "") return undefined;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : undefined;
}

function rowMapToObject(map: Record<string, string>): AppSettings {
  const merged: Record<string, unknown> = { ...DEFAULT_APP_SETTINGS };
  for (const k of SETTINGS_KEYS) {
    const v = map[k];
    if (v === undefined) continue;
    switch (k) {
      case "siteName":
        merged.siteName = v;
        break;
      case "defaultRootPersonId":
        merged.defaultRootPersonId = v === "" ? null : v;
        break;
      case "defaultDepthUp":
      case "defaultDepthDown":
      case "externalBranchDepth":
      case "sessionTtlDays": {
        const n = parseIntSafe(v);
        if (n !== undefined) merged[k] = n;
        break;
      }
      case "showExternalBranches": {
        const b = parseBool(v);
        if (b !== undefined) merged.showExternalBranches = b;
        break;
      }
      case "accentColor":
        merged.accentColor = v;
        break;
      default:
        break;
    }
  }
  return appSettingsSchema.parse(merged);
}

function valueToDbString(key: SettingsKey, value: unknown): string {
  if (key === "showExternalBranches") {
    return value ? "1" : "0";
  }
  if (key === "defaultRootPersonId") {
    return value === null || value === "" ? "" : String(value);
  }
  if (typeof value === "number") return String(value);
  return String(value);
}

export class InvalidRootPersonError extends Error {
  readonly code = "INVALID_ROOT_PERSON";

  constructor(id: string) {
    super(`Карточка корня не найдена: ${id}`);
    this.name = "InvalidRootPersonError";
  }
}

export async function getAppSettings(): Promise<AppSettings> {
  const rows = await db.select().from(settings);
  const map: Record<string, string> = {};
  for (const r of rows) {
    map[r.key] = r.value;
  }
  return rowMapToObject(map);
}

export async function updateAppSettings(raw: unknown): Promise<AppSettings> {
  const patch = appSettingsPatchSchema.parse(raw) as AppSettingsPatch;

  if ("defaultRootPersonId" in patch && patch.defaultRootPersonId) {
    const person = await getPersonById(patch.defaultRootPersonId);
    if (!person) {
      throw new InvalidRootPersonError(patch.defaultRootPersonId);
    }
  }

  const entries = Object.entries(patch).filter(
    ([, v]) => v !== undefined,
  ) as [SettingsKey, unknown][];

  for (const [key, value] of entries) {
    const str = valueToDbString(key, value);
    await db
      .insert(settings)
      .values({ key, value: str })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: str },
      });
  }

  return getAppSettings();
}
