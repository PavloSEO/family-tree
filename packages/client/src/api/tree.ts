import type { TreeResponse } from "@family-tree/shared";
import { treeResponseSchema } from "@family-tree/shared";
import { z } from "zod";
import { api } from "./client.js";

const treeEnvelopeLooseSchema = z.object({
  data: z.unknown(),
});

export type TreeQueryParams = {
  mode?: string;
  depthUp?: string;
  depthDown?: string;
  showExternal?: string;
  externalDepth?: string;
  country?: string;
  aliveOnly?: string;
};

const TREE_QUERY_URL_KEYS = [
  "mode",
  "depthUp",
  "depthDown",
  "showExternal",
  "externalDepth",
  "country",
  "aliveOnly",
] as const satisfies readonly (keyof TreeQueryParams)[];

/** Параметры, которые уходят на `GET /api/tree/:id` (без клиентских вроде `find`). */
export function treeQueryParamsFromSearchParams(
  sp: URLSearchParams,
): TreeQueryParams {
  const out: TreeQueryParams = {};
  for (const k of TREE_QUERY_URL_KEYS) {
    const v = sp.get(k);
    if (v != null && v !== "") {
      out[k] = v;
    }
  }
  return out;
}

/** Стабильная подпись запроса дерева к API — для ключа `FamilyTree` и `useEffect` загрузки. */
export function treeQueryCacheKey(sp: URLSearchParams): string {
  const q = treeQueryParamsFromSearchParams(sp);
  return Object.entries(q)
    .filter(([, v]) => v !== undefined && v !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
}

function toSearchParams(q: TreeQueryParams): URLSearchParams {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) {
    if (v !== undefined && v !== "") {
      sp.set(k, v);
    }
  }
  return sp;
}

export async function fetchTree(
  personId: string,
  query: TreeQueryParams = {},
): Promise<TreeResponse> {
  const sp = toSearchParams(query);
  const qs = sp.toString();
  const path =
    qs.length > 0 ? `/api/tree/${personId}?${qs}` : `/api/tree/${personId}`;
  const raw = await api.get(path).json();
  const env = treeEnvelopeLooseSchema.parse(raw);
  return treeResponseSchema.parse(env.data);
}
