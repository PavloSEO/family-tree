# Двуязычный интерфейс (ru / en) — статус

## Решение

Полноценный **клиентский** i18n: языки **ru** (по умолчанию) и **en**, стек **i18next** + **react-i18next**, JSON в `packages/client/src/locales/{ru,en}/`. Серверные тексты ошибок на первом этапе без локализации (при необходимости позже — отдельная задача).

## Состояние: готово

Реализация и правила для разработчиков описаны в **`docs/i18n-client.md`**. В **`README.md`** есть ссылка на раздел про языки.

Кратко по коду:

- переключатель **`UiLangSwitch`**, ключ **`ft_ui_lang`** в `localStorage`, **`document.documentElement.lang`**;
- namespaces: `common`, `auth`, `layout`, `tree`, `person`, `admin`, `albums`, `backup`, `errors`;
- **`useAppLocale`** / **`lib/app-locale.ts`** — даты, collator, сортировка ФИО;
- политика ошибок API для **en** UI при кириллице в ответе — в **`docs/i18n-client.md`** и **`api/client.ts`**.

## Опционально позже

- Локализация тел сообщений API по **`Accept-Language`**.
- Расширенный регрессионный проход по всем маршрутам после крупных изменений UI.
