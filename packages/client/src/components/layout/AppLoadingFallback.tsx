import { useTranslation } from "react-i18next";

export function AppLoadingFallback() {
  const { t } = useTranslation("common");
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="md-typescale-body-large">{t("loading")}</p>
    </div>
  );
}
