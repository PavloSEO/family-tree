# Bilingual UI (ru / en) — status

## Decision

Full **client-side** i18n: languages **ru** (default) and **en**, stack **i18next** + **react-i18next**, JSON in `packages/client/src/locales/{ru,en}/`. Server error messages are not localized yet (follow-up if needed).

## State: done

Implementation and developer rules are in **`docs/i18n-client.md`**. **`README.md`** links to the languages section.

Code summary:

- Toggle **`UiLangSwitch`**, key **`ft_ui_lang`** in `localStorage`, **`document.documentElement.lang`**;
- **`useAppLocale`** / **`lib/app-locale.ts`** — dates, collator, name sorting;
- API error policy for **en** UI when the server returns Cyrillic — **`docs/i18n-client.md`** and **`api/client.ts`**.

## Optional later

- Localize API message bodies using **`Accept-Language`**.
- Broader regression pass across all routes after large UI changes.

## Manual regression (checklist excerpt)

1. Login / logout, remember me, wrong password, rate limit message.
2. Tree: modes, depth sliders, filters, double-click root change.
3. Person card: all sections with/without data; admin edit FAB.
4. Albums: upload, tag, lightbox; shared vs personal.
5. Admin tables: sort, pagination, search, empty state.
6. Settings: save site name, accent, tree defaults.
7. Backup: create, download, delete.
8. Language switch: reload persistence, date formats, untranslated string scan (`rg` per **`docs/i18n-client.md`**).
