# AUDIT -- Результаты проверки 50 этапов

> Проверено: 50/50 логов. Дата аудита: 2026-04-15.
> Формат: проблема, где найдено, как исправить.
> Приоритет: CRITICAL > HIGH > MEDIUM > LOW.

---

## Сводная таблица

| # | Приоритет | Проблема | Этапы |
|---|----------|---------|-------|
| 01 | CRITICAL | Docker ни разу не запускался успешно | 06, 50 |
| 02 | CRITICAL | mainPhoto -- оригинал не сохраняется, только сжатый JPEG | 21 |
| 03 | HIGH | Иконки соцсетей через Material Symbols вместо Lucide | 46 |
| 04 | HIGH | Нет placeholder-SVG для фото (мужской/женский/нейтральный силуэт) | 30 |
| 05 | HIGH | Загрузка всех persons в память на клиенте (до 200 страниц) | 25, 39, 40, 42, 44 |
| 06 | HIGH | gender: "other" не реализован | 02-50 |
| 07 | MEDIUM | Один слайдер глубины вместо двух (depthUp / depthDown) | 32 |
| 08 | MEDIUM | ELK бандл ~2.6 МБ не вынесен в динамический import | 31 |
| 09 | MEDIUM | Toast-уведомления (sonner) только на WelcomePage | 49 |
| 10 | MEDIUM | Нет Caddyfile в репозитории | 06, 50 |
| 11 | MEDIUM | Нет мобильного / responsive тестирования | все |
| 12 | LOW | Китайский зодиак упрощен (по году, без даты CNY) | 45 |
| 13 | LOW | archiver не добавлен в esbuild externals | 47 |
| 14 | LOW | Нет HTTP -> HTTPS редиректа | 50 |

---

## CRITICAL

### 01. Docker ни разу не запускался успешно

**Где:** Этап 06 прямо говорит: "Docker Desktop не был запущен -- сборка образа завершилась ошибкой подключения к daemon". Этап 50 перечисляет `docker compose build` в проверках, но нигде не подтвержден успешный запуск.

**Риск:** Продакшен-образ может не собраться. Нативные модули (better-sqlite3, bcrypt, sharp) на Alpine часто ломаются. Миграции/seed могут не отработать в контейнере. SPA fallback (serve-static) не проверен в production mode.

**Как исправить:**

```
Задача для Cursor:

1. Запусти docker compose up --build и убедись что контейнер стартует без ошибок.

2. Проверь логи: docker compose logs family-tree
   Ожидается:
   - "Migrations applied" (или аналог)
   - "Admin user created: admin"
   - "Family Tree server running on http://localhost:3000"

3. Проверь endpoints:
   curl http://localhost:3000/health
   curl http://localhost:3000/  (должен вернуть index.html SPA)
   curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"login":"admin","password":"changeme"}'

4. Если better-sqlite3 или bcrypt не собираются на Alpine:
   - Добавь в Dockerfile stage deps: apk add python3 make g++ (уже есть по логу, но проверь)
   - Для sharp: apk add vips-dev (уже есть по логу)
   - Если bcrypt падает: заменить на bcryptjs (чистый JS, без native)

5. Если esbuild externals не покрывают все native модули:
   - Проверь packages/server/package.json build скрипт
   - Убедись что better-sqlite3, bcrypt, sharp, archiver в external

6. Зафиксируй результат в log.
```

---

### 02. mainPhoto -- оригинал не сохраняется

**Где:** Этап 21. Сервис `person-main-photo.service.ts` конвертирует загруженное фото в JPEG (mozjpeg) и сохраняет как `main.jpg`. Оригинал теряется.

**ТЗ говорит:** "Оригинал сохранять без сжатия" (раздел 14.2).

**Как исправить:**

```
Задача для Cursor:

Файл: packages/server/src/services/person-main-photo.service.ts

1. Сохранять оригинал как {personId}/original.{ext} (ext из MIME: jpg/png/webp)
2. Генерировать main.jpg (mozjpeg, resize до 2048px) -- это для отображения
3. Генерировать main_thumb.jpg (300px) -- это для нод дерева и таблиц
4. В поле persons.mainPhoto записывать путь к main.jpg (не к оригиналу)
5. Оригинал НЕ раздается через API -- только для бэкапов

Проверить: загрузить фото, убедиться что в директории {personId}/ лежат 3 файла.
```

---

## HIGH

### 03. Иконки соцсетей через Material Symbols вместо Lucide

**Где:** Этап 46, `ContactsBlock.tsx`. Лог говорит: "круглые кнопки с md-icon + material-symbols-outlined, эвристика иконки по URL/платформе".

**Проблема:** Material Symbols НЕ содержит иконок Telegram, Facebook, Instagram, VK, LinkedIn, WhatsApp, TikTok. Скорее всего используются generic иконки (link, language, chat) -- не информативно для пользователя.

**ТЗ и docs/13-icons.md:** Lucide React для соцсетей: Send (Telegram), Facebook, Instagram, Linkedin, MessageCircle (WhatsApp), Music2 (TikTok). VK -- кастомная SVG.

**Как исправить:**

```
Задача для Cursor:

Файл: packages/client/src/components/person/ContactsBlock.tsx

1. Установить lucide-react если не установлен: pnpm --filter @family-tree/client add lucide-react
2. Импортировать: import { Send, Facebook, Instagram, Linkedin, MessageCircle, Music2 } from 'lucide-react'
3. Маппинг платформ на иконки:
   - telegram -> <Send size={20} />
   - facebook -> <Facebook size={20} />
   - instagram -> <Instagram size={20} />
   - linkedin -> <Linkedin size={20} />
   - whatsapp -> <MessageCircle size={20} />
   - tiktok -> <Music2 size={20} />
   - vk -> кастомная SVG (inline или отдельный файл)
   - phone -> <md-icon>phone</md-icon> (Material Symbol, ОК)
   - email -> <md-icon>mail</md-icon> (Material Symbol, ОК)
   - other -> <md-icon>language</md-icon> (Material Symbol, ОК)
4. Стиль Lucide иконок: color: var(--md-sys-color-on-surface-variant)
5. Не использовать Lucide нигде кроме ContactsBlock.
```

---

### 04. Нет placeholder-SVG для фото

**Где:** Этап 30, `PersonNode.tsx`. Лог говорит: "плейсхолдер фото -- md-icon". Это значит при отсутствии фото рисуется иконка `person` вместо нормального силуэта.

**ТЗ:** "Заглушка: силуэт (мужской/женский на основе gender)" -- то есть полноценные SVG-картинки.

**Как исправить:**

```
Задача для Cursor:

1. Создать 3 SVG-файла в packages/client/public/:
   - placeholder-male.svg    -- мужской силуэт (голова + плечи)
   - placeholder-female.svg  -- женский силуэт
   - placeholder-neutral.svg -- нейтральный силуэт (для gender: "other", будущее)

   Стиль: монохромные, цвет var(--md-sys-color-outline-variant) на прозрачном фоне.
   Размер viewBox: 0 0 96 96. Круглый clip-path.

2. Обновить PersonNode.tsx, DeadPersonNode.tsx, ExternalNode.tsx:
   Вместо <md-icon>person</md-icon> использовать:
   <img src={`/placeholder-${data.gender === 'female' ? 'female' : 'male'}.svg`} />

3. Обновить PersonPage.tsx, AdminPersonsPage.tsx -- аналогично для шапки карточки и таблицы.

4. Проверить: человек без mainPhoto отображает корректный силуэт в дереве и в карточке.
```

---

### 05. Загрузка всех persons в память на клиенте

**Где:**
- Этап 25: AdminRelationshipsPage грузит до 200 страниц по 100 (до 20 000 карточек)
- Этап 39: AlbumPhotoTagPage грузит 500 persons для подписей тегов
- Этап 40: AlbumPage грузит persons для имен в тегах
- Этап 42: AdminUsersPage грузит 500 persons для привязки
- Этап 44: AdminSettingsPage грузит 500 persons для выбора корня

**Проблема:** При 500+ карточках это медленно и жрет память. При 5000+ -- unusable.

**Как исправить:**

```
Задача для Cursor:

Добавить серверный endpoint GET /api/persons/search?q=<query>&limit=15
Возвращает: [{ id, firstName, lastName, mainPhoto }]
Используется для autocomplete (выбор человека в формах).

Заменить массовую загрузку на этот endpoint в:
- RelationshipForm (уже использует поиск, но через полный fetchPersonsList)
- PhotoTagger (поиск для разметки)
- AdminUsersPage (выбор привязки)
- AdminSettingsPage (выбор корня)

Для AdminRelationshipsPage:
- Имена A/B запрашивать с сервера: добавить в GET /api/relationships
  response поля fromPersonName и toPersonName (JOIN на сервере).
  Убрать загрузку 20000 persons на клиенте.
```

---

### 06. gender: "other" не реализован

**Где:** Нигде. Все 50 этапов работают с `"male" | "female"`.

**Как исправить:**

```
Задача для Cursor:

1. packages/shared/src/validation/person.ts:
   genderSchema: z.enum(["male", "female", "other"])

2. packages/server/src/db/schema.ts:
   gender: text("gender", { enum: ["male", "female", "other"] })

3. Сгенерировать миграцию: pnpm --filter @family-tree/server db:generate

4. packages/shared/src/tree-compute.ts (relationship-labels):
   Добавить третью колонку "other" в таблицу паттернов:
   U -> "Родитель", D -> "Ребенок", S -> "Супруг(а)", UD -> "Брат/Сестра" и т.д.

5. packages/client PersonForm.tsx:
   Третья md-radio: "Другое"

6. Placeholder: placeholder-neutral.svg для gender === "other"

7. Тесты: обновить tree-compute.test.ts
```

---

## MEDIUM

### 07. Один слайдер глубины вместо двух

**Где:** Этап 32. Лог: "один слайдер «Глубина (вверх и вниз)» задает оба параметра одинаковым значением".

**ТЗ (docs/08-tree-visualization.md):** depthUp и depthDown -- отдельные параметры. API их принимает раздельно.

**Как исправить:**

```
Файл: packages/client/src/components/tree/TreeControls.tsx

Заменить один md-slider на два:
- "Глубина вверх" -> depthUp (1-10)
- "Глубина вниз" -> depthDown (1-10)

Оба пишут в URL searchParams раздельно.
```

---

### 08. ELK бандл ~2.6 МБ не вынесен в lazy import

**Где:** Этап 31. Лог: "bundled ELK (~2.6 MB JS); при необходимости позже можно вынести в dynamic import".

**Как исправить:**

```
Файл: packages/client/src/components/tree/elk-tree-layout.ts

Заменить:
  import ELK from 'elkjs/lib/elk.bundled.js';
На:
  const ELK = (await import('elkjs/lib/elk.bundled.js')).default;

Vite автоматически вынесет в отдельный chunk.
```

---

### 09. Toast-уведомления только на WelcomePage

**Где:** Этап 49 добавляет sonner, но toast используется только при восстановлении черновика и создании первой карточки.

**Как исправить:**

```
Добавить toast.success / toast.error в:
- AdminPersonsPage: после удаления карточки
- AdminPersonEditPage: после создания / обновления
- AdminRelationshipsPage: после удаления связи
- AdminRelationshipNewPage: после создания связи
- AdminUsersPage: после создания / обновления / удаления пользователя
- AdminSettingsPage: после сохранения настроек
- AdminBackupPage: после создания / удаления бэкапа
- PhotoUploader: после успешной загрузки
- PhotoTagger: после создания / удаления разметки
```

---

### 10. Нет Caddyfile в репозитории

**Где:** docs/11-deployment.md упоминает Caddy и Caddyfile, docker-compose.yml имеет сервис caddy. Но ни один лог не упоминает создание файла Caddyfile.

**Как исправить:**

```
Создать файл Caddyfile в корне:

tree.example.com {
    reverse_proxy family-tree:3000
}

Добавить комментарий: "Замените tree.example.com на ваш домен".
```

---

### 11. Нет мобильного / responsive тестирования

**Где:** ТЗ раздел 15: "Адаптивная верстка для мобильных". Ни один лог не упоминает проверку на мобильных или в DevTools responsive mode.

**Как исправить:**

```
Задача для Cursor:

Проверить в Chrome DevTools (iPhone SE, iPad):
1. LoginPage -- поля и кнопка не выходят за экран
2. Sidebar -- сворачивается или уходит в бургер на < 768px
3. DataTable -- горизонтальный скролл или переформатирование
4. FamilyTree -- зум/пан работает пальцами (touch events)
5. PersonForm -- аккордеоны и поля не вылезают
6. PhotoGallery -- свайп между фото
7. TreeControls -- segmented buttons с overflow-x-auto (уже есть по логу)

Если sidebar не адаптивен -- добавить:
- Бургер-кнопку в header для мобильных
- md-navigation-drawer opened={false} на < 768px
- Закрытие drawer по клику на пункт
```

---

## LOW

### 12. Китайский зодиак упрощен

**Где:** Этап 45. По году, без учета даты Китайского Нового Года.

**Статус:** Задокументировано как MVP-решение в ТЗ. Не блокер. В будущем: таблица дат CNY с 1900 по 2100.

---

### 13. archiver не в esbuild externals

**Где:** Этап 47 добавляет archiver, этап 48 делает бандл backup-cli.js. Не упомянуто что archiver добавлен в esbuild --external.

**Как проверить:** Если build проходит и backup работает в Docker -- проблемы нет. Если падает с "Cannot find module" -- добавить `--external:archiver` в esbuild.

---

### 14. Нет HTTP -> HTTPS редиректа

**Где:** Caddy делает это автоматически при правильной конфигурации. Но если Caddy не настроен (см. пункт 10), сайт доступен по HTTP.

**Как исправить:** После пункта 10 (создание Caddyfile) это решится автоматически.

---

## Порядок исправлений

Рекомендуемый порядок (от критичного к косметическому):

1. **#01** Docker -- без этого нет деплоя
2. **#02** mainPhoto оригинал -- потеря данных
3. **#05** Массовая загрузка persons -- performance
4. **#03** Lucide для соцсетей -- несоответствие ТЗ
5. **#04** Placeholder SVG -- UX
6. **#09** Toast везде -- UX
7. **#06** gender: "other" -- расширение
8. **#07** Два слайдера глубины -- UX
9. **#10** Caddyfile -- деплой
10. **#08** ELK lazy import -- performance
11. **#11** Responsive -- UX
12. **#13** archiver externals -- build
13. **#14** HTTPS -- security
14. **#12** Chinese zodiac -- future
