import { z } from "zod";
import { countryCodeSchema, uuidSchema } from "./common.js";
import { genderSchema } from "./person.js";

export const treeViewModeSchema = z.enum([
  "full",
  "ancestors",
  "descendants",
  "direct",
  "family",
  "paternal",
  "maternal",
]);

export type TreeViewMode = z.infer<typeof treeViewModeSchema>;

function queryBooleanDefaultFalse(v: unknown): boolean {
  if (v === undefined || v === null || v === "") {
    return false;
  }
  if (typeof v === "boolean") {
    return v;
  }
  const s = String(v).toLowerCase();
  return s === "true" || s === "1" || s === "yes";
}

/** Query `GET /api/tree/:personId` — см. `docs/06-api.md`. */
export const treeQuerySchema = z.object({
  mode: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : String(v)),
    treeViewModeSchema.optional(),
  ).default("full"),
  depthUp: z.coerce.number().int().min(0).max(20).default(3),
  depthDown: z.coerce.number().int().min(0).max(20).default(3),
  showExternal: z.preprocess(queryBooleanDefaultFalse, z.boolean()),
  externalDepth: z.coerce.number().int().min(0).max(10).default(2),
  country: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : String(v).trim()),
    countryCodeSchema.optional(),
  ),
  aliveOnly: z.preprocess(queryBooleanDefaultFalse, z.boolean()),
});

export type TreeQuery = z.output<typeof treeQuerySchema>;

export const treeNodeSchema = z.object({
  id: uuidSchema,
  firstName: z.string(),
  lastName: z.string(),
  gender: genderSchema,
  dateOfBirth: z.string().nullable(),
  dateOfDeath: z.string().nullable(),
  mainPhoto: z.string().nullable(),
  country: z.string().nullable(),
  isExternal: z.boolean(),
});

export type TreeNode = z.infer<typeof treeNodeSchema>;

export const treeEdgeSchema = z.object({
  id: uuidSchema,
  source: uuidSchema,
  target: uuidSchema,
  type: z.enum(["parent", "spouse"]),
  isExternal: z.boolean(),
});

export type TreeEdge = z.infer<typeof treeEdgeSchema>;

export const treeResponseSchema = z.object({
  nodes: z.array(treeNodeSchema),
  edges: z.array(treeEdgeSchema),
  rootId: uuidSchema,
});

export type TreeResponse = z.infer<typeof treeResponseSchema>;
