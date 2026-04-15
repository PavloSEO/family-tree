# 04 -- Маппинг компонентов на UI

---

Каждый элемент интерфейса привязан к конкретному MW-компоненту или помечен как кастомный.

## Страница логина

| Элемент | Компонент |
|---------|----------|
| Поле логина | `md-outlined-text-field` label="Логин" |
| Поле пароля | `md-outlined-text-field` type="password" label="Пароль" |
| Чекбокс "Запомнить" | `md-checkbox` + `<label>` |
| Кнопка "Войти" | `md-filled-button` |
| Иконка в кнопке | `md-icon` slot="icon" -- `login` |
| Сообщение об ошибке | `md-outlined-text-field` error + error-text |
| Заголовок | CSS-класс `md-typescale-headline-medium` |

## Sidebar (боковая навигация)

| Элемент | Компонент |
|---------|----------|
| Контейнер | `md-navigation-drawer` (labs) |
| Список пунктов | `md-list` |
| Пункт меню | `md-list-item` type="button" + `md-icon` slot="start" |
| Разделитель | `md-divider` |
| Активный пункт | CSS: фон `--md-sys-color-secondary-container` |
| Имя пользователя | CSS-класс `md-typescale-label-medium` |
| Кнопка "Выйти" | `md-text-button` |

### Иконки для пунктов меню

| Пункт | Material Symbol |
|-------|----------------|
| Дерево | `account_tree` |
| Карточки | `person` |
| Связи | `link` |
| Фотоальбомы | `photo_library` |
| Пользователи | `group` |
| Настройки | `settings` |
| Бэкапы | `backup` |

## Дерево (TreePage)

| Элемент | Компонент |
|---------|----------|
| Canvas графа | `@xyflow/react` ReactFlow |
| Нода (человек) | Кастомный React Flow node (см. `docs/08-tree-visualization.md`) |
| Ребро (parent) | React Flow default edge, сплошная линия |
| Ребро (spouse) | Кастомный React Flow edge, двойная линия |
| Панель режимов | `md-outlined-segmented-button-set` (labs) |
| Кнопка режима | `md-outlined-segmented-button` (labs) |
| Фильтр по стране | `md-outlined-select` |
| Фильтр по статусу | `md-outlined-select` |
| Поиск по имени | `md-outlined-text-field` с иконкой `search` |
| Ползунок глубины | `md-slider` labeled |
| Кнопка "Сбросить" | `md-icon-button` -- `restart_alt` |
| Мини-карта | React Flow MiniMap |
| Зум-контролы | React Flow Controls |

## Карточка (PersonPage)

| Элемент | Компонент |
|---------|----------|
| Контейнер карточки | `md-elevated-card` (labs) |
| Фото (аватар) | `<img>` с CSS `border-radius: 50%` |
| Имя и фамилия | CSS `md-typescale-headline-medium` |
| Даты жизни | CSS `md-typescale-body-medium` |
| Разделитель секций | `md-divider` |
| Заголовок секции | CSS `md-typescale-title-medium` |
| Хобби-теги | `md-chip-set` + `md-filter-chip` (read-only) |
| Соц-ссылки | `md-icon-button` с иконками платформ |
| Ссылка на родственника | `md-list-item` type="link" с аватаром |
| Кнопка "Редактировать" | `md-fab` size="small" -- `edit` (admin only) |

### Иконки соцсетей (Lucide, т.к. нет в Material Symbols)

| Платформа | Lucide icon |
|-----------|-------------|
| telegram | `Send` |
| facebook | `Facebook` |
| instagram | `Instagram` |
| vk | Кастомная SVG |
| linkedin | `Linkedin` |
| whatsapp | `MessageCircle` |
| tiktok | `Music2` |
| phone | Material Symbol `phone` |
| email | Material Symbol `mail` |
| website | Material Symbol `language` |

## Админ: таблицы данных

| Элемент | Компонент |
|---------|----------|
| Таблица | Кастомный `DataTable` (TanStack Table + M3 стили, см. `docs/16-custom-components.md`) |
| Заголовок столбца | Кастомный, CSS `md-typescale-title-small` |
| Ячейка | Кастомный, CSS `md-typescale-body-medium` |
| Сортировка | `md-icon-button` -- `arrow_upward` / `arrow_downward` |
| Пагинация | Кастомный блок: `md-icon-button` (prev/next) + текст |
| Пустое состояние | Кастомный: `md-icon` (large) + текст |
| Кнопка "Создать" | `md-fab` (primary, fixed bottom-right) -- `add` |
| Кнопка "Редактировать" | `md-icon-button` -- `edit` |
| Кнопка "Удалить" | `md-icon-button` -- `delete` |
| Строка поиска | `md-outlined-text-field` -- `search` |

## Админ: формы

| Элемент | Компонент |
|---------|----------|
| Текстовое поле | `md-outlined-text-field` |
| Textarea | `md-outlined-text-field` type="textarea" rows="4" |
| Выпадающий список | `md-outlined-select` + `md-select-option` |
| Радио-кнопки (пол) | `md-radio` + `<label>` |
| Чекбокс | `md-checkbox` |
| Тоггл | `md-switch` |
| Ползунок | `md-slider` |
| Теги (хобби) | `md-chip-set` + `md-input-chip` (removable) |
| Кнопка "Сохранить" | `md-filled-button` |
| Кнопка "Отмена" | `md-outlined-button` |
| Аккордеон секции | Кастомный (см. `docs/16-custom-components.md`) |
| Загрузка файла | Кастомный `FileDropzone` (см. `docs/16-custom-components.md`) |
| Прогресс загрузки | `md-linear-progress` |

## Диалоги

| Элемент | Компонент |
|---------|----------|
| Подтверждение удаления | `md-dialog` с slot="headline", slot="content", slot="actions" |
| Создание пользователя | `md-dialog` с формой внутри |
| Предупреждение (валидация) | `md-dialog` |

## Уведомления (Toast)

| Элемент | Компонент |
|---------|----------|
| Успех | sonner (стилизованный под M3: `--md-sys-color-primary-container`) |
| Ошибка | sonner (стилизованный: `--md-sys-color-error-container`) |

## Фотогалерея

| Элемент | Компонент |
|---------|----------|
| Сетка альбомов | CSS Grid + `md-elevated-card` (labs) |
| Лайтбокс | yet-another-react-lightbox |
| Разметка людей | Canvas overlay (кастомный) |
| Иконка закрытия | `md-icon-button` -- `close` |
| Навигация | `md-icon-button` -- `chevron_left` / `chevron_right` |
