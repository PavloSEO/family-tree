/** Ключ в `localStorage` для языка интерфейса (план i18n). */
export const FT_UI_LANG_STORAGE_KEY = "ft_ui_lang";

export const APP_UI_LANGS = ["ru", "en"] as const;
export type AppUiLang = (typeof APP_UI_LANGS)[number];

export function isAppUiLang(value: string): value is AppUiLang {
  return value === "ru" || value === "en";
}

/** Нормализует код языка i18next (например en-US) к ru | en для UI и атрибута lang у documentElement. */
export function toAppUiLang(lng: string): AppUiLang {
  const base = lng.split("-")[0]?.toLowerCase() ?? lng.toLowerCase();
  return base === "en" ? "en" : "ru";
}

export function readStoredUiLang(): AppUiLang | null {
  if (typeof localStorage === "undefined") {
    return null;
  }
  try {
    const raw = localStorage.getItem(FT_UI_LANG_STORAGE_KEY);
    if (raw !== null && isAppUiLang(raw)) {
      return raw;
    }
    return null;
  } catch {
    return null;
  }
}

export function writeStoredUiLang(lang: AppUiLang): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  try {
    localStorage.setItem(FT_UI_LANG_STORAGE_KEY, lang);
  } catch {
    // квота / приватный режим — UI языка остаётся в памяти до перезагрузки
  }
}
