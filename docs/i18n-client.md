# Bilingual client UI (ru / en)

Client: **`packages/client`**. Stack: **i18next** + **react-i18next**, resources are static `import` JSON (no `i18next-http-backend`).

## Where strings live

- Directory: **`packages/client/src/locales/<lang>/`**, languages: **`ru`**, **`en`**.
- One file = one **namespace** (filename = namespace), e.g. `common.json` → namespace `common`.
- For each key, structures in **`ru/...`** and **`en/...`** must match (same nesting).

The list of namespaces is wired in **`packages/client/src/i18n.ts`** (array **`I18N_NAMESPACES`** and the `resources` block). For a new translation file, import it there for **`ru`** and **`en`**, add to **`ns`** and to **`I18N_NAMESPACES`** if needed.

## How to add a key

1. Add the key in **`locales/ru/<namespace>.json`** and mirror it in **`locales/en/<namespace>.json`**.
2. In a component: `useTranslation("<namespace>")`, then `t("key")` or `t("section.key")`. Multiple namespaces: `useTranslation(["admin", "common"])`.
3. Placeholders: `t("path", { name: value })` — in JSON use **`{{name}}`**.
4. UI language is stored in **`localStorage`** (key **`ft_ui_lang`**, values **`ru`** / **`en`**); see **`lib/ui-lang-storage.ts`** and **`changeAppUiLanguage`** in **`i18n.ts`**.

Dates, general string sorting, and the **name** policy are described in code: **`hooks/useAppLocale.ts`**, **`lib/app-locale.ts`** (including **`comparePersonNames`**).

## Check

From the repo root:

```bash
pnpm --filter @family-tree/client run typecheck
```

The client has no **`lint`** script yet; if you add ESLint, invoke it the same way via **`pnpm --filter`**.

## Finding leftover Russian in pages

Sometimes it helps to scan pages for Cyrillic outside JSON (untranslated UI remnants):

```bash
rg "[\u0400-\u04FF]" packages/client/src/pages --glob "*.tsx"
```

Same for **`components/`** if needed. Filter out comments and intentional cases (e.g. server error text checks) manually.

Short status and a manual regression checklist — **`to-do/i18n-ru-en.md`**.
