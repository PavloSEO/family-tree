import type { AppSettings, Person } from "@family-tree/shared";
import { appSettingsSchema } from "@family-tree/shared";
import { HTTPError } from "ky";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchAppSettings, updateAppSettings } from "../api/settings.js";
import { fetchPersonsList } from "../api/persons.js";
import {
  MdButton,
  MdSelect,
  MdSelectOption,
  MdTextField,
} from "../components/md/index.js";

function baseErrorMessage(e: unknown, unknownLabel: string): string {
  if (e instanceof HTTPError) {
    return e.message;
  }
  if (e instanceof Error) {
    return e.message;
  }
  return unknownLabel;
}

async function errorMessage(
  e: unknown,
  unknownLabel: string,
): Promise<string> {
  if (e instanceof HTTPError) {
    try {
      const body = (await e.response.clone().json()) as { error?: string };
      if (body.error && body.error.trim().length > 0) {
        return body.error;
      }
    } catch {
      /* не JSON */
    }
  }
  return baseErrorMessage(e, unknownLabel);
}

function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) {
    return min;
  }
  return Math.min(max, Math.max(min, Math.floor(n)));
}

export function AdminSettingsPage() {
  const { t, i18n } = useTranslation("admin");
  const { t: tc } = useTranslation("common");
  const sortLocale = i18n.language?.startsWith("ru") ? "ru" : "en";
  const dash = t("common.dash");

  const [draft, setDraft] = useState<AppSettings | null>(null);
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [settings, personsRes] = await Promise.all([
        fetchAppSettings(),
        fetchPersonsList({ page: 1, limit: 500 }),
      ]);
      setDraft(settings);
      setPersons(personsRes.data);
    } catch (e) {
      setLoadError(await errorMessage(e, t("common.unknownError")));
      setDraft(null);
      setPersons([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const personLabel = useCallback(
    (personId: string | null) => {
      if (!personId) {
        return dash;
      }
      const p = persons.find((x) => x.id === personId);
      return p ? `${p.firstName} ${p.lastName}` : personId.slice(0, 8);
    },
    [persons, dash],
  );

  const sortedPersons = useMemo(
    () =>
      [...persons].sort((a, b) =>
        `${a.lastName} ${a.firstName}`.localeCompare(
          `${b.lastName} ${b.firstName}`,
          sortLocale,
        ),
      ),
    [persons, sortLocale],
  );

  const rootSelectValue = draft?.defaultRootPersonId ?? "";

  const save = async () => {
    if (!draft) {
      return;
    }
    setSaveError(null);
    const parsed = appSettingsSchema.safeParse(draft);
    if (!parsed.success) {
      setSaveError(
        parsed.error.errors[0]?.message ?? t("settings.loadErrorForm"),
      );
      return;
    }
    setSaving(true);
    try {
      const next = await updateAppSettings(parsed.data);
      setDraft(next);
    } catch (e) {
      setSaveError(await errorMessage(e, t("common.unknownError")));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <p className="md-typescale-body-large text-[var(--md-sys-color-on-surface-variant)]">
          {tc("loading")}
        </p>
      </div>
    );
  }

  if (loadError || !draft) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <h1 className="md-typescale-headline-small m-0 text-[var(--md-sys-color-on-surface)]">
          {t("settings.title")}
        </h1>
        <p className="text-[var(--md-sys-color-error)]">
          {loadError ?? t("common.noData")}
        </p>
        <MdButton variant="outlined" type="button" onClick={() => void load()}>
          {t("common.retry")}
        </MdButton>
      </div>
    );
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="md-typescale-headline-small m-0 text-[var(--md-sys-color-on-surface)]">
          {t("settings.title")}
        </h1>
        <p className="md-typescale-body-medium m-0 mt-1 text-[var(--md-sys-color-on-surface-variant)]">
          {t("settings.subtitle")}
        </p>
      </div>

      <md-elevated-card className="block p-5">
        <div className="flex flex-col gap-6">
          <MdTextField
            label={t("settings.labelSiteName")}
            value={draft.siteName}
            disabled={saving}
            onValueChange={(siteName) => {
              setDraft((d) => (d ? { ...d, siteName } : d));
            }}
          />

          <MdSelect
            label={t("settings.labelDefaultRoot")}
            value={rootSelectValue}
            disabled={saving}
            supportingText={
              rootSelectValue
                ? personLabel(draft.defaultRootPersonId)
                : t("settings.rootNotSetClient")
            }
            onValueChange={(v) => {
              setDraft((d) =>
                d
                  ? {
                      ...d,
                      defaultRootPersonId: v === "" ? null : v,
                    }
                  : d,
              );
            }}
          >
            <MdSelectOption value="" headline={t("settings.optionRootNotSet")} />
            {sortedPersons.map((p) => (
              <MdSelectOption
                key={p.id}
                value={p.id}
                headline={`${p.lastName} ${p.firstName}`}
              />
            ))}
          </MdSelect>

          <label className="flex min-w-0 flex-col gap-1">
            <span className="md-typescale-label-large text-[var(--md-sys-color-on-surface-variant)]">
              {t("settings.depthUp", { value: draft.defaultDepthUp })}
            </span>
            <md-slider
              min={0}
              max={20}
              step={1}
              value={draft.defaultDepthUp}
              labeled
              disabled={saving}
              onInput={(e) => {
                const v = Math.round(
                  Number((e.currentTarget as { value?: number }).value),
                );
                const n = clampInt(v, 0, 20);
                setDraft((d) => (d ? { ...d, defaultDepthUp: n } : d));
              }}
            />
          </label>

          <label className="flex min-w-0 flex-col gap-1">
            <span className="md-typescale-label-large text-[var(--md-sys-color-on-surface-variant)]">
              {t("settings.depthDown", { value: draft.defaultDepthDown })}
            </span>
            <md-slider
              min={0}
              max={20}
              step={1}
              value={draft.defaultDepthDown}
              labeled
              disabled={saving}
              onInput={(e) => {
                const v = Math.round(
                  Number((e.currentTarget as { value?: number }).value),
                );
                const n = clampInt(v, 0, 20);
                setDraft((d) => (d ? { ...d, defaultDepthDown: n } : d));
              }}
            />
          </label>

          <label className="flex items-center justify-between gap-4">
            <span className="md-typescale-body-large text-[var(--md-sys-color-on-surface)]">
              {t("settings.showExternal")}
            </span>
            <md-switch
              selected={draft.showExternalBranches}
              disabled={saving}
              onInput={(e) => {
                const sel = (e.currentTarget as unknown as { selected: boolean })
                  .selected;
                setDraft((d) => (d ? { ...d, showExternalBranches: sel } : d));
              }}
            />
          </label>

          <label className="flex min-w-0 flex-col gap-1">
            <span className="md-typescale-label-large text-[var(--md-sys-color-on-surface-variant)]">
              {t("settings.externalDepth", { value: draft.externalBranchDepth })}
            </span>
            <md-slider
              min={0}
              max={20}
              step={1}
              value={draft.externalBranchDepth}
              labeled
              disabled={saving}
              onInput={(e) => {
                const v = Math.round(
                  Number((e.currentTarget as { value?: number }).value),
                );
                const n = clampInt(v, 0, 20);
                setDraft((d) => (d ? { ...d, externalBranchDepth: n } : d));
              }}
            />
          </label>

          <div className="flex flex-col gap-3">
            <span className="md-typescale-label-large text-[var(--md-sys-color-on-surface-variant)]">
              {t("settings.accentColor")}
            </span>
            <div className="flex flex-wrap items-center gap-4">
              <input
                type="color"
                className="h-12 w-20 cursor-pointer rounded-md border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] p-1"
                value={draft.accentColor}
                disabled={saving}
                aria-label={t("settings.colorPickerAria")}
                onChange={(e) => {
                  const hex = e.target.value;
                  setDraft((d) => (d ? { ...d, accentColor: hex } : d));
                }}
              />
              <div className="min-w-0 flex-1">
                <MdTextField
                  label={t("settings.hexLabel")}
                  value={draft.accentColor}
                  disabled={saving}
                  supportingText={t("settings.hexHint")}
                  onValueChange={(accentColor) => {
                    setDraft((d) => (d ? { ...d, accentColor } : d));
                  }}
                />
              </div>
            </div>
          </div>

          <MdTextField
            label={t("settings.sessionTtl")}
            type="number"
            value={String(draft.sessionTtlDays)}
            disabled={saving}
            supportingText={t("settings.sessionTtlHint")}
            onValueChange={(raw) => {
              const n = Number.parseInt(raw, 10);
              setDraft((d) =>
                d
                  ? {
                      ...d,
                      sessionTtlDays: clampInt(
                        Number.isFinite(n) ? n : d.sessionTtlDays,
                        1,
                        365,
                      ),
                    }
                  : d,
              );
            }}
          />

          {saveError ? (
            <p className="m-0 text-[var(--md-sys-color-error)]">{saveError}</p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <MdButton
              variant="filled"
              type="button"
              disabled={saving}
              onClick={() => void save()}
            >
              {t("settings.save")}
            </MdButton>
            <MdButton
              variant="outlined"
              type="button"
              disabled={saving}
              onClick={() => void load()}
            >
              {t("settings.resetFromServer")}
            </MdButton>
          </div>
        </div>
      </md-elevated-card>
    </div>
  );
}
