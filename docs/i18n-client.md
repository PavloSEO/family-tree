# Двуязычный интерфейс клиента (ru / en)

Клиент: **`packages/client`**. Стек: **i18next** + **react-i18next**, ресурсы — статический `import` JSON (без `i18next-http-backend`).

## Где лежат строки

- Каталог: **`packages/client/src/locales/<язык>/`**, языки: **`ru`**, **`en`**.
- Один файл = один **namespace** (имя файла = имя namespace), например `common.json` → namespace `common`.
- Для каждого ключа должны совпасть структуры в **`ru/...`** и **`en/...`** (одинаковая вложенность ключей).

Список namespace подключается в **`packages/client/src/i18n.ts`** (массив **`I18N_NAMESPACES`** и блок `resources`). Новый файл перевода нужно импортировать туда для **`ru`** и **`en`**, добавить в **`ns`** и при необходимости в **`I18N_NAMESPACES`**.

## Как добавить ключ

1. Добавьте ключ в **`locales/ru/<namespace>.json`** и зеркально в **`locales/en/<namespace>.json`**.
2. В компоненте: `useTranslation("<namespace>")`, вызов `t("ключ")` или `t("раздел.ключ")`. Несколько namespace: `useTranslation(["admin", "common"])`.
3. Плейсхолдеры: `t("path", { name: value })` в JSON — **`{{name}}`**.
4. Язык UI сохраняется в **`localStorage`** (ключ **`ft_ui_lang`**, значения **`ru`** / **`en`**); см. **`lib/ui-lang-storage.ts`** и **`changeAppUiLanguage`** в **`i18n.ts`**.

Даты, общая сортировка строк и отдельная политика для **ФИО** описаны в коде: **`hooks/useAppLocale.ts`**, **`lib/app-locale.ts`** (в т.ч. **`comparePersonNames`**).

## Проверка

Из корня репозитория:

```bash
pnpm --filter @family-tree/client run typecheck
```

Скрипта **`lint`** у клиента сейчас нет; при добавлении ESLint его можно вызывать тем же способом через **`pnpm --filter`**.

## Контроль «забытых» русских строк в страницах

Иногда полезно пройтись по страницам и найти кириллицу вне JSON (остатки непереведённого UI):

```bash
rg "[\u0400-\u04FF]" packages/client/src/pages --glob "*.tsx"
```

То же для **`components/`** при необходимости. Комментарии и осознанные исключения (например, проверка текста ошибки сервера) отфильтруйте вручную.

Полный чеклист ручной регрессии — в **`to-do/i18n-ru-en.md`** (п. 19).
