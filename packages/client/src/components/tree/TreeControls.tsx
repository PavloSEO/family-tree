import type { TreeViewMode } from "@family-tree/shared";
import { treeViewModeSchema } from "@family-tree/shared";
import { useReactFlow } from "@xyflow/react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { MdButton } from "../md/MdButton.js";

const MODE_ORDER = treeViewModeSchema.options as unknown as readonly TreeViewMode[];

function parseMode(raw: string | null): TreeViewMode {
  const r = treeViewModeSchema.safeParse(
    raw === "" || raw === null ? undefined : raw,
  );
  return r.success ? r.data : "full";
}

function parseDepth(raw: string | null, fallback: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    return fallback;
  }
  return Math.min(20, Math.max(0, Math.floor(n)));
}

export function TreeControls() {
  const { t } = useTranslation("tree");
  const { fitView } = useReactFlow();
  const [searchParams, setSearchParams] = useSearchParams();
  const depthUpRef = useRef<HTMLElement | null>(null);
  const depthDownRef = useRef<HTMLElement | null>(null);

  const mode = useMemo(
    () => parseMode(searchParams.get("mode")),
    [searchParams],
  );
  const depthUp = useMemo(
    () => parseDepth(searchParams.get("depthUp"), 3),
    [searchParams],
  );
  const depthDown = useMemo(
    () => parseDepth(searchParams.get("depthDown"), 3),
    [searchParams],
  );

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

  const onSegmentedSelection = useCallback(
    (e: Event) => {
      const ce = e as CustomEvent<{
        index: number;
        selected: boolean;
      }>;
      if (!ce.detail?.selected) {
        return;
      }
      const idx = ce.detail.index;
      const next = MODE_ORDER[idx];
      if (!next) {
        return;
      }
      if (next === "full") {
        patchParams({ mode: undefined });
      } else {
        patchParams({ mode: next });
      }
    },
    [patchParams],
  );

  const segmentedSetRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = segmentedSetRef.current;
    if (!el) {
      return;
    }
    el.addEventListener("segmented-button-set-selection", onSegmentedSelection);
    return () => {
      el.removeEventListener(
        "segmented-button-set-selection",
        onSegmentedSelection,
      );
    };
  }, [onSegmentedSelection]);

  useEffect(() => {
    const upEl = depthUpRef.current;
    const downEl = depthDownRef.current;
    const read = (el: HTMLElement | null) => {
      const v = Math.round(Number((el as { value?: number }).value));
      return Math.min(20, Math.max(0, Number.isFinite(v) ? v : 3));
    };
    const onUpInput = () => {
      if (upEl) {
        patchParams({ depthUp: String(read(upEl)) });
      }
    };
    const onDownInput = () => {
      if (downEl) {
        patchParams({ depthDown: String(read(downEl)) });
      }
    };
    upEl?.addEventListener("input", onUpInput);
    downEl?.addEventListener("input", onDownInput);
    return () => {
      upEl?.removeEventListener("input", onUpInput);
      downEl?.removeEventListener("input", onDownInput);
    };
  }, [patchParams]);

  const resetView = useCallback(() => {
    void fitView({ padding: 0.2, duration: 200 });
  }, [fitView]);

  return (
    <div className="flex max-w-full flex-col gap-3 rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-high)] p-3 shadow-sm">
      <div className="min-w-0 overflow-x-auto overflow-y-visible [-webkit-overflow-scrolling:touch]">
        <md-outlined-segmented-button-set
          ref={segmentedSetRef}
          aria-label={t("controls.viewModeAria")}
          className="min-w-min"
        >
          {MODE_ORDER.map((m) => (
            <md-outlined-segmented-button
              key={m}
              label={t(`controls.mode.${m}`)}
              noCheckmark
              selected={m === mode}
            />
          ))}
        </md-outlined-segmented-button-set>
      </div>

      <label className="flex min-w-0 flex-col gap-1">
        <span className="md-typescale-label-large text-[var(--md-sys-color-on-surface-variant)]">
          {t("controls.depthUpLabel", { value: depthUp })}
        </span>
        <md-slider
          ref={depthUpRef}
          min={0}
          max={20}
          step={1}
          value={depthUp}
          labeled
        />
      </label>

      <label className="flex min-w-0 flex-col gap-1">
        <span className="md-typescale-label-large text-[var(--md-sys-color-on-surface-variant)]">
          {t("controls.depthDownLabel", { value: depthDown })}
        </span>
        <md-slider
          ref={depthDownRef}
          min={0}
          max={20}
          step={1}
          value={depthDown}
          labeled
        />
      </label>

      <div className="flex justify-end">
        <MdButton variant="outlined" type="button" onClick={resetView}>
          {t("controls.resetView")}
        </MdButton>
      </div>
    </div>
  );
}
