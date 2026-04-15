import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export function TreeLandingPage() {
  const { t } = useTranslation("tree");
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="md-typescale-headline-small m-0 text-[var(--md-sys-color-on-surface)]">
        {t("pageTitle")}
      </h1>
      <p className="md-typescale-body-large mt-4 text-[var(--md-sys-color-on-surface-variant)]">
        {t("landingIntro")}
      </p>
      {user?.role === "admin" ? (
        <p className="mt-6">
          <Link
            to="/admin/persons"
            className="md-typescale-label-large text-[var(--md-sys-color-primary)] no-underline hover:underline"
          >
            {t("personListLink")}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
