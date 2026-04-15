# 10 -- Админ-панель

---

## Навигация

Admin видит полный sidebar:

| Пункт | Иконка (Material Symbol) | Путь |
|-------|--------------------------|------|
| Дерево | `account_tree` | /tree |
| Карточки | `person` | /admin/persons |
| Связи | `link` | /admin/relationships |
| Фотоальбомы | `photo_library` | /admin/albums |
| Пользователи | `group` | /admin/users |
| Настройки | `settings` | /admin/settings |
| Бэкапы | `backup` | /admin/backup |

Viewer видит:

| Пункт | Иконка | Путь |
|-------|--------|------|
| Дерево | `account_tree` | /tree |
| Фотоальбомы | `photo_library` | /albums |

Viewer НЕ видит admin-разделов. Кнопки редактирования отсутствуют в DOM (не disabled, а отсутствуют).

---

## Карточки (AdminPersonsPage)

### Таблица

Компонент: `DataTable` (кастомный, TanStack Table + M3 стили).

Колонки:

| Колонка | Ширина | Содержание |
|---------|--------|-----------|
| Фото | 48px | Круглый thumbnail или заглушка |
| Имя | auto | firstName + lastName |
| Пол | 80px | Material Symbol `male` / `female` |
| Дата рождения | 120px | Форматированная дата или "--" |
| Страна | 80px | Emoji-флаг или "--" |
| Статус | 80px | "жив" / год смерти |
| Действия | 96px | `md-icon-button` edit + delete |

Над таблицей:
- `md-outlined-text-field` с иконкой `search` -- поиск по имени
- `md-outlined-select` -- фильтр по стране
- `md-outlined-select` -- фильтр по статусу (все / живые / умершие)

FAB (правый нижний угол, fixed): `md-fab` с иконкой `add` -- "Создать карточку".

Пустое состояние: Material Symbol `person_off` (большой) + текст "Нет карточек. Создайте первую.".

### Форма (AdminPersonEditPage)

URL: `/admin/persons/new` (создание) или `/admin/persons/:id/edit` (редактирование).

React Hook Form + Zod. Одна форма для обоих режимов.

Структура:

```
[Заголовок: "Создание карточки" / "Редактирование: Иван Петров"]

=== ОСНОВНОЕ (всегда видно) ===
[md-outlined-text-field: Имя *]
[md-outlined-text-field: Фамилия *]
[md-radio: Мужской]  [md-radio: Женский]   <- Пол *

=== v Дополнительное имя (аккордеон, свернут) ===
[md-outlined-text-field: Отчество]
[md-outlined-text-field: Девичья фамилия]
+ Локализованные имена:
  [md-outlined-text-field: Язык (en)]  [Имя]  [Фамилия]
  [md-text-button: + Добавить язык]

=== v Даты и места (аккордеон) ===
[md-outlined-text-field type=date: Дата рождения]
[md-outlined-text-field type=date: Дата смерти]
[md-outlined-text-field: Место рождения]
[md-outlined-text-field: Текущее место]
[md-outlined-select: Страна (ISO list)]

=== v Фото (аккордеон) ===
[FileDropzone: Перетащите фото или нажмите для выбора]
[Превью текущего фото, если есть]
[md-text-button: Удалить фото]

=== v Контакты (аккордеон) ===
[md-outlined-text-field: Телефон]
[md-outlined-text-field: Email]
Соцсети:
  [md-outlined-select: Платформа]  [md-outlined-text-field: URL]  [md-icon-button: delete]
  [md-text-button: + Добавить соцсеть]

=== v О человеке (аккордеон) ===
[md-outlined-text-field type=textarea rows=4: Биография]
[md-outlined-text-field: Род занятий]
Хобби:
  [md-chip-set: md-input-chip для каждого хобби, removable]
  [md-outlined-text-field: Новое хобби]  [md-icon-button: add]

=== v Медицинское (аккордеон) ===
[md-outlined-select: Группа крови (A+, A-, B+, B-, AB+, AB-, O+, O-)]

=== v Дополнительные поля (аккордеон) ===
[md-outlined-text-field: Ключ]  [md-outlined-text-field: Значение]  [md-icon-button: delete]
[md-text-button: + Добавить поле]

=== Действия ===
[md-filled-button: Сохранить]  [md-outlined-button: Отмена]
```

При создании после сохранения: `md-dialog` "Добавить связи?" с вариантами "Да" (переход к RelationshipForm) / "Позже".

---

## Связи (AdminRelationshipsPage)

### Таблица

Колонки:

| Колонка | Содержание |
|---------|-----------|
| Тип | "Родитель" / "Супруги" |
| Человек A | Имя + фамилия + мини-аватар |
| Человек B | Имя + фамилия + мини-аватар |
| Дата свадьбы | Для spouse, иначе "--" |
| Статус | "Текущий брак" / "Бывший" / "--" |
| Действия | edit (spouse meta) + delete |

FAB: `md-fab` + `add` -- "Создать связь".

### Визуальный помощник (RelationshipForm)

```
=== Шаг 1: Первый человек ===
[md-outlined-text-field: Поиск по имени...]
  -> md-menu с результатами
  -> Выбран: [аватар] Иван Петров

=== Шаг 2: Тип связи ===
[md-radio name=type: Родитель -> Ребенок]
[md-radio name=type: Супруги]

=== Шаг 3: Второй человек ===
[md-outlined-text-field: Поиск по имени...]
  -> Выбран: [аватар] Ольга Иванова

=== Для parent ===
Кто родитель?
[md-radio: Иван]  [md-radio: Ольга]

=== Для spouse ===
[md-outlined-text-field type=date: Дата свадьбы]
[md-outlined-text-field type=date: Дата развода]
[md-checkbox: Текущий брак]
[md-outlined-text-field: Комментарий]

=== Предупреждения (если есть) ===
md-icon warning + "У Ольги уже указан отец"

[md-filled-button: Создать связь]  [md-outlined-button: Отмена]
```

---

## Пользователи (AdminUsersPage)

### Таблица

Колонки: Логин, Роль, Статус, Привязанная карточка, Создан, Последний вход, Действия.

### Создание (md-dialog)

```
[md-outlined-text-field: Логин *]
[md-outlined-text-field type=password: Пароль *]
[md-outlined-select: Привязать к карточке (опционально)]
-> Роль: всегда viewer (admin только один)
[md-filled-button: Создать]
```

### Действия

- Сменить пароль (md-dialog с полем нового пароля)
- Деактивировать / Активировать (md-switch в строке таблицы)
- Удалить (md-dialog подтверждения)

---

## Настройки (AdminSettingsPage)

```
[md-outlined-text-field: Название сервиса]
[md-outlined-text-field + autocomplete: Корневой человек (по умолчанию)]

=== Дерево ===
[md-slider labeled: Глубина вверх (1-10, default 3)]
[md-slider labeled: Глубина вниз (1-10, default 3)]
[md-switch: Показывать внешние ветки по умолчанию]
[md-slider labeled: Глубина внешних веток (1-5, default 2)]

=== Безопасность ===
[md-slider labeled: Время жизни сессии, дней (1-90, default 30)]

=== Оформление ===
[Color picker: Акцентный цвет (default #3B82F6)]

[md-filled-button: Сохранить]
```

---

## Бэкапы (AdminBackupPage)

```
[md-fab: Создать бэкап]  <- При клике: md-linear-progress, затем toast "Бэкап создан"

Таблица:
| Файл | Размер | Дата создания | Действия |
| backup-2026-04-13_03-00-00.tar.gz | 45 МБ | 13.04.2026 03:00 | [download] [delete] |
```

Автобэкап: cron в Docker, ежедневно 03:00, хранение 30 штук.
