import type { Person, PhotoTag } from "@family-tree/shared";
import { HTTPError } from "ky";
import type {
  Dispatch,
  PointerEvent as ReactPointerEvent,
  SetStateAction,
} from "react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { createPhotoTag, deletePhotoTag } from "../api/photos.js";
import { fetchPersonsList } from "../api/persons.js";
import { MdButton, MdTextField } from "./md/index.js";

const MIN_NORM = 0.012;

/** Canvas 2D не всегда корректно парсит `var(--md-sys-color-*)` в `strokeStyle`. */
function readPrimaryColorForCanvas(): string {
  if (typeof document === "undefined") {
    return "#6750a4";
  }
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--md-sys-color-primary")
    .trim();
  return raw.length > 0 ? raw : "#6750a4";
}

function errorMessage(e: unknown, unknownLabel: string): string {
  if (e instanceof HTTPError) {
    return e.message;
  }
  if (e instanceof Error) {
    return e.message;
  }
  return unknownLabel;
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function normRectFromPixels(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  w: number,
  h: number,
): { x: number; y: number; width: number; height: number } | null {
  const nx = clamp01(Math.min(x0, x1) / w);
  const ny = clamp01(Math.min(y0, y1) / h);
  const nw = clamp01(Math.abs(x1 - x0) / w);
  const nh = clamp01(Math.abs(y1 - y0) / h);
  if (nw < MIN_NORM || nh < MIN_NORM) {
    return null;
  }
  if (nx + nw > 1 + 1e-6 || ny + nh > 1 + 1e-6) {
    return null;
  }
  return { x: nx, y: ny, width: nw, height: nh };
}

export type PhotoTaggerProps = {
  photoId: string;
  imageSrc: string;
  tags: PhotoTag[];
  personLabel: (personId: string) => string;
  canEdit: boolean;
  onTagsChange: Dispatch<SetStateAction<PhotoTag[]>>;
};

export function PhotoTagger({
  photoId,
  imageSrc,
  tags,
  personLabel,
  canEdit,
  onTagsChange,
}: PhotoTaggerProps) {
  const { t } = useTranslation("albums");
  const { t: tc } = useTranslation("common");
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const capturePidRef = useRef<number | null>(null);
  const [boxW, setBoxW] = useState(0);
  const [boxH, setBoxH] = useState(0);

  const drawRef = useRef<{
    active: boolean;
    sx: number;
    sy: number;
    curX: number;
    curY: number;
  }>({ active: false, sx: 0, sy: 0, curX: 0, curY: 0 });

  const [draftNorm, setDraftNorm] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const idBase = useId().replace(/:/g, "");
  const searchAnchorId = `tagger-search-${idBase}`;
  const [personQ, setPersonQ] = useState("");
  const [candidates, setCandidates] = useState<Person[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const syncCanvasSize = useCallback(() => {
    const img = imgRef.current;
    if (!img) {
      return;
    }
    const w = img.offsetWidth;
    const h = img.offsetHeight;
    if (w < 1 || h < 1) {
      return;
    }
    setBoxW(w);
    setBoxH(h);
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${String(w)}px`;
    canvas.style.height = `${String(h)}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }, []);

  useLayoutEffect(() => {
    syncCanvasSize();
  }, [imageSrc, syncCanvasSize]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) {
      return;
    }
    const ro = new ResizeObserver(() => {
      syncCanvasSize();
    });
    ro.observe(wrap);
    return () => {
      ro.disconnect();
    };
  }, [syncCanvasSize]);

  const clearCanvas = useCallback(() => {
    const c = canvasRef.current;
    const ctx = c?.getContext("2d");
    if (!ctx || !c) {
      return;
    }
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, c.width / dpr, c.height / dpr);
  }, []);

  const strokePreview = useCallback(
    (x0: number, y0: number, x1: number, y1: number) => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx || !canvasRef.current) {
        return;
      }
      const w = canvasRef.current.width / (window.devicePixelRatio || 1);
      const h = canvasRef.current.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);
      const left = Math.min(x0, x1);
      const top = Math.min(y0, y1);
      const rw = Math.abs(x1 - x0);
      const rh = Math.abs(y1 - y0);
      ctx.strokeStyle = readPrimaryColorForCanvas();
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(left, top, rw, rh);
      ctx.setLineDash([]);
    },
    [],
  );

  useEffect(() => {
    if (!draftNorm || !canEdit) {
      setPersonQ("");
      setCandidates([]);
      setMenuOpen(false);
      return;
    }
    const queryTrim = personQ.trim();
    if (queryTrim.length < 1) {
      setCandidates([]);
      setMenuOpen(false);
      return;
    }
    const handle = window.setTimeout(() => {
      void (async () => {
        setSearching(true);
        try {
          const res = await fetchPersonsList({
            search: queryTrim,
            page: 1,
            limit: 15,
          });
          setCandidates(res.data);
          setMenuOpen(res.data.length > 0);
        } catch {
          setCandidates([]);
          setMenuOpen(false);
        } finally {
          setSearching(false);
        }
      })();
    }, 350);
    return () => {
      window.clearTimeout(handle);
    };
  }, [personQ, draftNorm, canEdit]);

  useEffect(() => {
    const onWinPointerMove = (e: PointerEvent) => {
      if (!drawRef.current.active || !canvasRef.current) {
        return;
      }
      const b = canvasRef.current.getBoundingClientRect();
      const px = e.clientX - b.left;
      const py = e.clientY - b.top;
      drawRef.current.curX = px;
      drawRef.current.curY = py;
      strokePreview(
        drawRef.current.sx,
        drawRef.current.sy,
        drawRef.current.curX,
        drawRef.current.curY,
      );
    };
    const onWinPointerUp = (e: PointerEvent) => {
      if (!drawRef.current.active || !canvasRef.current) {
        return;
      }
      const cnv = canvasRef.current;
      const pid = capturePidRef.current;
      if (pid != null) {
        try {
          if (cnv.hasPointerCapture(pid)) {
            cnv.releasePointerCapture(pid);
          }
        } catch {
          /* ignore */
        }
        capturePidRef.current = null;
      }
      drawRef.current.active = false;
      const b = cnv.getBoundingClientRect();
      const px = e.clientX - b.left;
      const py = e.clientY - b.top;
      const w = b.width;
      const h = b.height;
      const norm = normRectFromPixels(
        drawRef.current.sx,
        drawRef.current.sy,
        px,
        py,
        w,
        h,
      );
      clearCanvas();
      if (norm && canEdit) {
        setDraftNorm(norm);
        setPersonQ("");
        setActionError(null);
      }
    };
    window.addEventListener("pointermove", onWinPointerMove);
    window.addEventListener("pointerup", onWinPointerUp);
    return () => {
      window.removeEventListener("pointermove", onWinPointerMove);
      window.removeEventListener("pointerup", onWinPointerUp);
    };
  }, [canEdit, clearCanvas, strokePreview]);

  const onCanvasPointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!canEdit || busy || draftNorm) {
      return;
    }
    const c = canvasRef.current;
    if (!c) {
      return;
    }
    const b = c.getBoundingClientRect();
    const px = e.clientX - b.left;
    const py = e.clientY - b.top;
    drawRef.current = {
      active: true,
      sx: px,
      sy: py,
      curX: px,
      curY: py,
    };
    capturePidRef.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    setActionError(null);
  };

  const cancelDraft = () => {
    setDraftNorm(null);
    setPersonQ("");
    setCandidates([]);
    setMenuOpen(false);
    clearCanvas();
  };

  const pickPerson = async (p: Person) => {
    if (!draftNorm) {
      return;
    }
    setBusy(true);
    setActionError(null);
    try {
      const created = await createPhotoTag(photoId, {
        personId: p.id,
        x: draftNorm.x,
        y: draftNorm.y,
        width: draftNorm.width,
        height: draftNorm.height,
      });
      onTagsChange((prev) => [...prev, created]);
      cancelDraft();
    } catch (err) {
      setActionError(errorMessage(err, t("common.unknownError")));
    } finally {
      setBusy(false);
    }
  };

  const removeTag = async (tagId: string) => {
    setDeletingId(tagId);
    setActionError(null);
    try {
      await deletePhotoTag(photoId, tagId);
      onTagsChange((prev) => prev.filter((x) => x.id !== tagId));
    } catch (err) {
      setActionError(errorMessage(err, t("common.unknownError")));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={wrapRef}
        className="inline-block max-w-full rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)]"
      >
        <div className="relative inline-block">
          <img
            ref={imgRef}
            src={imageSrc}
            alt=""
            className="block max-h-[75vh] w-auto max-w-full"
            draggable={false}
            onLoad={syncCanvasSize}
          />
          {boxW > 0 && boxH > 0 ? (
            <div
              className="pointer-events-none absolute left-0 top-0"
              style={{ width: boxW, height: boxH }}
            >
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="absolute border-2 border-[var(--md-sys-color-primary)] bg-[color-mix(in_srgb,var(--md-sys-color-primary)_22%,transparent)]"
                  style={{
                    left: `${String(tag.x * 100)}%`,
                    top: `${String(tag.y * 100)}%`,
                    width: `${String(tag.width * 100)}%`,
                    height: `${String(tag.height * 100)}%`,
                  }}
                >
                  <span className="md-typescale-label-small absolute left-0 top-0 z-10 max-w-[12rem] -translate-y-full truncate rounded-sm bg-[var(--md-sys-color-inverse-surface)] px-1 py-0.5 text-[var(--md-sys-color-inverse-on-surface)]">
                    {personLabel(tag.personId)}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
          {canEdit ? (
            <canvas
              ref={canvasRef}
              className={`absolute left-0 top-0 touch-none ${draftNorm || busy ? "pointer-events-none" : "cursor-crosshair"}`}
              style={{ width: boxW || undefined, height: boxH || undefined }}
              onPointerDown={onCanvasPointerDown}
            />
          ) : null}
        </div>
      </div>

      {canEdit && draftNorm ? (
        <div className="relative flex max-w-md flex-col gap-2">
          <p className="md-typescale-title-small m-0 text-[var(--md-sys-color-on-surface)]">
            {t("tagger.whoInRegion")}
          </p>
          <MdTextField
            id={searchAnchorId}
            label={t("tagger.searchLabel")}
            value={personQ}
            onValueChange={setPersonQ}
            disabled={busy}
            supportingText={searching ? t("tagger.searching") : undefined}
          />
          <md-menu
            anchor={searchAnchorId}
            open={menuOpen && candidates.length > 0 && !busy}
            positioning="popover"
          >
            {candidates.map((p) => (
              <md-menu-item
                key={p.id}
                headline={`${p.firstName} ${p.lastName}`}
                onClick={() => {
                  void pickPerson(p);
                }}
              />
            ))}
          </md-menu>
          <div className="flex flex-wrap gap-2">
            <MdButton
              variant="text"
              type="button"
              disabled={busy}
              onClick={cancelDraft}
            >
              {t("tagger.cancelFrame")}
            </MdButton>
          </div>
        </div>
      ) : null}

      {canEdit && !draftNorm ? (
        <p className="md-typescale-body-medium m-0 text-[var(--md-sys-color-on-surface-variant)]">
          {t("tagger.hintDraw")}
        </p>
      ) : null}

      {tags.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="md-typescale-title-small m-0 text-[var(--md-sys-color-on-surface)]">
            {t("tagger.tagsHeading")}
          </p>
          <ul className="m-0 list-none space-y-2 p-0">
            {tags.map((tag) => (
              <li
                key={tag.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--md-sys-color-outline-variant)] px-3 py-2"
              >
                <span className="md-typescale-body-large">
                  {personLabel(tag.personId)}
                </span>
                {canEdit ? (
                  <MdButton
                    variant="text"
                    type="button"
                    disabled={deletingId === tag.id}
                    onClick={() => {
                      void removeTag(tag.id);
                    }}
                  >
                    {deletingId === tag.id
                      ? t("tagger.deleting")
                      : tc("delete")}
                  </MdButton>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="md-typescale-body-medium m-0 text-[var(--md-sys-color-on-surface-variant)]">
          {t("tagger.noTags")}
        </p>
      )}

      {actionError ? (
        <p className="md-typescale-body-medium m-0 text-[var(--md-sys-color-error)]">
          {actionError}
        </p>
      ) : null}
    </div>
  );
}
