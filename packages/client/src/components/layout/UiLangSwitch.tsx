import { useTranslation } from "react-i18next";
import { APP_UI_LANGS, changeAppUiLanguage } from "../../i18n.js";
import { toAppUiLang } from "../../lib/ui-lang-storage.js";

export type UiLangSwitchProps = {
  className?: string;
};

export function UiLangSwitch({ className }: UiLangSwitchProps) {
  const { t, i18n } = useTranslation("common");
  const current = toAppUiLang(i18n.language);

  return (
    <div
      className={[
        "ui-lang-switch inline-flex gap-0.5 rounded-full border border-[var(--md-sys-color-outline-variant)] p-0.5",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="radiogroup"
      aria-label={t("interfaceLanguage")}
    >
      {APP_UI_LANGS.map((lang) => {
        const active = lang === current;
        return (
          <button
            key={lang}
            type="button"
            role="radio"
            aria-checked={active}
            className={[
              "md-typescale-label-large min-w-[2.25rem] rounded-full px-2 py-1 transition-colors",
              active
                ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
                : "text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)]",
            ].join(" ")}
            onClick={() => {
              if (!active) {
                void changeAppUiLanguage(lang);
              }
            }}
          >
            {lang.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
