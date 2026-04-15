# Двуязычный интерфейс (ru / en)

## Решение

**Да — делаем полноценный i18n на клиенте.** Языки: **ru** (по умолчанию) и **en**. Стек: **i18next** + **react-i18next** + JSON-ресурсы в репозитории (загрузка через `i18next-http-backend` или статический `import` namespace — выбрать в п. 2; для Vite чаще удобен **статический import** без лишнего запроса).

Сервер на первом этапе: ответы API и сообщения об ошибках **остаются на русском**; при необходимости позже — заголовок **`Accept-Language`** и дублирование текстов ошибок (отдельный эпик).

---

## Текущее состояние

**Не реализовано.** Интерфейс клиента и большинство сообщений на русском, без переключателя языка и без каталогов переводов.

Уже в коде (не i18n):

- сортировка строк с учётом русской локали (`localeCompare(..., "ru")` и т.п.);
- формат дат в отдельных местах (`toLocaleString("ru-RU", …)`);
- **`PhotoUploader`**: сообщения пользователю (MIME, размер файла) на **русском** — старый пункт рисков про «английский текст MIME» был **ошибочным**.

---

## Цель

Один сайт — два языка интерфейса: **ru** и **en**; выбор языка сохраняется (например **`localStorage`**, ключ зафиксировать в коде константой); **`document.documentElement.lang`** обновляется при смене языка.

**Критерий готовности:** пользователь переключает язык и видит **весь основной UI** на выбранном языке без смешения ru/en в одной форме; выбор переживает перезагрузку страницы.

---

## План из 20 пунктов

Выполнять по порядку; пункт можно закрывать отдельным коммитом/PR.

### Прогресс

- [x] **1.** Зависимости — в **`@family-tree/client`** добавлены **`i18next`**, **`react-i18next`** (`pnpm add … --filter @family-tree/client`). **`i18next-http-backend`** не ставили — статический import JSON (п. 2–3).
- [x] **2.** Структура — `packages/client/src/locales/{ru,en}/`, по одному JSON на namespace: `common`, `auth`, `layout`, `tree`, `person`, `admin`, `albums`, `backup`, `errors`. Имена файлов = имена namespace (удобно для `import … from './locales/ru/common.json'` в п. 3). В **`tsconfig.json`** клиента включён **`resolveJsonModule`**.
- [x] **3.** Инициализация — **`packages/client/src/i18n.ts`**: `initReactI18next`, статический `resources` для `ru`/`en`, **`defaultNS: "common"`**, **`fallbackLng: "ru"`**, **`supportedLngs`**, **`interpolation.escapeValue: false`** (экранирование в React), **`react.useSuspense: false`**. Экспорт **`I18N_NAMESPACES`**, **`I18nNamespace`**, **`I18N_DEFAULT_NS`**, default **`i18n`**. В **`main.tsx`** — side-effect **`import "./i18n.js"`** до рендера.
- [x] **4.** Обёртка — в **`main.tsx`**: вокруг **`<App />`** — **`<Suspense>`** с fallback как у экрана «не готово» в **`App`** (центр, **`Загрузка…`**). **`I18nextProvider`** не используем (**react-i18next** v14+). **`Toaster`** вне **`Suspense`**, чтобы тосты не блокировались границей.
- [x] **5.** Язык в **`localStorage`** — константа **`FT_UI_LANG_STORAGE_KEY`** = **`ft_ui_lang`** (`lib/ui-lang-storage.ts`), типы **`AppUiLang`**, **`readStoredUiLang`**, **`writeStoredUiLang`**. При **`i18n.init`**: **`lng`** = сохранённое значение или **`ru`**. После init — **`i18n.on("languageChanged")`** → запись в storage для **`ru`/`en`**. Публично: **`changeAppUiLanguage`**, реэкспорт констант/хелперов из **`i18n.ts`**.
- [x] **6.** Переключатель — компонент **`UiLangSwitch`** (`components/layout/UiLangSwitch.tsx`): **`RU` / `EN`**, **`changeAppUiLanguage`**, **`useTranslation`** для ре-рендера. В **`AppShell`** под брендом; на **`LoginPage`** и **`DisabledPage`** — **`absolute`** в правом верхнем углу (маршруты без оболочки).
- [x] **7.** **`document.documentElement.lang`** — в **`i18n.ts`** после **`init`**: **`syncDocumentElementLang(toAppUiLang(i18n.language))`**; в **`languageChanged`** — то же + запись в storage (через **`toAppUiLang`**). Хелпер **`toAppUiLang`** в **`ui-lang-storage.ts`**; **`UiLangSwitch`** использует его для активной кнопки.
- [x] **8.** **`common`** — ключи **`save`**, **`cancel`**, **`delete`**, **`upload`**, **`back`**, **`error`**, **`loading`**, **`optionalPlaceholder`**, **`searchPlaceholder`**, **`interfaceLanguage`** в **`locales/{ru,en}/common.json`**. **`AppLoadingFallback`** + **`useTranslation("common")`** в **`App`**, **`main`** (**`Suspense`**), **`ProtectedRoute`**, **`UiLangSwitch`** (**`aria-label`**).
- [x] **9.** **`auth`** — **`locales/{ru,en}/auth.json`**: логин/пароль/«Запомнить»/«Войти», заголовок, клиентские тексты ошибок (**`rateLimitFallback`**, **`invalidCredentials`**, **`loginFailedGeneric`**, **`networkError`**), **`DisabledPage`**, сообщение **`useAuth`** без провайдера. Тело **`body.error`** с API по-прежнему показывается как есть, если есть. Редирект на **`/disabled`**: **`accountSuspendedMessage`** (ru + en ключевые слова). **`RootAuthLanding`** — без собственных строк (комментарий в коде).
- [x] **10.** **`layout`** — **`locales/{ru,en}/layout.json`**: **`brandTitle`**, **`navCaption`**, **`sectionAdmin`**, **`logout`**, вложенный **`nav.*`**. **`shell-nav.ts`**: у **`ShellNavEntry`** поле **`labelKey`** (ключи вида **`nav.tree`**). **`AppShell`**: **`useTranslation("layout")`** для бренда/подзаголовка/админ-заголовка/выхода; **`NavItem`** — **`t(item.labelKey)`**.
- [x] **11.** **`tree`** — **`locales/{ru,en}/tree.json`**: страницы **`TreePage`** / **`TreeLandingPage`**, **`TreeControls`** (**`controls.mode.*`**, глубина, сброс вида), **`TreeFilters`**, блок внешних веток в **`FamilyTree`**, **`PersonNode`** / **`DeadPersonNode`** / **`ExternalNode`** (подсказка клика, «внешняя ветка»). Сообщения **`HTTPError`/`Error`** в **`TreePage`** не подменяем; **`unknownError`** и **`noRootId`** — через **`tRef`** в **`useEffect`**, чтобы смена языка не дергала **`fetchTree`** заново.
- [x] **12.** **`person`** — **`locales/{ru,en}/person.json`**: **`PersonPage`**, **`PersonForm`** (**`createPersonFormFieldsSchema(t)`** + **`common`** для Сохранить/Отмена), **`ContactsBlock`**, **`InfoGraphics`** (возраст **`age.years`** + plural), **`WelcomePage`**, черновик **`welcome-person-draft`** без Zod (типобезопасный разбор JSON). **`CustomFieldsBlock`**: сортировка ключей по **`i18n.language`**.
- [x] **13.** **`admin`** — **`locales/{ru,en}/admin.json`**: все **`pages/Admin*.tsx`**, **`RelationshipForm`**, **`components/layout/AdminOnlyRoute`** (вошёл, но не админ: текст + кнопка на главную; без сессии — **`Navigate`** на **`/`**). Даты в бэкапе и сортировка части списков — по **`i18n.language`**; единый **`useAppLocale()`** — п. 17.
- [x] **14.** **`albums`** — **`locales/{ru,en}/albums.json`**: **`AlbumsBrowsePage`**, **`AlbumPage`**, **`AlbumPhotoTagPage`**, **`PhotoUploader`** (MIME/размер/очередь), **`PhotoGallery`** (подписи lightbox), **`PhotoTagger`**. Кнопка загрузки — **`common.upload`**; удаление тега — **`common.delete`**.

1. **Зависимости** — ✅ **`i18next`**, **`react-i18next`** в `packages/client`; без **`i18next-http-backend`** (ресурсы через import, см. п. 2–3).
2. **Структура ресурсов** — ✅ `packages/client/src/locales/{ru,en}/*.json` (namespace как в плане); **`resolveJsonModule`** для импорта JSON в TypeScript.
3. **Инициализация i18next** — ✅ **`src/i18n.ts`**: ресурсы, **`defaultNS`**, **`fallbackLng: "ru"`**, **`interpolation`** для React; ранний import в **`main.tsx`**.
4. **Обёртка приложения** — ✅ **`main.tsx`**: **`Suspense`** вокруг **`App`**, без **`I18nextProvider`**; **`Toaster`** снаружи **`Suspense`**.
5. **Ключ хранения языка** — ✅ **`ft_ui_lang`**, чтение → **`lng`**, запись в **`languageChanged`**; смена через **`changeAppUiLanguage`** / **`i18n.changeLanguage`**.
6. **Переключатель языка** — ✅ **`UiLangSwitch`**: **`AppShell`**, **`LoginPage`**, **`DisabledPage`**.
7. **`document.documentElement.lang`** — ✅ **`i18n.ts`**: после init и в **`languageChanged`**; нормализация **`toAppUiLang`**.
8. **Namespace `common`** — ✅ JSON + **`AppLoadingFallback`**, **`ProtectedRoute`**, **`UiLangSwitch`**; остальные ключи готовы для форм (п. 9+).
9. **Namespace `auth`** — ✅ **`LoginPage`**, **`DisabledPage`**, **`useAuth`**; **`RootAuthLanding`** без копирайта; ответы API не подменяем.
10. **Namespace `layout`** — ✅ **`shell-nav`** (**`labelKey`**) + **`AppShell`**.
11. **Namespace `tree`** — ✅ **`TreePage`**, **`TreeLandingPage`**, **`FamilyTree`**, **`TreeControls`**, **`TreeFilters`**, узлы дерева.
12. **Namespace `person`** — ✅ **`PersonPage`**, **`PersonForm`**, **`ContactsBlock`**, **`InfoGraphics`**, **`WelcomePage`**, **`CustomFieldsBlock`** (collator); **`person-form`** через фабрику + **`i18next` `TFunction`**.
13. **Namespace `admin`** — ✅ **`admin.json`**, все **`Admin*.tsx`**, **`RelationshipForm`**, **`AdminOnlyRoute`**.
14. **Namespace `albums`** — ✅ **`albums.json`**, **`AlbumPage`**, **`AlbumsBrowsePage`**, **`AlbumPhotoTagPage`**, **`PhotoUploader`**, **`PhotoGallery`**, **`PhotoTagger`**.
15. **Namespace `backup`** — **`AdminBackupPage`**: список бэкапов, кнопки создания/скачивания, тексты подтверждений.
16. **Ошибки API (клиент)** — единая политика: либо namespace **`errors`** с картой кодов/типов, либо оставить текст с сервера на ru и показывать **en**-заглушку «Server message (RU): …» только для en — **зафиксировать выбор** и применить в **`api/client.ts`** / обработчиках `ky`.
17. **Локаль для дат и чисел** — утилита или хук **`useAppLocale()`**: при `en` → `en-US` в `toLocaleString` / `Intl.DateTimeFormat`; при `ru` → `ru-RU`; пройти места с захардкоженным `"ru-RU"` / `"ru"`.
18. **Сортировка и отображение имён** — политика: данные в БД без изменений; для **en** UI можно оставить сортировку по **`ru`** для консистентности семьи или переключать collator — описать в комментарии к коду и вынести в 1–2 функции.
19. **Полный проход регрессии** — вручную или чек-лист: все маршруты на **en** и **ru**, перезагрузка, «Запомнить меня», админ и viewer; исправить пропущенные строки и **accessibility** (`aria-label` с `t()`).
20. **Документация** — короткий раздел в **`README.md`** или **`docs/`**: как добавить ключ, где лежат JSON, как прогнать проверку; при желании — скрипт `pnpm --filter @family-tree/client lint` / поиск русских букв в `pages/` для контроля дрейфа.

---

## Связанные файлы (ориентир)

- Вход: `packages/client/src/main.tsx`, `App.tsx`.
- Оболочка: `components/layout/AppShell.tsx`, `shell-nav.ts`, `ProtectedRoute.tsx`, `components/layout/AdminOnlyRoute.tsx`.
- Страницы: `packages/client/src/pages/**/*.tsx`.
- Крупные компоненты: `components/tree/*`, `components/person/*`, `PhotoUploader.tsx`, и т.д.
