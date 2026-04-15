import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { getAppCollatorLocale, getAppDateLocale } from "../lib/app-locale.js";

export type AppLocale = {
  dateLocale: string;
  collatorLocale: string;
};

/**
 * Locales for dates/numbers and general string collation from current UI language (§17).
 * Person **name** sorting uses fixed Russian collation — `getFamilyNameSortLocale` / `comparePersonNames` in `lib/app-locale.ts` (§18).
 */
export function useAppLocale(): AppLocale {
  const { i18n } = useTranslation();
  return useMemo(
    () => ({
      dateLocale: getAppDateLocale(),
      collatorLocale: getAppCollatorLocale(),
    }),
    [i18n.language],
  );
}
