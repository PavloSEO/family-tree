import { z } from "zod";
import {
  countryCodeSchema,
  nullableIsoDateStringSchema,
  sqliteTimestampSchema,
  uuidSchema,
} from "./common.js";

export const genderSchema = z.enum(["male", "female"]);

export const bloodTypeSchema = z.enum([
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
]);

const localizedNamesSchema = z
  .record(
    z.string(),
    z.object({
      firstName: z.string(),
      lastName: z.string(),
    }),
  )
  .nullable();

const hobbiesSchema = z.array(z.string()).nullable();

const socialLinksSchema = z
  .array(
    z.object({
      platform: z.string().min(1),
      url: z.string().min(1),
    }),
  )
  .nullable();

const customFieldsSchema = z.record(z.string(), z.string()).nullable();

export const personSchema = z.object({
  id: uuidSchema,
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  patronymic: z.string().nullable(),
  maidenName: z.string().nullable(),
  gender: genderSchema,
  dateOfBirth: nullableIsoDateStringSchema,
  dateOfDeath: nullableIsoDateStringSchema,
  birthPlace: z.string().nullable(),
  currentLocation: z.string().nullable(),
  country: countryCodeSchema.nullable(),
  mainPhoto: z.string().nullable(),
  bio: z.string().nullable(),
  occupation: z.string().nullable(),
  bloodType: bloodTypeSchema.nullable(),
  phone: z.string().nullable(),
  email: z.union([z.string().email(), z.literal(""), z.null()]),
  localizedNames: localizedNamesSchema,
  hobbies: hobbiesSchema,
  socialLinks: socialLinksSchema,
  customFields: customFieldsSchema,
  createdAt: sqliteTimestampSchema,
  updatedAt: sqliteTimestampSchema,
});

export type Person = z.infer<typeof personSchema>;

/** POST /api/persons */
export const personCreateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  patronymic: z.string().nullable().optional(),
  maidenName: z.string().nullable().optional(),
  gender: genderSchema,
  dateOfBirth: nullableIsoDateStringSchema.optional(),
  dateOfDeath: nullableIsoDateStringSchema.optional(),
  birthPlace: z.string().nullable().optional(),
  currentLocation: z.string().nullable().optional(),
  country: countryCodeSchema.nullable().optional(),
  bio: z.string().nullable().optional(),
  occupation: z.string().nullable().optional(),
  bloodType: bloodTypeSchema.nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.union([z.string().email(), z.literal(""), z.null()]).optional(),
  localizedNames: localizedNamesSchema.optional(),
  hobbies: hobbiesSchema.optional(),
  socialLinks: socialLinksSchema.optional(),
  customFields: customFieldsSchema.optional(),
});

export type PersonCreate = z.infer<typeof personCreateSchema>;

/** PUT /api/persons/:id */
export const personUpdateSchema = personCreateSchema.partial();

export type PersonUpdate = z.infer<typeof personUpdateSchema>;

const personListSortSchema = z.enum([
  "firstName",
  "lastName",
  "dateOfBirth",
  "country",
  "createdAt",
  "gender",
]);

/** GET person list (query / filters) — `docs/06-api.md`, phases 17–18. */
export const personListQuerySchema = z.object({
  search: z.preprocess((v) => {
    if (v === undefined || v === null || v === "") {
      return undefined;
    }
    const s = String(v).trim();
    return s.length > 0 ? s.slice(0, 200) : undefined;
  }, z.string().max(200).optional()),
  country: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : v),
    countryCodeSchema.optional(),
  ),
  /** Explicit filter (internal); lower precedence than `alive`. */
  status: z.enum(["alive", "dead"]).optional(),
  /** API `alive` query: true — living only, false — deceased only, omit — all. */
  alive: z.preprocess((v) => {
    if (v === undefined || v === null || v === "") {
      return undefined;
    }
    if (typeof v === "boolean") {
      return v;
    }
    const s = String(v).toLowerCase();
    if (s === "true" || s === "1") {
      return true;
    }
    if (s === "false" || s === "0") {
      return false;
    }
    return undefined;
  }, z.boolean().optional()),
  sort: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : v),
    personListSortSchema.optional(),
  ),
  order: z.preprocess((v) => {
    if (v === "" || v === undefined || v === null) {
      return undefined;
    }
    const s = String(v).toLowerCase();
    if (s === "asc" || s === "desc") {
      return s;
    }
    return undefined;
  }, z.enum(["asc", "desc"]).optional()),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PersonListQuery = z.output<typeof personListQuerySchema>;
