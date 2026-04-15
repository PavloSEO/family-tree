import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { MdSelect, MdSelectOption, MdTextField } from "../md/index.js";
import { COUNTRY_SELECT_CODES } from "../../lib/country-select-options.js";

const FIND_DEBOUNCE_MS = 400;

export function TreeFilters() {
  const { t } = useTranslation("tree");
  const { t: tc } = useTranslation("common");
  const branchOptions = useMemo(
    () => [
      { value: "", headline: t("filters.coreOnly") },
      ...Array.from({ length: 11 }, (_, i) => ({
        value: `ext:${i}`,
        headline: t("filters.externalAncestorsDepth", { depth: i }),
      })),
    ],
    [t],
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const findDebounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const findInUrl = searchParams.get("find") ?? "";
  const [findDraft, setFindDraft] = useState(findInUrl);
  useEffect(() => {
    setFindDraft(findInUrl);
  }, [findInUrl]);

  const patchParams = useCallback(
    (patch: Record<string, string | undefined>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(patch)) {
            if (v === undefined || v === "") {
              next.delete(k);
            } else {
              next.set(k, v);
            }
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  useEffect(() => {
    return () => {
      if (findDebounceRef.current !== undefined) {
        clearTimeout(findDebounceRef.current);
      }
    };
  }, []);

  const onFindChange = useCallback(
    (v: string) => {
      setFindDraft(v);
      if (findDebounceRef.current !== undefined) {
        clearTimeout(findDebounceRef.current);
      }
      findDebounceRef.current = setTimeout(() => {
        const t = v.trim();
        if (t === "") {
          patchParams({ find: undefined });
        } else {
          patchParams({ find: t });
        }
      }, FIND_DEBOUNCE_MS);
    },
    [patchParams],
  );

  const countryValue = useMemo(
    () => (searchParams.get("country") ?? "").toUpperCase().slice(0, 2),
    [searchParams],
  );

  const aliveValue = useMemo(() => {
    return searchParams.get("aliveOnly") === "true" ? "true" : "";
  }, [searchParams]);

  const branchValue = useMemo(() => {
    if (searchParams.get("showExternal") !== "true") {
      return "";
    }
    const raw = searchParams.get("externalDepth") ?? "2";
    const n = Number(raw);
    const depth = Number.isFinite(n)
      ? Math.min(10, Math.max(0, Math.floor(n)))
      : 2;
    return `ext:${depth}`;
  }, [searchParams]);

  return (
    <div className="flex max-w-full flex-col gap-3 rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-high)] p-3">
      <div className="grid min-w-0 gap-3 sm:grid-cols-3">
        <MdSelect
          className="min-w-0"
          label={t("filters.country")}
          value={countryValue}
          onValueChange={(v) => {
            const code = v.toUpperCase().slice(0, 2);
            if (!code) {
              patchParams({ country: undefined });
            } else {
              patchParams({ country: code });
            }
          }}
        >
          {COUNTRY_SELECT_CODES.map((code) => (
            <MdSelectOption
              key={code || "all"}
              value={code}
              headline={
                code === ""
                  ? t("filters.allCountries")
                  : tc(`countries.${code}`)
              }
            />
          ))}
        </MdSelect>

        <MdSelect
          className="min-w-0"
          label={t("filters.status")}
          value={aliveValue}
          onValueChange={(v) => {
            if (v === "true") {
              patchParams({ aliveOnly: "true" });
            } else {
              patchParams({ aliveOnly: undefined });
            }
          }}
        >
          <MdSelectOption value="" headline={t("filters.all")} />
          <MdSelectOption value="true" headline={t("filters.aliveOnly")} />
        </MdSelect>

        <MdSelect
          className="min-w-0"
          label={t("filters.branch")}
          value={branchValue}
          onValueChange={(v) => {
            if (!v || v === "") {
              patchParams({
                showExternal: undefined,
                externalDepth: undefined,
              });
              return;
            }
            const m = /^ext:(\d+)$/.exec(v);
            if (!m) {
              return;
            }
            patchParams({
              showExternal: "true",
              externalDepth: m[1],
            });
          }}
        >
          {branchOptions.map((o) => (
            <MdSelectOption
              key={o.value || "core"}
              value={o.value}
              headline={o.headline}
            />
          ))}
        </MdSelect>
      </div>

      <MdTextField
        className="w-full"
        label={t("filters.findLabel")}
        placeholder={t("filters.findPlaceholder")}
        value={findDraft}
        onValueChange={onFindChange}
        supportingText={t("filters.findSupporting")}
      />
    </div>
  );
}
