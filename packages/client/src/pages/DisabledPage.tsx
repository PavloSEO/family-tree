import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { UiLangSwitch } from "../components/layout/UiLangSwitch.js";

export function DisabledPage() {
  const { t } = useTranslation("auth");
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <UiLangSwitch />
      </div>
      <h1 className="md-typescale-title-large">{t("accessSuspendedTitle")}</h1>
      <p className="md-typescale-body-medium max-w-md text-center">
        {t("accessSuspendedBody")}
      </p>
      <Link
        to="/login"
        className="md-typescale-label-large"
        style={{ color: "var(--md-sys-color-primary)" }}
      >
        {t("backToLogin")}
      </Link>
    </div>
  );
}
