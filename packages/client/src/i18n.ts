import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import {
  readStoredUiLang,
  toAppUiLang,
  writeStoredUiLang,
  type AppUiLang,
} from "./lib/ui-lang-storage.js";

function syncDocumentElementLang(lang: AppUiLang): void {
  if (typeof document === "undefined") {
    return;
  }
  document.documentElement.lang = lang;
}

import enAdmin from "./locales/en/admin.json";
import enAlbums from "./locales/en/albums.json";
import enAuth from "./locales/en/auth.json";
import enBackup from "./locales/en/backup.json";
import enCommon from "./locales/en/common.json";
import enErrors from "./locales/en/errors.json";
import enLayout from "./locales/en/layout.json";
import enPerson from "./locales/en/person.json";
import enTree from "./locales/en/tree.json";

import ruAdmin from "./locales/ru/admin.json";
import ruAlbums from "./locales/ru/albums.json";
import ruAuth from "./locales/ru/auth.json";
import ruBackup from "./locales/ru/backup.json";
import ruCommon from "./locales/ru/common.json";
import ruErrors from "./locales/ru/errors.json";
import ruLayout from "./locales/ru/layout.json";
import ruPerson from "./locales/ru/person.json";
import ruTree from "./locales/ru/tree.json";

export const I18N_NAMESPACES = [
  "common",
  "auth",
  "layout",
  "tree",
  "person",
  "admin",
  "albums",
  "backup",
  "errors",
] as const;

export type I18nNamespace = (typeof I18N_NAMESPACES)[number];

export const I18N_DEFAULT_NS: I18nNamespace = "common";

const initialLng: AppUiLang = readStoredUiLang() ?? "ru";

void i18n
  .use(initReactI18next)
  .init({
    resources: {
      ru: {
        admin: ruAdmin,
        albums: ruAlbums,
        auth: ruAuth,
        backup: ruBackup,
        common: ruCommon,
        errors: ruErrors,
        layout: ruLayout,
        person: ruPerson,
        tree: ruTree,
      },
      en: {
        admin: enAdmin,
        albums: enAlbums,
        auth: enAuth,
        backup: enBackup,
        common: enCommon,
        errors: enErrors,
        layout: enLayout,
        person: enPerson,
        tree: enTree,
      },
    },
    lng: initialLng,
    fallbackLng: "ru",
    supportedLngs: ["ru", "en"],
    defaultNS: I18N_DEFAULT_NS,
    ns: [...I18N_NAMESPACES],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  })
  .then(() => {
    syncDocumentElementLang(toAppUiLang(i18n.language));
    i18n.on("languageChanged", (lng) => {
      const app = toAppUiLang(lng);
      syncDocumentElementLang(app);
      writeStoredUiLang(app);
    });
  });

/** Смена языка UI: обновляет i18next и через `languageChanged` — `localStorage`. */
export async function changeAppUiLanguage(lang: AppUiLang): Promise<void> {
  await i18n.changeLanguage(lang);
}

export type { AppUiLang } from "./lib/ui-lang-storage.js";
export {
  APP_UI_LANGS,
  FT_UI_LANG_STORAGE_KEY,
  readStoredUiLang,
  toAppUiLang,
  writeStoredUiLang,
} from "./lib/ui-lang-storage.js";

export default i18n;
