import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { fetchPersonsList } from "../api/persons.js";
import { PersonForm } from "../components/person/PersonForm.js";
import { useAuth } from "../hooks/useAuth.js";
import {
  loadWelcomePersonDraft,
  WELCOME_PERSON_DRAFT_KEY,
} from "../lib/welcome-person-draft.js";

export function WelcomePage() {
  const { t } = useTranslation("person");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [total, setTotal] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const draftToastShown = useRef(false);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await fetchPersonsList({ page: 1, limit: 1 });
      setTotal(res.total);
    } catch (e) {
      setLoadError(
        e instanceof Error ? e.message : t("welcome.loadError"),
      );
      setTotal(null);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (draftToastShown.current || user?.role !== "admin") {
      return;
    }
    draftToastShown.current = true;
    const d = loadWelcomePersonDraft(WELCOME_PERSON_DRAFT_KEY);
    if (d && (d.firstName?.trim() || d.lastName?.trim())) {
      toast.message(t("welcome.draftToastTitle"), {
        description: t("welcome.draftToastDesc"),
      });
    }
  }, [user?.role, t]);

  if (total === null && !loadError) {
    return (
      <div className="p-6">
        <p className="md-typescale-body-large m-0 text-[var(--md-sys-color-on-surface-variant)]">
          {t("welcome.loading")}
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-6">
        <p className="md-typescale-body-large m-0 text-[var(--md-sys-color-error)]">{loadError}</p>
      </div>
    );
  }

  if (total !== null && total > 0) {
    return <Navigate to="/" replace />;
  }

  const isAdmin = user?.role === "admin";

  return (
    <div className="mx-auto max-w-3xl p-6">
      <md-elevated-card className="block overflow-hidden">
        <div className="p-6">
          <h1 className="md-typescale-headline-medium m-0 text-[var(--md-sys-color-on-surface)]">
            {t("welcome.title")}
          </h1>
          <p className="md-typescale-body-large m-0 mt-3 text-[var(--md-sys-color-on-surface-variant)]">
            {t("welcome.intro")}
          </p>
          {isAdmin ? (
            <p className="md-typescale-body-medium m-0 mt-2 text-[var(--md-sys-color-on-surface-variant)]">
              {t("welcome.draftHint")}
            </p>
          ) : null}
        </div>
      </md-elevated-card>

      {isAdmin ? (
        <div className="mt-6">
          <h2 className="md-typescale-title-large m-0 mb-4 text-[var(--md-sys-color-on-surface)]">
            {t("welcome.firstCardHeading")}
          </h2>
          <PersonForm
            mode="create"
            sessionStorageDraftKey={WELCOME_PERSON_DRAFT_KEY}
            onSuccess={() => {
              toast.success(t("welcome.cardCreatedTitle"), {
                description: t("welcome.cardCreatedDesc"),
              });
              navigate("/", { replace: true });
            }}
            onCancel={() => {
              navigate("/", { replace: true });
            }}
          />
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] p-6">
          <p className="md-typescale-body-large m-0 text-[var(--md-sys-color-on-surface)]">
            {t("welcome.viewerMessage")}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/tree"
              className="md-typescale-label-large text-[var(--md-sys-color-primary)] no-underline hover:underline"
            >
              {t("welcome.goToTree")}
            </Link>
            <Link
              to="/albums"
              className="md-typescale-label-large text-[var(--md-sys-color-primary)] no-underline hover:underline"
            >
              {t("welcome.photoAlbums")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
