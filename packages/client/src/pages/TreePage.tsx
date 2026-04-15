import type { TreeResponse } from "@family-tree/shared";
import { HTTPError } from "ky";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  fetchTree,
  treeQueryCacheKey,
  treeQueryParamsFromSearchParams,
} from "../api/tree.js";
import { FamilyTree } from "../components/tree/FamilyTree.js";

export function TreePage() {
  const { t } = useTranslation("tree");
  const tRef = useRef(t);
  tRef.current = t;
  const formatLoadError = useCallback((e: unknown): string => {
    if (e instanceof HTTPError) {
      return e.message;
    }
    if (e instanceof Error) {
      return e.message;
    }
    return tRef.current("unknownError");
  }, []);
  const { personId } = useParams<{ personId: string }>();
  const [searchParams] = useSearchParams();
  const treeKey = useMemo(
    () =>
      personId ? `${personId}|${treeQueryCacheKey(searchParams)}` : "",
    [personId, searchParams],
  );
  const findQuery = searchParams.get("find") ?? "";

  const [data, setData] = useState<TreeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!personId) {
      setError(tRef.current("noRootId"));
      setLoading(false);
      setData(null);
      return;
    }
    const query = treeQueryParamsFromSearchParams(
      new URLSearchParams(searchParams.toString()),
    );
    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const d = await fetchTree(personId, query);
        if (!cancelled) {
          setData(d);
        }
      } catch (e) {
        if (!cancelled) {
          setData(null);
          setError(formatLoadError(e));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [personId, treeKey, formatLoadError]);

  if (!personId) {
    return (
      <div className="p-6">
        <p className="md-typescale-body-large m-0 text-[var(--md-sys-color-error)]">
          {t("noRootId")}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="md-typescale-body-large m-0">{t("loadingTree")}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <p
          className="md-typescale-body-large m-0"
          style={{ color: "var(--md-sys-color-error)" }}
        >
          {error ?? t("noData")}
        </p>
        <p className="md-typescale-body-medium mt-4">
          <Link
            to={`/person/${personId}`}
            className="text-[var(--md-sys-color-primary)] no-underline hover:underline"
          >
            {t("personCard")}
          </Link>
          {" · "}
          <Link to="/tree" className="text-[var(--md-sys-color-primary)] no-underline hover:underline">
            {t("toTreePicker")}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="tree-page flex h-[calc(100dvh-4rem)] min-h-[420px] flex-col gap-3 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="md-typescale-headline-small m-0 text-[var(--md-sys-color-on-surface)]">
          {t("pageTitle")}
        </h1>
        <div className="flex flex-wrap gap-3 md-typescale-label-large">
          <Link
            to={`/person/${personId}`}
            className="text-[var(--md-sys-color-primary)] no-underline hover:underline"
          >
            {t("personCardShort")}
          </Link>
          <Link to="/tree" className="text-[var(--md-sys-color-primary)] no-underline hover:underline">
            {t("anotherRoot")}
          </Link>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)]">
        <FamilyTree key={treeKey} data={data} findQuery={findQuery} />
      </div>
    </div>
  );
}
