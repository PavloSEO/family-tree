# Family Tree -- Этапы работы

> 50 этапов. Порядок выполнения строгий. Каждый этап -- отдельный коммит.

---

## Phase 1: Инициализация (этапы 1-6)

- [x] **01** Создать pnpm workspace: корневой `package.json`, `pnpm-workspace.yaml`, три пакета: `packages/shared`, `packages/server`, `packages/client`
- [x] **02** Настроить `packages/shared`: TypeScript, Zod-схемы для Person, Relationship, User, Photo, Album. Типы API-ответов (`ApiResponse<T>`, `PaginatedResponse<T>`). Экспорт через `index.ts`
- [x] **03** Настроить `packages/server`: Hono, better-sqlite3, Drizzle ORM. Файл `db/schema.ts` со всеми таблицами (см. `docs/05-database.md`). Файл `db/connection.ts` с WAL-режимом. Конфиг `drizzle.config.ts`
- [x] **04** Сгенерировать миграции (`drizzle-kit generate`), написать `db/migrate.ts` для автоматического применения. Написать `db/seed.ts` для создания admin-пользователя из env-переменных
- [x] **05** Настроить `packages/client`: Vite 6, React 19, TypeScript. Установить `@material/web`. Создать `index.html` с подключением шрифта Roboto и Material Symbols. Создать `global.css` с M3-токенами светлой темы (см. `docs/14-theming.md`). Настроить Tailwind 4 (только layout-утилиты)
- [x] **06** Docker: `Dockerfile` (multi-stage: deps -> build -> runner на node:22-alpine), `docker-compose.yml` с volumes для `/data/db`, `/data/photos`, `/data/backups`. Файл `.env.example`. Проверить: `docker compose up --build` запускается без ошибок

---

## Phase 2: Авторизация (этапы 7-12)

- [x] **07** Сервер: auth service -- функции `hashPassword`, `verifyPassword` (bcryptjs, cost 12), `signToken`, `verifyToken` (jose). JWT payload: `{ sub: userId, role: "admin"|"viewer", iat, exp }`
- [x] **08** Сервер: route `POST /api/auth/login` -- принимает `{ login, password, remember }`, проверяет credentials, возвращает JWT + user object. Route `GET /api/auth/me` -- возвращает текущего пользователя по JWT
- [x] **09** Сервер: auth middleware -- проверка `Authorization: Bearer <token>`, извлечение user из БД, проверка статуса `active`. Admin-only middleware для защиты admin-роутов
- [x] **10** Сервер: rate limiting -- таблица `login_attempts`, проверка 5 попыток / 15 минут по IP, ответ 429 при превышении
- [x] **11** Клиент: `AuthProvider` + `useAuth` hook -- хранение JWT в памяти, persist в localStorage при "Запомнить меня", восстановление сессии при загрузке. API-клиент (ky) с JWT-интерцептором и обработкой 401/403
- [x] **12** Клиент: страница логина на Material Web компонентах (`md-outlined-text-field`, `md-filled-button`, `md-checkbox`). `ProtectedRoute` компонент. Редирект на `/login` при отсутствии токена. Страница "Доступ приостановлен" для disabled-пользователей

---

## Phase 3: Layout и навигация (этапы 13-16)

- [x] **13** Клиент: `AppShell` -- layout с боковой навигацией (Material Web `md-list` + `md-list-item` для пунктов меню) и основной областью. Sidebar: иконки Material Symbols + текст, подсветка активного пункта через `md-ripple`
- [x] **14** Клиент: React Router 7 -- все роуты из `docs/01-architecture.md`. Вложенные routes: `/(admin)/*` защищены `adminOnly`. Навигация sidebar зависит от роли (admin видит все разделы, viewer -- только Дерево и Фотоальбомы)
- [x] **15** Клиент: UI-примитивы -- обертки над MW-компонентами для удобства в React. `MdButton`, `MdTextField`, `MdSelect`, `MdDialog`, `MdChip`. Type declarations для custom elements в `types/material-web.d.ts` (см. `docs/03-material-web.md`)
- [x] **16** Клиент: `DataTable` -- кастомный компонент на TanStack Table, стилизованный под M3 (см. `docs/16-custom-components.md`). Поддержка: сортировка, фильтры, пагинация, пустое состояние. Используется во всех admin-таблицах

---

## Phase 4: CRUD карточек (этапы 17-22)

- [x] **17** Сервер: service `person.service.ts` -- CRUD операции с persons. Валидация через Zod. Поиск по имени/фамилии (LIKE). Фильтрация по стране, статусу (живой/умерший). Пагинация
- [x] **18** Сервер: routes `GET/POST/PUT/DELETE /api/persons`, `GET /api/persons/:id`, `GET /api/persons/duplicates`. Admin-only для мутаций
- [x] **19** Клиент: `AdminPersonsPage` -- DataTable со всеми карточками. Колонки: фото (thumbnail), имя, фамилия, пол, дата рождения, страна, статус. Поиск, фильтры. Кнопки: "Создать" (FAB), "Редактировать", "Удалить" (с подтверждением через `md-dialog`)
- [x] **20** Клиент: `PersonForm` -- форма создания/редактирования. React Hook Form + Zod. Обязательные поля всегда видны (`md-outlined-text-field` для имени/фамилии, `md-radio` для пола). Опциональные секции в аккордеонах. Все поля из раздела 3 основного ТЗ
- [x] **21** Сервер: загрузка mainPhoto -- route `POST /api/persons/:id/photo`, обработка через sharp (thumbnail 300px), сохранение в `/data/photos/{personId}/main.{ext}`
- [x] **22** Клиент: `PersonPage` -- полная карточка (readonly). Шапка с фото и именем, секции "О человеке", "Контакты", "Работа и увлечения", "Дополнительно". Каждая секция скрыта при отсутствии данных. Material Web компоненты: `md-elevated-card` (labs), `md-divider`, `md-icon`, `md-chip` для хобби

---

## Phase 5: Связи (этапы 23-27)

- [x] **23** Сервер: service `relationship.service.ts` -- CRUD с валидацией: нет самоссылок, нет дубликатов, макс 2 parent-связи, нет циклов (BFS), возрастная проверка (warning)
- [x] **24** Сервер: routes `GET/POST/PUT/DELETE /api/relationships`. Валидация на каждую мутацию. Каскадное удаление связей при удалении карточки
- [x] **25** Клиент: `AdminRelationshipsPage` -- DataTable со всеми связями. Колонки: тип, человек A, человек B, дата свадьбы (для spouse), статус брака
- [x] **26** Клиент: `RelationshipForm` -- визуальный помощник. Два поля поиска людей (`md-outlined-text-field` с autocomplete-выпадающим `md-menu`), выбор типа (`md-radio`), дополнительные поля для spouse. Предупреждения через `md-dialog`
- [x] **27** Shared: `tree-compute.ts` -- BFS по графу, `findShortestPath`, `getRelationshipLabel` (маппинг путей в русские названия). Тесты. Используется и на сервере, и на клиенте. Блок "Родственники" в `PersonPage`

---

## Phase 6: Дерево (этапы 28-34)

- [x] **28** Сервер: service `tree.service.ts` -- построение подграфа от корня с учетом mode, depth, фильтров. Route `GET /api/tree/:personId`. Ответ: `{ nodes[], edges[], rootId }`
- [x] **29** Клиент: `FamilyTree` -- React Flow canvas. Базовый рендер нод и ребер. Zoom, pan, minimap, controls
- [x] **30** Клиент: кастомные ноды -- `PersonNode` (фото + имя + годы + флаг страны), `DeadPersonNode` (ч/б фото, приглушенная рамка), `ExternalNode` (пунктирная рамка). Кастомные ребра: `SpouseEdge` (двойная линия), дефолтный edge (сплошная линия), пунктирный для внешних
- [x] **31** Клиент: `useTreeLayout` hook -- ELK layout. Настройка: layered алгоритм, direction DOWN, группировка пар, правильный spacing между поколениями
- [x] **32** Клиент: `TreeControls` -- панель управления. Режимы просмотра через `md-segmented-button-set` (labs). Ползунок глубины через `md-slider`. Кнопка "Сбросить вид"
- [x] **33** Клиент: `TreeFilters` -- фильтры через `md-outlined-select` (страна, статус, ветка). Поиск по имени через `md-outlined-text-field` с подсветкой найденной ноды и auto-scroll
- [x] **34** Клиент: взаимодействие -- клик на ноду открывает карточку (navigate), двойной клик перестраивает дерево от этой ноды. Внешние ветки свернуты по умолчанию, кнопка "+" для раскрытия

---

## Phase 7: Фотоальбомы (этапы 35-40)

- [x] **35** Сервер: CRUD для albums и photos. Route `POST /api/photos/upload` (multipart). Sharp: генерация thumbnail, EXIF-ротация. Exifr: парсинг даты и GPS. Валидация MIME-type на сервере
- [x] **36** Сервер: route `GET /api/photos/file/:path` -- раздача файлов фото. Защита от directory traversal. Route `POST /api/photos/:id/tag` -- разметка людей
- [x] **37** Клиент: `AdminAlbumsPage` -- сетка альбомов (обложка + название + год). Создание альбома через `md-dialog` с формой
- [x] **38** Клиент: `PhotoUploader` -- drag & drop зона для загрузки фото. Preview перед загрузкой. `md-linear-progress` во время загрузки. Множественная загрузка
- [x] **39** Клиент: `PhotoTagger` -- разметка людей на фото. Canvas overlay для рисования прямоугольников. Dropdown для выбора человека (`md-menu` с поиском). Отображение существующих разметок
- [x] **40** Клиент: `PhotoGallery` -- лайтбокс (yet-another-react-lightbox). Свайп, зум. Overlay с разметками (полупрозрачные рамки, имена при hover). Общие альбомы + альбомы из карточек

---

## Phase 8: Пользователи и настройки (этапы 41-44)

- [x] **41** Сервер: CRUD для users (admin only). Нельзя создать второго admin. Деактивация (disabled), удаление. Route `GET/POST/PUT/DELETE /api/users`
- [x] **42** Клиент: `AdminUsersPage` -- DataTable с пользователями. Колонки: логин, роль, статус, привязанная карточка, дата создания, последний вход. Создание через `md-dialog` с формой
- [x] **43** Сервер: route `GET/PUT /api/settings`. Key-value хранилище: siteName, defaultRootPersonId, глубина дерева, внешние ветки, акцентный цвет, TTL сессии
- [x] **44** Клиент: `AdminSettingsPage` -- форма настроек. `md-outlined-text-field` для текстовых, `md-slider` для глубины, `md-switch` для тогглов, color picker для акцентного цвета

---

## Phase 9: Инфографика (этапы 45-46)

- [x] **45** Shared: утилиты вычислений -- `zodiac.ts` (западный знак по дате), `chinese-year.ts` (животное по году, упрощенная логика для MVP), `age.ts` (текущий возраст или возраст на момент смерти), `date-format.ts` (русская локаль)
- [x] **46** Клиент: `InfoGraphics` блок в карточке -- возраст, знак зодиака, китайский год, группа крови, место рождения, текущее место. Каждая строка только при наличии данных. `ContactsBlock` -- телефон (tel:), email (mailto:), иконки соцсетей (Material Symbols). `CustomFieldsBlock` -- key-value из customFields

---

## Phase 10: Бэкапы и финализация (этапы 47-50)

- [x] **47** Сервер: backup service -- архивация SQLite + photos в tar.gz. Routes: `POST /api/backup` (создать), `GET /api/backup` (список), `GET /api/backup/:filename` (скачать), `DELETE /api/backup/:filename`
- [x] **48** Клиент: `AdminBackupPage` -- список бэкапов в DataTable, кнопка "Создать бэкап" (FAB), скачивание, удаление. `md-linear-progress` при создании. Docker: cron-скрипт для ежедневного автобэкапа (3:00 AM), хранение 30 дней
- [x] **49** Клиент: `WelcomePage` -- экран для пустой базы ("Начните с создания своей карточки"). Автосохранение черновика формы в sessionStorage при истечении сессии. `md-snackbar`-подобные toast-уведомления (sonner, стилизованный под M3)
- [x] **50** Финальная сборка: `docker compose up --build`, smoke-тест всех страниц, проверка auth flow, проверка CRUD, проверка дерева с тестовыми данными, деплой на VPS. Документирование процедуры сброса пароля через CLI

---

## Остаток по аудиту (вне 50 этапов)

Следующие пункты перенесены из `to-do/AUDIT.md` (файл удалён после закрытия части задач).

- **Docker smoke** — подтвердить `docker compose up --build` в среде с запущенным daemon; health, SPA, login.
- **mainPhoto** — сохранять оригинал на диск (`original.{ext}`) плюс сжатый `main.jpg` / `main_thumb.jpg` по ТЗ.
- **Персоны на клиенте** — `GET /api/persons/search` и замена массовой подгрузки в формах и на `AdminRelationshipsPage` (имена в ответе API связей).
- **gender: "other"** — схема shared, Drizzle, миграция, UI, `tree-compute`, placeholder-neutral.
- **Responsive** — ручной проход по ключевым экранам (sidebar, таблицы, дерево, формы).
- **Китайский зодиак** — при необходимости: даты CNY вместо «только год».
- **HTTPS** — при деплое без Caddy: явный редирект или документация под выбранный прокси.

Сделано в ходе аудита (кратко): Lucide в `ContactsBlock`, два слайдера `depthUp` / `depthDown` в `TreeControls`, динамический import ELK, пример `Caddyfile`, toasts (sonner) на основных admin-страницах и в `PhotoTagger` / `PhotoUploader`, проверка `archiver` в бандле backup-cli.
